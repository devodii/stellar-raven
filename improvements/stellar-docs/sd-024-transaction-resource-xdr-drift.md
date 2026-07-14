---
id: sd-024
service: stellar-docs
status: reported-upstream
discovered: 2026-07-11
upstreamTitle: Update transaction resource fields and enforcement phases
evidence:
  - current transaction-resource documentation/indexed prose uses readBytes and refundableFee
  - Protocol 27 XDR exposes diskReadBytes and resourceFee naming
  - current Core/RPC/CLI evidence distinguishes validation, preflight, and apply-time enforcement
  - Solo scratchpad 575 GT-47 blind process 3334
  - upstream issue filed 2026-07-14: https://github.com/stellar/stellar-docs/issues/2596
---

## Finding

The transaction-resource documentation retains older resource-field names and
compresses multiple enforcement phases. This can make clients treat current
Protocol 27 XDR fields as aliases and assume every resource failure occurs only
during host execution.

## Recommendation

Update field tables and examples to current Protocol 27 XDR naming, clearly
separate declared transaction/footprint validation from apply-time metering,
and distinguish transaction-only limits from resources with ledger-wide
aggregates.
