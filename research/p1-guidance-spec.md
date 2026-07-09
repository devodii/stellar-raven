# P1 spec — search guidance rewrite + generated orientation (discovery redesign Phase 1)

Status: coordinator-authored spec for the P1 implementation, 2026-07-09.
Parent plan: `research/discovery-redesign.md` §4 Phase 1 (channel decision resolved in step 3
there: SEARCH_DESCRIPTION primary, SERVER_INSTRUCTIONS dual-era secondary).
Implements Solo todo 893. GitHub: kalepail/stellar-raven#9 (guidance), #10 (orientation layer).

## What P1 changes (and what it deliberately does not)

Changes model-facing prose and adds ONE generated artifact. Zero scoring changes, zero new
tools, zero catalog-shape changes (those are P2). The routing eval must stay byte-identical.

The Phase 0 discovery instrument (`eval/discovery/`) grades a FIXED naive query per case, so
P1 prose changes must show **no movement** there (same query → same deterministic hits) —
that run doubles as a no-regression guard. P1's intended effect is on agent *behavior*
(which queries agents issue, which families they consider), measured only by live agentic +
QA lanes.

## 1. Single source of truth: `scripts/catalog-data/workflow-archetypes.mjs`

New authored-but-guarded data file (same pattern as `description-notes.mjs`): an array of
8–12 workflow archetypes, each `{ id, title, questionShape, families, steps }` where `steps`
is an ordered list of exact catalog op/skill ids with a one-line why. Guards, enforced in
`scripts/build-catalog.mjs`: every referenced id must exist in the built manifest
(fail-loud, ADR-0003 `assertNoNonExposedRefs` applies to all emitted text); orphan check both
directions is NOT required (not every op appears in an archetype), but every archetype id must
be unique and every `families` value a real service family.

P1 consumes this file for the micro-map. P2 will emit the SAME file as `kind:"workflow"`
catalog cards — one authoring surface, no drift between the instructions text and the future
catalog lane.

Archetype selection (author from evidence, not vibes): cover the QA/agentic miss classes —
project/funding lookup (scout + lumenloop corroboration), editorial/community content
(lumenloop-first — the 37.5% capture kernel), protocol/SDK factual (docs-first),
build/integrate (skill sections + docs), ecosystem people/events (scout builders/hackathons),
incident/audit claims (corroboration rule), asset/anchor coverage, wallet/tooling comparison.

## 2. Generated micro-map emitter

New `scripts/build-micro-map.mjs` (or a build-catalog byproduct — implementer's call, but it
runs in the same `npm run` build chain and CI staleness guard). Emits `src/mcp/micro-map.ts`
(generated, never hand-edited, banner comment says so) exporting:

- `MICRO_MAP: string` — 800–1,500 tokens, for SERVER_INSTRUCTIONS. Structure:
  1. **Sources** — one short paragraph per family (lumenloop / scout / stellarDocs / skills):
     what it is, what content types it holds, when it is the authority. Generated from
     inventory/service data + a small purpose-prose map inside the data file.
     NO per-op cards, NO schemas, NO op lists.
  2. **Authority rules** — the existing community-aggregated/corroboration sentences from
     SERVER_INSTRUCTIONS fold in here (single copy; delete from the hand-written text).
  3. **Workflow archetypes** — one line each from workflow-archetypes.mjs:
     `title — questionShape → families/step ids`.
- `FAMILY_LINE: string` — ≤ ~120 tokens, the compact per-family one-liners for
  SEARCH_DESCRIPTION step 1 (same generated source, so the two channels cannot disagree).

Token budget check in the emitter: fail the build if MICRO_MAP exceeds ~1,500 tokens
(estimate: chars/4) or FAMILY_LINE exceeds ~150.

## 3. SEARCH_DESCRIPTION rewrite (src/mcp/tools.ts)

Keep the first line as a strong standalone summary (deferred-tool-loading clients may see
only it). Replace the Workflow section; target text (FAMILY_LINE interpolated at build):

```
## Workflow

1. Plan which source families could ground the answer before searching:
${FAMILY_LINE}
Most questions have a primary family and a corroborating one — pick both up front.
2. `search` once per candidate family — searches are cheap: two or three targeted
queries (with `service`/`kind` filters where the family is known) beat one broad
phrase. Vary vocabulary between queries: an entity name first, then a capability
phrase.
3. Read the top hits' signatures and descriptions.
4. Write ONE `execute` script that composes SEVERAL relevant operations — hits are
composable building blocks, not one-answer routes. Fan out broad calls (often across
services) with Promise.all, then make targeted follow-up calls from what comes back.
```

Rules section: drop "Prefer specific queries … over broad ones" only if it contradicts the
new step 2 phrasing; otherwise keep. Everything else (tier semantics, truncated, skill.run,
describe) stays.

`nextSteps` (zero-hit and truncated paths in tools.ts): align wording with multi-query
planning — "try the other candidate family / vary vocabulary" instead of "narrower query"
alone. Keep exact-match filter diagnostics unchanged.

## 4. SERVER_INSTRUCTIONS rewrite

Compose as: current first paragraph (workflow + envelope contracts, trimmed of the
authority sentences that moved) + `MICRO_MAP`. Served in the `initialize` result as today
(dual-era `server/discover` adoption is a later transport change, out of P1 scope — see the
RC verdict in discovery-redesign.md §4 step 3).

## 5. Demo playground

Default: the micro-map does NOT enter the demo preamble (token caps). The demo continues to
use SEARCH_DESCRIPTION/EXECUTE_DESCRIPTION verbatim as it does today; if the rewritten
SEARCH_DESCRIPTION pushes the demo over its cap, flag it in the report rather than trimming
production text for the demo's sake.

## 6. Gates (all live, in order)

1. `npm run` build chain green; CI staleness guard covers the new generated file; emitted-
   text guards pass (`assertNoNonExposedRefs` over MICRO_MAP + FAMILY_LINE + descriptions).
2. Routing eval byte-identical vs pre-P1 (no scorer change → no re-baseline).
3. Phase 0 discovery instrument re-run vs the worktree dev server: hits byte-identical to
   the post-adjudication baseline (prose must not move fixed-query results).
4. Agentic 30-case live run: stellarDocs primary-hit holds 100%; lumenloop primary-hit is
   the watch metric (baseline 37.5%); regression in any family blocks.
5. QA 30-case live sample vs goldens: no regression; the lumenloop/source-family loss class
   is the hoped-for conversion.
6. Taste review (fable-5 or opus-4.8, reviewer ≠ implementer) of all model-facing prose
   before the gate verdict.

## 7. Blast radius (update in the same change)

src/mcp/tools.ts prose · src/mcp/micro-map.ts (new, generated) · scripts/build-micro-map.mjs
+ scripts/catalog-data/workflow-archetypes.mjs (new) · build/CI staleness wiring ·
README + ARCHITECTURE §1 mention of the orientation layer · test/search + server expectations
that assert on description text · demo cap check (§5).
