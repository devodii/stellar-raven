---
id: sd-018
service: stellar-docs
status: verified
discovered: 2026-07-11
evidence:
  - token-interface page presents generic SEP-41 transfer/mint topic shapes
  - CAP-0067 and released/current rs-soroban-env append sep0011_asset to direct SAC transfer/mint events
  - current host test_transfer_with_issuer passed and asserts the asset-appended shape
  - Solo scratchpad 575 GT-42 primary 3308 and blind 3315
---

## Finding

The generic token-interface event documentation does not call out the current
SAC/CAP-67 exception. A reader can reasonably conclude that a direct SAC
transfer has the same three topics as a custom SEP-41 transfer, but current
host source and tests append the SEP-11 asset string to direct SAC and Classic
unified events.

## Recommendation

Add an event-schema table distinguishing custom SEP-41 from current SAC/CAP-67
transfer, mint, burn, and clawback events. Explain that direct SAC and Classic
unified events share the SAC schema and require transaction/operation metadata
to distinguish their path. Link the payment/event-indexing guidance and include
one tested fixture.
