---
id: sls-051
service: stellar-light-scout
status: proposed
discovered: 2026-07-11
evidence:
  - routing A/B at the Scout 1.7.15 absorb (commit 6cf5bbf): 22 extended-lane stellarDocs-labeled questions ranked scout.searchProjects at top-1 (the 1.7.15 description/enum enrichment added ~9 to a pre-existing ~13), plus 3 legacy-lane stellarDocs cases; solo://proj/49/scratchpad/todo-940-general-mit--592
  - score-attribution sweep 2026-07-11 (same scratchpad): removing keywords left the capture intact on every case; truncating the description to 180 chars eliminated it — the description surface alone drives the capture
  - independent adversarial review 2026-07-11 (fable lane 3443): in captured cases the correct docs operation out-scored searchProjects 1.9–3.6x on the gate-free lexical metric (707 vs 383; 806 vs 437; 857 vs 560) and still lost on tier placement
  - consumer-side mitigation landed gateway-side 2026-07-11 (commit bb25276, bounded tier interleave): recovers 12 of 22 captured extended cases; the remainder and every other lexical consumer of scout's self-description inherit the capture as-is
---

## Finding

`searchProjects`' upstream description is broad enough to lexically capture
documentation-shaped questions — a distinct slice from the editorial-content
capture already filed (and marked fixed) as sls-015. The 1.7.15 revision
resolved the editorial slice by adding qualifying prose, but adding text
enlarged the description's token surface, and on how-to/reference questions
("which Wasm target does the CLI build to", "how do I generate TypeScript
bindings", "what does it take to become an anchor") the enlarged surface now
matches enough of the question's vocabulary that lexical consumers rank
`searchProjects` above the documentation source that actually answers them.

Quantified at the 1.7.15 absorb: 22 of 122 extended-lane docs-labeled routing
questions ranked `searchProjects` top-1 (13 pre-existing, ~9 added by 1.7.15),
plus 3 legacy-lane docs cases. Attribution isolated the description prose:
schema-derived keywords contributed nothing measurable, and bounding the
scored description eliminated the capture. In the captured cases the correct
docs operation scored 1.9–3.6x higher on a coverage-gate-free lexical metric
and still lost — the description's breadth wins at the gate/tier layer, not on
genuine relevance.

## Evidence

Reproducible by any consumer: fetch the live `searchProjects` operation
description, tokenize it alongside a docs-shaped question naming no project
("which Wasm target does the current Stellar CLI build to?"), and observe the
description covering enough question vocabulary to pass a token-coverage
threshold that the terse, correct documentation operation fails. Run records:
routing A/B tables, per-case capture list, score attribution, and the
adversarial review are in solo://proj/49/scratchpad/todo-940-general-mit--592;
ranked dumps from the 2026-07-11 sweeps at /tmp/t940-real-m{15,16,17,18,20}.json.

## Recommendation

Same structural ask as sls-015's "better fix", now with a second measured
failure slice as evidence that prose qualifiers cannot contain it: separate
machine-routing vocabulary from the prose description. Put product names,
category enumerations, and question-phrasing exemplars in a dedicated
keywords/examples field consumers can weight independently, and keep the
description to the operation's distinctive purpose. Each prose-based repair
grows the token surface and shifts the capture to a new question family —
1.7.15 fixed editorial capture and enlarged docs capture. Consumer-side
mitigation is partial by construction: this gateway's bounded tier interleave
(commit bb25276) recovers 12 of the 22 captured cases by letting decisive
gate-free relevance overrule tier placement, but the capture originates in the
upstream self-description surface and reaches every other lexical consumer
unchanged.
