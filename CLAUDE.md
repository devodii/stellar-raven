# CLAUDE.md — stellar-raven-codemode

**What this is:** a single remote MCP server (Cloudflare Workers) exposing two tools — `search`
and `execute` — over a unified catalog covering Lumenloop, Stellar Light/Scout, the Stellar Docs
(Algolia), and a selectively-exposed skills directory. `execute` runs LLM-authored JS in a Dynamic
Worker isolate with **no network**; all service traffic goes through host-side adapters that hold
secrets and enforce policy.

**Start here:** [`PLAN.md`](./PLAN.md) — architecture, catalog design, skills model, phases
(§7 status note = current truth on what's shipped/deferred); then
[`ARCHITECTURE.md`](./ARCHITECTURE.md) — how `search`/`execute` actually work end to end
(auth gates, scoring pipeline, sandbox, envelope, skill splitting), code-verified.

**Deployed:** live since 2026-07-02; default route https://raven.stellar.buzz, with
https://agents.stellar.buzz served as an alias (both in `wrangler.jsonc` routes) (worker
`stellar-raven-codemode`, "Ecosystem - Stellar" CF account). WorkOS OAuth + admin-token/local
bypasses — design in `research/auth-workos.md`, connection guide in [`README.md`](./README.md).
CI + daily live-drift refresh: github.com/kalepail/stellar-raven Actions (repo renamed from
stellar-raven-codemode 2026-07-02). Work is
coordinated via Solo MCP project 49 (todos + scratchpads; backlog items tracked there).

## Research docs (current truth, live-verified; refresh before trusting)

- `research/services/lumenloop.md` — 21 tools, envelope, quirks (partner items hidden from
  `/v1/tools` — union with `/v1/me`), `/v1/changelog` drift feed. Key: `LUMENLOOP_API_KEY` in
  `.env` (local) / Worker secret (deployed). **Never print or commit the key.**
- `research/services/stellar-light.md` — keyless, 23 paths / 24 ops (2026-07-02 partner-pipeline
  release), `/api/openapi.json` + `/api/status` + `/api/changelog` self-description.
- `research/services/stellar-docs-algolia.md` — docs search is **direct Algolia REST** (app
  `VNSJF5AWIZ`, index `crawler_Stellar Docs - Docusaurus`; dedicated search key in `.env` as
  `ALGOLIA_APPLICATION_ID`/`ALGOLIA_API_KEY`, mirrored to Worker secrets). The MCP endpoint
  (`stellar-docs-mcp.md`) is fallback only.
- `research/codemode.md` — `@cloudflare/codemode` internals, DynamicWorkerExecutor, Worker Loader
  binding, McpAgent vs `createMcpHandler`, security/egress model.
- `research/observability-cloudflare.md` — CF observability survey: Workers Logs, Traces (beta;
  Worker Loader NOT auto-instrumented — custom spans via `tracing.enterSpan`), OTel export,
  telemetry query API, GraphQL metrics. What we enabled and why. For live production log/trace
  reviews, use `.claude/skills/cloudflare-observability-review/SKILL.md`.
- `research/prior-art.md` — map of `../stellar-raven-next` / `../stellar-raven`. **Learn, don't
  clone:** those repos are references, not templates — design this project's own types, formats,
  and adapters; take their *content* (skills mirror, golden corpus) and *lessons* (ADR pitfalls),
  not their code or schemas by default.

## Rules

- **Model code never owns endpoints/args/auth** — everything validates against the catalog
  manifest.
- **The manifest IS the exposed surface (ADR-0003,
  `research/decisions/0003-build-time-exposure-filtering.md`)** — exposure is filtered at
  BUILD time; exclusions are exact-match data in `scripts/exposure.mjs` (shared by every
  emitter, with fail-loud drift guards in `scripts/build-catalog.mjs`), never runtime policy,
  never prose. Consumers are never told what the gateway cannot do — emitted text must not
  reference a non-exposed op or retired skill (`assertNoNonExposedRefs` breaks the build on it).
- Exact-match guards on skill/tool id resolution; no fuzzy top-hit acceptance, no aliases.
- Soft-empty ≠ error ≠ data — keep per-service normalizers.
- The paid Lumenloop research lane is not emitted at all — the `request_research` trigger AND
  its read half (`research_result`, `list_my_research`; account-scoped dead ends without the
  trigger). Enabling it = remove all three exclusions (`scripts/exposure.mjs`) AND ship the
  budget gate + dedup in the same change. `list_research` (public editorial pieces) stays.
- Secrets host-side only; sandbox keeps `globalOutbound: null`.
- Generated artifacts (`catalog/manifest.json`, inventory JSONs) are rebuilt by `scripts/`,
  never hand-edited.
- Prior-art repos `../stellar-raven-next` and `../stellar-raven` are **read-only reference** —
  copy code in, never modify them.
- **Evals' primary artifact is upstream findings** — this server's own tuning ceiling is
  limited; every eval run files evidence-backed service-improvement recommendations in
  `improvements/` (charter there; own-repo fixes go to Solo todos instead). To run a
  round, use the `run-evals` skill (`.claude/skills/run-evals/SKILL.md` — agent-agnostic
  runbook: instrument selection, gates, agentic verdict review, failure triage, filing).
- **Let independent adversarial reviews finish.** When a Solo/subagent review is requested for
  design, code, eval, or research work, treat it as a quality gate, not a speed bump. Do not
  interrupt or close the reviewer merely because it is taking longer than expected; let it run to
  completion unless the user explicitly cancels it, it clearly errors, or it is blocking on input
  that only the user can provide. Capture and incorporate the review findings before finalizing.

## Neighboring repos

- `../stellar-raven-next` — primary prior art (see its `AGENTS.md`); `agents-docs/` there mirrors
  the Cloudflare Agents SDK docs incl. `docs/codemode/`. **Being retired** — everything
  eval-corpus-related is vendored in `eval/corpus/` (see `eval/corpus/PROVENANCE.md`); don't add
  new dependencies on the sibling path.
- `../raven-golden-qa` — **retired**; its corpora (big.json, the semantic battery) live at
  `eval/corpus/raven-golden-qa/`. The raw jutsu user-question pool was **removed** for privacy
  (real user ids + user-pasted secret keys/emails) and is not vendored here.
