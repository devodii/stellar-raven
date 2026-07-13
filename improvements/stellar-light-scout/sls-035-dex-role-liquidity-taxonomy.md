---
id: sls-035
service: stellar-light-scout
status: reported-upstream
discovered: 2026-07-10
evidence:
  - live DEX cluster contained 33 mixed-role records
  - operator and protocol sources distinguish native venues, AMMs, routers, aggregators, and UIs
  - Solo scratchpad 575 GT-19 primary 3254 and blind 3258
  - upstream issue filed 2026-07-13: https://github.com/Stellar-Light/stellarlight/issues/517
---

## Finding

Scout's DEX type/cluster cannot answer how many independent liquidity venues or
"serious players" exist. It mixes native Stellar liquidity, Soroban AMMs,
routers, aggregators, trading UIs, testnet projects, and generic multichain
records. A cluster count therefore becomes an unsafe competitor count.

## Recommendation

Expose `venueRole`, native-versus-contract venue, independent-liquidity status,
network/deployment state, and dated TVL/volume/integration evidence. Document
that cluster size is a directory taxonomy count, not a competitor or maturity
measure, and add regression fixtures for Soroswap, Aquarius, Phoenix, Sushi,
StellarX, and the native SDEX/AMM.
