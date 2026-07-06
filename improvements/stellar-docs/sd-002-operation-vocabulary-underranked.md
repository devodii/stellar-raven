---
id: sd-002
service: stellar-docs
status: proposed
discovered: 2026-07-03
evidence:
  - eval/qa/results/2026-07-03T03-49-35-variantA.json
  - eval/qa/results/2026-07-03T04-13-42-variantA.json
  - retrieval cluster analysis C2 (2026-07-03 eval round)
  - Solo project 49, todo 822, comments 2204-2210
  - live probe 2026-07-06 (eval round todo 846): possibly fixed — direct search_docs on the combined C2 cluster now returns 10/10 on-topic official docs hits (sponsored-reserves, claimable-balance, account-merge, fee-pool sections), but the original evidence was a cross-service ranking comparison that could not be replicated via execute, so this is not a confirmed refutation; status held
---

## Finding

Operation-level protocol vocabulary is under-represented in the docs search
surface relative to how users phrase questions. Terms in the cluster: sponsored
reserves, account merge, msg.sender equivalent, SEP-41 transfer vs transferFrom,
claimable-balance predicates, fee pool. The content exists in the docs, but
ranking loses to other sources for these phrasings.

## Evidence

Retrieval cluster analysis C2 from the 2026-07-03 eval round (results files
above).

## Recommendation

Improve ranking/synonym coverage for operation-level vocabulary — e.g. boost
operation reference pages for these terms, or add synonym mappings so
user-phrased queries land on the existing content.
