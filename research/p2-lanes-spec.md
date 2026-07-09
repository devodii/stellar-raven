# P2 spec — `kind:"service"` + `kind:"workflow"` catalog lanes (discovery redesign Phase 2)

Status: coordinator-authored spec, 2026-07-09. Parent: `research/discovery-redesign.md` §4
Phase 2. Implements Solo todo 894. Predecessor evidence: P1 shipped at 52cdb23 (unanimous
dual verdict); seven live agentic runs established that prose guidance is a zero-sum knob on
the scout↔lumenloop boundary — lumenloop capture needs a *structural* surface, which is this
phase.

## What P2 adds

Two new catalog kinds emitted by `scripts/build-catalog.mjs`, searchable through the existing
`search` tool (no new tools, no scorer algorithm changes beyond kind weights):

1. **`kind:"service"`** — ~4 family cards (lumenloop, scout, stellarDocs, skills), generated
   from the same per-family purpose data the P1 micro-map uses (single source; the micro-map
   emitter and build-catalog must consume identical family prose or the build fails).
2. **`kind:"workflow"`** — one card per archetype in
   `scripts/catalog-data/workflow-archetypes.mjs` (single source with the P1 micro-map — the
   file already exists; do NOT introduce a second authoring surface).

Card shape (both kinds): shallow and schema-free — id (`service:<family>` /
`workflow:<archetype-id>`), title, description ≤ ~300 chars, keywords (like skill-section
keywords), and for workflows the ordered step list (exact op/skill ids). No inputSchema /
outputSchema. `codemode.describe("workflow:<id>")` returns the steps with each step's exact
callable line; `describe("service:<family>")` returns the family card + its op-id list.
`codemode.catalog()` includes the new kinds; `codemode.spec()` inclusion: yes, as
`x-workflow` / `x-service` vendor extensions (default per plan — flag in the report if this
bloats the spec badly).

Scoring: new kinds enter the existing lexical pipeline with kind weight **≤ 0.75** (start at
the skill-section weight; the weight constant must be one obvious knob). Workflow/service
cards must never blanket-outrank operations — if the A/B shows cards displacing op hits on
op-shaped queries, lower the weight before touching anything else.

## Guards (ADR-0003 discipline, fail-loud)

- Every op/skill id referenced by a card must exist in the manifest (`assertNoNonExposedRefs`
  covers card text + steps).
- Exposure filtering applies: a card referencing an excluded op fails the build (cards are
  emitted text).
- Staleness: manifest regen covered by the existing CI catalog-staleness guard; cards are
  data inside `catalog/manifest.json`, not a new artifact file.
- `buildLumenloop`-style stub rules unaffected — cards carry no partner content.

## Blast radius (update in the same change)

`src/catalog/types.ts` CATALOG_KINDS · `scripts/build-catalog.mjs` emitters + guards ·
scoring kind weights (`src/catalog/search.ts` or wherever kind weights live) ·
`catalog/manifest.json` + `specs/super-spec.json` regen · `src/mcp/tools.ts` SEARCH_DESCRIPTION
kind list ("use `kind` to narrow…" must name the new kinds) + describe handling ·
`test/` search/server/catalog expectations + new card guard tests · demo visibility decision
(default: cards visible in demo search like any hit; no demo prompt changes) ·
`eval/run-routing.mjs` kind handling (legacy cases must not accidentally accept a
workflow-card hit as an op hit — grading stays op-id-exact) · `eval/gates.json` decision
AFTER measuring (see gates).

## Gates

Deterministic, run by the implementer:
1. Build chain + typecheck + full test suite green; guards proven by tests (a card with a
   bogus op id must fail the build — test it).
2. Routing eval: adding catalog entries CAN legitimately move rankings. Rule: skills top-1
   ≥ 18/23 hard; legacy strict within −2 of 213/267/305 top-1/3/5. Anything below = lower the
   kind weight and retry, do NOT re-baseline in this phase. Report exact numbers.
3. Discovery instrument vs :8788 — this SHOULD move (cards surfacing for vague questions is
   the mechanism). Report per-case deltas; a workflow/service hit counts for familyHit@3 only
   if its family is acceptable; usableOp@5 still requires an actual op id in top-5 (cards
   don't count as ops — instrument semantics unchanged; if the runner needs a rule for card
   hits, hits of kind service/workflow map to their family for the family metric, and are
   skipped for the op metric).

Live three-arm A/B (coordinator-run after implementation review, NOT the implementer):
arms = P1 (3 runs, already recorded: 37.5×3 lumen-med) vs P1+P2 (3 fresh runs); the
2026-07-04 baseline is context. Per-case family MATRIX per run, not just rates. Success =
lumenloop capture up **without** scout cannibalization (the zero-sum break test), judged on:
- the dead-scout cases (`rwa-overview`, `lobstr-wallet` — scout in all 7 P1-era runs) —
  the honest structural test;
- churners (blend-tvl, comet, soroswap, rwa-freshness) reported but NOT credited;
- docs 100% hard blocking gate on every run (watch the CCTP/integration-tooling class);
- scout medium must hold ≥ 9/10-class across runs.
QA 30-case: one directional run only (n=30 is established as too noisy to referee).
Ship-or-revert decided by dual independent review on the matrices.

## Explicitly out of scope

No Vectorize/embeddings (trigger-gated, §3 of the research doc). No new top-level tools. No
per-hit why/matchedBy prose. No demo prompt changes. No scorer algorithm changes beyond the
kind weight constant.
