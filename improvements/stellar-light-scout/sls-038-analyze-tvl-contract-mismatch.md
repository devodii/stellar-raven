---
id: sls-038
service: stellar-light-scout
status: verified
discovered: 2026-07-10
evidence:
  - live /api/analyze?dimension=all returned categories, funding, hackathons, and meta but no TVL
  - live catalog description promised ecosystem DeFi TVL rollups
  - concurrent external chain-TVL sources differed by provider, time, and completion window
  - Solo scratchpad 575 GT-19 primary 3254 and blind 3258
---

## Finding

The live analyze response omits the TVL rollup promised by the exposed catalog
description. A caller cannot tell whether TVL is unavailable, soft-empty, or
expected elsewhere and may incorrectly sum overlapping project/RWA rows.

## Recommendation

Either return dated chain/protocol TVL with provider, inclusion, pricing,
deduplication, and timestamp fields, or remove the TVL promise and explicitly
state the unsupported scope. Preserve chain, protocol, RWA, asset, and CEX
measures as distinct metrics.
