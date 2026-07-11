---
id: sls-037
service: stellar-light-scout
status: verified
discovered: 2026-07-10
evidence:
  - Rarible row was Live with empty supportedNetworks and Ethereum/Polygon-only description
  - official SCF award and Rarible STELLAR enum establish a real integration relationship
  - current Rarible supported-chain documentation and UI did not verify public Stellar support
  - Solo scratchpad 575 GT-19 primary 3254 and blind 3258
---

## Finding

One `Live` project status cannot represent partial deployment. Rarible has
official Stellar award/schema evidence, while its current public API/UI support
was not verified and Scout exposes no network/deployment basis. The row invites
both false live-support claims and false claims of no Stellar relationship.

## Recommendation

Model award, planned tranche, repository/schema integration, testnet, mainnet,
API indexer, SDK, and public UI availability separately, each with source and
as-of date. Keep entity status distinct from product-by-network deployment and
add Rarible as a regression fixture.
