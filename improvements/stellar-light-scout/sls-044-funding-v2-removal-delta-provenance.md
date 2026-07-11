---
id: sls-044
service: stellar-light-scout
status: proposed
discovered: 2026-07-10
evidence:
  - same funding-v2 methodology reported $40,456,895.13 / 399 projects on 2026-07-06
  - it reported $40,160,145.13 / 398 projects on 2026-07-09
  - it reported $39,851,645.13 / 391 projects on 2026-07-10
  - response now exposes computedAt, methodologyVersion, countBasis, and byRound
  - Solo scratchpad 575 GT-37 primary 3296 and blind 3298
---

## Finding

Funding-v2 now documents its methodology, fixing the earlier provenance defect, but
the reconstructed cumulative total and distinct-project set can decrease sharply
under the same methodology without an answer-visible delta reason. Consumers cannot
distinguish a correction/reclassification from accidental project loss.

## Recommendation

Persist a stable project-set hash and publish added/removed/reclassified counts with
reason codes between snapshots. Run a seven-day recurrence probe before promotion
from proposed to verified; normal reindexing alone should not reopen the fixed
methodology finding.
