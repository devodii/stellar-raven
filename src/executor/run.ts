/**
 * Execute runner — wires @cloudflare/codemode's DynamicWorkerExecutor
 * (research/codemode.md §2) to the sandbox surface from providers.ts.
 *
 * WORKER-ONLY MODULE: `@cloudflare/codemode`'s main entry imports
 * `cloudflare:workers`, so this file must only be imported from src/server.ts
 * (never from src/mcp/tools.ts, which unit tests load under plain Node).
 * The import works fine inside the Worker — verified against 0.4.2 — so we
 * use the shipped executor rather than a hand-rolled loader: it already does
 * module synthesis, console capture, per-namespace Proxy dispatch, JSON+
 * binary codec, eager isolate disposal, and `globalOutbound: null`.
 *
 * Sandbox contract per call:
 *  - fresh isolate via env.LOADER.load() (one-shot; billing note PLAN §1)
 *  - globalOutbound: null → fetch()/connect() throw (secrets stay host-side)
 *  - 60s wall-clock timeout inside the sandbox
 *  - result = the value returned by the model's async arrow function
 *  - console.* buffered and returned as logs
 *
 * Output hygiene (PLAN §4): per-call results are already redacted in the
 * providers; the FINAL result + logs are redacted again and truncated to
 * ~6k tokens with an actionable footer before crossing the tool boundary.
 * Known limitation: codemode's executor doesn't expose Worker `limits`
 * ({cpuMs, subRequests}) — we rely on its timeout + plan defaults.
 */
import { tracing } from "cloudflare:workers";
import { DynamicWorkerExecutor } from "@cloudflare/codemode";
import superSpecJson from "../../specs/super-spec.json";
import bundleJson from "../skills/bundle.json";
import { getCatalog } from "../catalog/load.ts";
import { buildSandbox, type ArtifactReadStats, type OpLedgerCall, type SandboxProvider } from "./providers.ts";
import {
  createSpecSandboxCode,
  sandboxResponseText,
  serializeSpecForSandbox
} from "./spec-sandbox.ts";
import type { SkillBundle } from "../skills/store.ts";
import { redactSecrets, secretsFromEnv } from "../policy/redact.ts";
import { truncateForModel, modelBoundaryMaxTokensFromEnv } from "../policy/truncate.ts";
import {
  buildSourceBasisManifest,
  sanitizeCanonicalUrls,
  sourceBasisShapeFromTruncation,
  type BuildSourceBasisManifestInput,
  type SourceBasisArtifact
} from "../policy/source-basis.ts";
import { shapeLogs } from "./shape-logs.ts";
import { put as putArtifact, type ArtifactMime } from "../artifacts/store.ts";
import { logArtifactWrite } from "../observability.ts";

export type ExecuteOperationSummary = {
  total: number;
  ok: number;
  error: number;
  softEmpty: number;
};

export type ExecuteEvidenceSummary = {
  kind: "service-data" | "service-inconclusive" | "skill-content" | "artifact-data" | "none";
  skillRead: boolean;
  skillRuns: number;
  artifactReads: number;
};

export type ExecuteOutcome =
  | {
      ok: true;
      result: string;
      truncated: boolean;
      logs: string[];
      /** Compact host-observed service-call outcomes; never includes payload data. */
      operationSummary?: ExecuteOperationSummary;
      /** Host-owned evidence classification; never inspects model-authored payload text. */
      evidenceSummary?: ExecuteEvidenceSummary;
      resultOriginalChars?: number;
      resultReturnedChars?: number;
      resultMaxTokens?: number;
      resultMaxChars?: number;
      resultApproxOriginalTokens?: number;
      sourceBasis?: BuildSourceBasisManifestInput;
      artifactReadCount?: number;
      artifactReadBytes?: number;
    }
  | {
      ok: false;
      error: string;
      logs: string[];
      /** Calls completed before the sandbox failed, summarized without payload data. */
      operationSummary?: ExecuteOperationSummary;
      /** Host-owned evidence classification; never inspects model-authored payload text. */
      evidenceSummary?: ExecuteEvidenceSummary;
      artifactReadCount?: number;
      artifactReadBytes?: number;
    };

export type ExecuteCallContext = {
  /** Auth-bound artifact owner: OAuth subject or fixed loopback-dev owner. Undefined disables artifacts. */
  artifactOwner?: string;
  requestId?: string;
  rayId?: string;
};

export type ExecuteRunner = (code: string, context?: ExecuteCallContext) => Promise<ExecuteOutcome>;
export type ExecuteRunnerOptions = {
  /**
   * Enable codemode.search/catalog/spec/describe. Production MCP and the
   * playground enable the full discovery surface; focused tests may disable it.
   */
  codemodeDiscovery?: boolean;
  /** Allow codemode.describe(id) even when broader codemode discovery is off. */
  codemodeDescribe?: boolean;
  /**
   * Host-side model boundary cap for final execute results. Defaults from
   * env/config; never controlled by model-authored sandbox code.
   */
  modelBoundaryMaxTokens?: number;
};

function summarizeOperationLedger(calls: readonly OpLedgerCall[]): ExecuteOperationSummary {
  const summary: ExecuteOperationSummary = { total: calls.length, ok: 0, error: 0, softEmpty: 0 };
  for (const call of calls) {
    if (call.outcome === "ok") summary.ok += 1;
    else if (call.outcome === "error") summary.error += 1;
    else summary.softEmpty += 1;
  }
  return summary;
}

export type SpecSearchOutcome =
  | { ok: true; result: string }
  | { ok: false; error: string };

export type SpecSearchRunner = (code: string) => Promise<SpecSearchOutcome>;

const EXECUTE_TIMEOUT_MS = 60_000;

function serializedResult(value: unknown): { body: string; mime: ArtifactMime } {
  if (typeof value === "string") return { body: value, mime: "text/plain; charset=utf-8" };
  if (value === undefined) return { body: "undefined", mime: "application/x.raven.undefined" };
  try {
    return { body: JSON.stringify(value), mime: "application/json" };
  } catch (e) {
    return {
      body: `[unserializable result: ${e instanceof Error ? e.message : String(e)}]`,
      mime: "text/plain; charset=utf-8"
    };
  }
}

function collectCanonicalUrlCandidates(value: unknown): string[] {
  const out: string[] = [];
  const seen = new Set<unknown>();
  const visit = (v: unknown, depth: number) => {
    if (out.length >= 20 || depth > 5) return;
    if (typeof v === "string") {
      if (v.includes("https://")) out.push(v);
      return;
    }
    if (v === null || typeof v !== "object" || seen.has(v)) return;
    seen.add(v);
    if (Array.isArray(v)) {
      for (const item of v.slice(0, 50)) visit(item, depth + 1);
      return;
    }
    for (const [key, item] of Object.entries(v as Record<string, unknown>)) {
      if (out.length >= 20) break;
      if (/url|uri|link|website|repo/i.test(key)) visit(item, depth + 1);
    }
  };
  visit(value, 0);
  return out;
}

/**
 * Mirror @cloudflare/codemode's withGlobalsHint (dist/index.js): a sandbox
 * `ReferenceError` usually means the model invented a global — append the real
 * sandbox globals so the retry is informed instead of another guess. The
 * global names are derived from the wired provider set (never hard-coded) so
 * they cannot drift from what the sandbox actually exposes. Applied before
 * redaction/truncation so those still run last. Deviates from upstream's
 * wording by one clause — "and standard JavaScript" — because
 * EXECUTE_DESCRIPTION's globals rule includes it; without the clause the two
 * surfaces contradict on whether builtins (console, Promise, Math…) exist.
 */
function withGlobalsHint(message: string, providers: SandboxProvider[]): string {
  if (!/\bis not defined\b/.test(message)) return message;
  return `${message} (the only globals available in the sandbox are: ${providers
    .map((p) => p.name)
    .join(", ")}, and standard JavaScript)`;
}

export function createExecuteRunner(env: Env, options: ExecuteRunnerOptions = {}): ExecuteRunner {
  const executor = new DynamicWorkerExecutor({
    loader: env.LOADER,
    globalOutbound: null, // default, pinned explicitly: sandbox has NO network
    timeout: EXECUTE_TIMEOUT_MS
  });
  const secrets = secretsFromEnv(env as unknown as Record<string, unknown>);
  const modelBoundaryMaxTokens =
    options.modelBoundaryMaxTokens ?? modelBoundaryMaxTokensFromEnv(env as unknown as Record<string, unknown>);

  return async (code: string, context: ExecuteCallContext = {}): Promise<ExecuteOutcome> => {
    // Providers are rebuilt per run so the skill-read flag is run-scoped
    // (never leaks across concurrent executes); the expensive derivations
    // (catalog view, resolved spec) are cached module-level in providers.ts.
    // The flag is ADVICE-ONLY: it may change the truncation footer's wording,
    // never the token budget or which result bytes are kept.
    let skillRead = false;
    // Count of skill.run dispatches this run (attempted, whatever the
    // outcome) — stamped on the codemode.execute span below so runnable-skill
    // usage is visible in the trace waterfall; per-run outcomes live in the
    // skill_run log events the host dispatch emits (design §8).
    let skillRuns = 0;
    const opLedger: OpLedgerCall[] = [];
    let artifactReadStats: ArtifactReadStats = { count: 0, bytes: 0 };
    const providers = buildSandbox(getCatalog(), bundleJson as SkillBundle, env, {
      superSpec: superSpecJson,
      onSkillRead: () => {
        skillRead = true;
      },
      onSkillRun: () => {
        skillRuns += 1;
      },
      onOpCall: (call) => {
        opLedger.push(call);
      },
      artifact: {
        bucket: env.ARTIFACTS,
        owner: context.artifactOwner,
        onReadStats: (stats) => {
          artifactReadStats = stats;
        }
      },
      codemodeDiscovery: options.codemodeDiscovery,
      codemodeDescribe: options.codemodeDescribe
    });
    // Custom span because the Worker Loader isolate is NOT auto-instrumented
    // (research/observability-cloudflare.md §2) — without it the sandbox run
    // is invisible in the trace waterfall between the handler span and the
    // adapter fetch spans. No-op when tracing is off/unsampled; ends on throw.
    const outcome = await tracing.enterSpan("codemode.execute", async (span) => {
      span.setAttribute("code.chars", code.length);
      const result = await executor.execute(code, providers);
      span.setAttribute("sandbox.ok", result.error === undefined);
      span.setAttribute("sandbox.logLines", result.logs?.length ?? 0);
      span.setAttribute("sandbox.skillRead", skillRead);
      span.setAttribute("sandbox.skillRun", skillRuns);
      span.setAttribute("sandbox.artifactReadCount", artifactReadStats.count);
      span.setAttribute("sandbox.artifactReadBytes", artifactReadStats.bytes);
      return result;
    });
    const logs = shapeLogs(outcome.logs, secrets);
    const operationSummary = summarizeOperationLedger(opLedger);
    const evidenceSummary: ExecuteEvidenceSummary = {
      kind:
        operationSummary.ok > 0
          ? "service-data"
          : operationSummary.total > 0
            ? "service-inconclusive"
            : artifactReadStats.count > 0
              ? "artifact-data"
              : skillRead
                ? "skill-content"
                : "none",
      skillRead,
      skillRuns,
      artifactReads: artifactReadStats.count
    };
    if (outcome.error !== undefined) {
      const hinted = withGlobalsHint(outcome.error, providers);
      return {
        ok: false,
        error: redactSecrets(hinted, secrets),
        logs,
        operationSummary,
        evidenceSummary,
        artifactReadCount: artifactReadStats.count,
        artifactReadBytes: artifactReadStats.bytes
      };
    }
    const redactedResult = redactSecrets(outcome.result, secrets);
    const result = truncateForModel(redactedResult, modelBoundaryMaxTokens, {
      skillSectionAdvice: skillRead
    });
    let text = result.text;
    let sourceBasis: BuildSourceBasisManifestInput | undefined;
    if (result.truncated) {
      let artifact: SourceBasisArtifact = { state: "absent", reason: "unavailable" };
      const serialized = serializedResult(redactedResult);
      const writeStart = Date.now();
      if (context.artifactOwner) {
        try {
          const written = await putArtifact(env.ARTIFACTS, context.artifactOwner, {
            body: serialized.body,
            mime: serialized.mime,
            requestId: context.requestId,
            rayId: context.rayId,
            capTokens: result.maxTokens,
            originalChars: result.originalChars,
            opLedger: opLedger.map((call) => ({
              op: call.op,
              status: call.outcome,
              ms: call.ms
            })),
            catalogGeneratedAt: getCatalog().generatedAt
          });
          if (written.ok) {
            artifact = {
              state: "available",
              id: written.artifact.id,
              sha256: written.artifact.sha256,
              bytes: written.artifact.bytes,
              expiresAt: written.artifact.expiresAt
            };
            await logArtifactWrite({
              owner: context.artifactOwner,
              bytes: written.artifact.bytes,
              ms: Date.now() - writeStart,
              ok: true
            });
          } else {
            artifact = { state: "skipped", reason: written.skipped };
            await logArtifactWrite({
              owner: context.artifactOwner,
              bytes: written.bytes,
              ms: Date.now() - writeStart,
              ok: false,
              skipped: written.skipped
            });
          }
        } catch (e) {
          await logArtifactWrite({
            owner: context.artifactOwner,
            bytes: serialized.body.length,
            ms: Date.now() - writeStart,
            ok: false,
            error: e instanceof Error ? e.name : "error"
          });
          artifact = { state: "absent", reason: "unavailable" };
        }
      } else {
        await logArtifactWrite({
          bytes: serialized.body.length,
          ms: Date.now() - writeStart,
          ok: false,
          skipped: "unavailable"
        });
      }
      sourceBasis = {
        shape: sourceBasisShapeFromTruncation(redactedResult, result),
        calls: opLedger,
        canonicalUrls: sanitizeCanonicalUrls(collectCanonicalUrlCandidates(redactedResult)),
        artifact,
        skillSectionAdvice: skillRead
      };
      text = `${result.text.slice(0, result.maxChars)}\n${buildSourceBasisManifest(sourceBasis)}`;
    }
    return {
      ok: true,
      result: text,
      truncated: result.truncated,
      logs,
      operationSummary,
      evidenceSummary,
      resultOriginalChars: result.originalChars,
      resultReturnedChars: text.length,
      resultMaxTokens: result.maxTokens,
      resultMaxChars: result.maxChars,
      resultApproxOriginalTokens: result.approxOriginalTokens,
      sourceBasis,
      artifactReadCount: artifactReadStats.count,
      artifactReadBytes: artifactReadStats.bytes
    };
  };
}

// Serialized once per isolate — each search call injects ~180KB of spec JSON
// into its sandbox source (upstream re-stringifies per call; identical bytes).
let cachedSerializedSpec: string | undefined;
function getSerializedSpec(): string {
  cachedSerializedSpec ??= serializeSpecForSandbox(superSpecJson);
  return cachedSerializedSpec;
}

/**
 * The code-shaped spec-search runner — NOT registered as a top-level tool
 * since ADR-0001 (research/decisions/0001-search-tool-shape.md): the shipped
 * `search` is the host-side ranked query, and discovery-in-code lives inside
 * `execute` (codemode.spec()/search/catalog). Kept so a code-shaped tool can
 * be re-exposed for future A/Bs (eval/qa/run-qa.mjs --search-tool).
 *
 * Mirrors openApiMcpServer's search tool:
 * LLM code wrapped by createSpecSandboxCode (codemode.spec() over the super
 * spec, in-sandbox truncation), executed in a fresh Dynamic Worker with NO
 * providers (search is read-only over spec data; no service calls, no
 * secrets), result passed through sandboxResponseText host-side. Logs are
 * deliberately dropped — upstream's search ignores them too.
 */
export function createSpecSearchRunner(env: Env): SpecSearchRunner {
  const executor = new DynamicWorkerExecutor({
    loader: env.LOADER,
    globalOutbound: null, // no network in the search sandbox either
    timeout: EXECUTE_TIMEOUT_MS
  });

  return async (code: string): Promise<SpecSearchOutcome> => {
    const outcome = await tracing.enterSpan("codemode.spec_search", async (span) => {
      span.setAttribute("code.chars", code.length);
      const result = await executor.execute(createSpecSandboxCode(code, getSerializedSpec()), []);
      span.setAttribute("sandbox.ok", result.error === undefined);
      return result;
    });
    if (outcome.error !== undefined) {
      return { ok: false, error: outcome.error };
    }
    return { ok: true, result: sandboxResponseText(outcome.result) };
  };
}
