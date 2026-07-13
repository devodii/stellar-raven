---
id: sls-031
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-07-10
evidence:
  - Scout DeFindex TVL 16385898 asOf 2026-07-09T22:06:45Z
  - concurrent operator, DeFiLlama, and Dune observations ranged from roughly 16.255M to 16.57M
  - live Scout response exposed timestamp but not enough inclusion/pricing methodology to reconcile the difference
  - Solo scratchpad 575 GT-15 primary process 3243 and blind process 3246
  - https://github.com/Stellar-Light/stellarlight/issues/494; live re-check 2026-07-13 shows /api/analyze?dimension=tvl now returns provider, as-of, scope, and methodology basis
---

## Finding

Scout exposes a DeFindex TVL value and timestamp but not enough calculation
provenance to reconcile it with other current sources. The GT-15 audit observed
about $16.57M on the operator site, $16.49M on DeFiLlama, $16.386M in Scout,
and $16.255M in Dune's weekly series. The differences are modest and plausible,
but a consumer cannot determine whether they come from pricing time, included
vaults/strategies, chain scope, or refresh cadence.

This creates two failure modes: treating Scout's number as exact universal
truth, or incorrectly concluding that no current TVL is available because
sources disagree.

## Evidence

Both GT-15 lanes queried current product and analytics surfaces on 2026-07-10.
The operator strategy API also returned seven BlendStrategy adapters, showing
why inclusion scope matters: adapters are not necessarily seven independent
products or seven independently counted TVL buckets.

## Recommendation

Attach TVL methodology fields:

- source/adapter and query URL;
- pricing currency/time;
- included chain, vault, strategy, and product scope;
- raw versus deduplicated treatment;
- generatedAt/dataAsOf;
- comparison/conflict note when other named sources differ materially.

Add a DeFindex regression fixture that accepts a dated range or methodology-
qualified value and never describes current TVL as unavailable.
