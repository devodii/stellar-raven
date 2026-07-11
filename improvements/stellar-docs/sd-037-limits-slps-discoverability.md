---
id: sd-037
service: stellar-docs
status: proposed
discovered: 2026-07-11
evidence:
  - P4 N2 candidate identifies SLP-0004 and SLP-0006 as high-value 2026 protocol facts whose limits/ proposal family is substantially less discoverable than CAPs and SEPs; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - the P4 N2 YieldBlox reconciliation relies on SLP-0006 for the affected-account/quarantine context, showing practical retrieval impact
---

## Finding

Stellar Docs discovery does not clearly surface the new `limits/` SLP proposal
family alongside CAPs and SEPs. Queries for current protocol facts can miss
SLP-0004/SLP-0006 or encourage callers to invent an SEP/CAP label for material
that belongs to a distinct proposal track.

## Evidence

P4 N2 documented the discoverability gap on 2026-07-11 and independently used
SLP-0006 to reconcile the YieldBlox incident. This is proposed pending a saved
Algolia query/result set that quantifies the miss and rules out query syntax.

## Recommendation

Index SLP documents with a visible proposal-family facet, canonical `SLP-000N`
identifiers, and cross-links from standards/protocol discovery pages. Search
results should state the family rather than normalizing it into SEP or CAP.
