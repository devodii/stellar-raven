#!/usr/bin/env node
/**
 * Build a PII-safe replay lane from search queries emitted by eval answering
 * agents. Raw user traffic is never an input: sources must be agentic eval
 * result JSONs whose questions already come from committed eval cases.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadDiscoveryCases, sha256, writeResult } from "./lib.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CASES = path.join(DIR, "cases.json");
const DEFAULT_OUTPUT = path.join(DIR, "mined-lumenloop-queries.json");
const TARGET_POOL = "lumenloop-agentic-misses";

const ENTITY_TERMS = {
  "q-asset-rwa-tokenized-freshness": ["rwa", "real world asset", "real-world asset", "tokenized asset"],
  "q-defi-aquarius-what-is": ["aquarius", "aqua"],
  "q-defi-comet-content": ["comet"],
  "q-defi-phoenix-scf": ["phoenix"],
  "q-defi-rwa-overview": ["rwa", "real world asset", "real-world asset", "tokenized asset"],
  "q-defi-soroswap-what-is": ["soroswap"],
  "q-eco-lobstr-wallet": ["lobstr"],
  "q-edge-fresh-latest-blend-tvl": ["blend"]
};

const CAPABILITY_TERMS = [
  "article",
  "content",
  "directory",
  "funding",
  "growth",
  "history",
  "market",
  "metric",
  "project",
  "report",
  "research",
  "scf",
  "stats",
  "trend",
  "tvl",
  "value",
  "wallet",
  "what is",
  "who built"
];

const argValues = (flag) => {
  const values = [];
  for (let index = 0; index < process.argv.length; index += 1) {
    if (process.argv[index] === flag && process.argv[index + 1]) values.push(process.argv[index + 1]);
  }
  return values;
};

const argValue = (flag) => argValues(flag).at(-1);

function caseIdFromRef(ref) {
  return ref.match(/#(q-[^)\s]+)/)?.[1] ?? null;
}

function hasAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

export function classifyRegister(query, caseId) {
  const text = query.toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  const entity = hasAny(text, ENTITY_TERMS[caseId] ?? []);
  const capability = hasAny(text, CAPABILITY_TERMS);
  if (entity && capability) return "mixed";
  if (entity) return "entity-only";
  return "capability";
}

function assertSafeQuery(query, source) {
  if (query.length < 2 || query.length > 500) throw new Error(`${source}: query length outside 2-500`);
  if (/[A-Z2-7]{56}/.test(query) || /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/.test(query)) {
    throw new Error(`${source}: query resembles a secret key or email; refusing to emit replay lane`);
  }
}

function main() {
  const sources = argValues("--source").map((source) => path.resolve(source));
  if (!sources.length) throw new Error("pass one or more --source eval/agentic/results/<file>.json values");
  const casesPath = path.resolve(argValue("--cases") ?? DEFAULT_CASES);
  const outPath = path.resolve(argValue("--out") ?? DEFAULT_OUTPUT);
  const { cases } = loadDiscoveryCases(casesPath);
  const targets = cases.filter((c) => c.seed?.pool === TARGET_POOL);
  const byAgenticId = new Map();
  for (const c of targets) {
    const agenticId = caseIdFromRef(c.seed.ref);
    if (!agenticId) throw new Error(`cannot derive agentic id from ${c.seed.ref}`);
    byAgenticId.set(agenticId, c);
  }

  const provenance = [];
  const occurrences = [];
  for (const sourcePath of sources) {
    const raw = readFileSync(sourcePath, "utf8");
    const result = JSON.parse(raw);
    if (!Array.isArray(result.rows)) throw new Error(`${sourcePath} has no rows[]`);
    const sourceName = path.basename(sourcePath);
    provenance.push({ file: sourceName, sha256: sha256(raw), ranAt: result.ranAt ?? result.meta?.startedAt ?? null });
    for (const row of result.rows) {
      const c = byAgenticId.get(row.caseId);
      if (!c) continue;
      const queries = row.verdict?.queriesUsed;
      if (!Array.isArray(queries)) continue;
      for (const [queryIndex, rawQuery] of queries.entries()) {
        const query = String(rawQuery).replace(/\s+/g, " ").trim();
        assertSafeQuery(query, `${sourceName}#${row.caseId}/${queryIndex}`);
        occurrences.push({
          id: `${sourceName.replace(/\.json$/, "")}:${row.caseId}:${row.effort ?? "unknown"}:${queryIndex + 1}`,
          caseId: c.id,
          agenticCaseId: row.caseId,
          effort: row.effort ?? null,
          source: sourceName,
          queryIndex: queryIndex + 1,
          query,
          register: classifyRegister(query, row.caseId),
          expectedFamilies: c.expectedFamilies,
          acceptableOps: c.acceptableOps
        });
      }
    }
  }
  if (!occurrences.length) throw new Error("no target query occurrences found in sources");

  const register = Object.fromEntries(
    ["mixed", "entity-only", "capability"].map((kind) => [kind, occurrences.filter((row) => row.register === kind).length])
  );
  const caseCounts = Object.fromEntries(
    targets.map((c) => [c.id, occurrences.filter((row) => row.caseId === c.id).length])
  );
  writeResult(outPath, {
    schemaVersion: 1,
    generatedAt: "2026-07-10",
    sourcePolicy: "agent-generated search queries from committed eval questions only; no raw user traffic",
    targetPool: TARGET_POOL,
    provenance,
    summary: {
      occurrenceCount: occurrences.length,
      caseCount: targets.length,
      register,
      mixedPct: Number(((100 * register.mixed) / occurrences.length).toFixed(1)),
      caseCounts
    },
    occurrences
  });
  console.log(`mined ${occurrences.length} query occurrences -> ${outPath}`);
  console.log(JSON.stringify({ register, mixedPct: Number(((100 * register.mixed) / occurrences.length).toFixed(1)) }));
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
