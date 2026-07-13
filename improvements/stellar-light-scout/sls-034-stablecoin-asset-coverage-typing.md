---
id: sls-034
service: stellar-light-scout
status: reported-upstream
discovered: 2026-07-10
evidence:
  - paginated q=stablecoin returned 161 keyword rows and 37 Stablecoin-typed rows but omitted issuer-confirmed PYUSD, EURAU, and MGUSD
  - exact Stablecoin typing mixed assets with organizations and tools
  - SDF/issuer primary pages independently confirmed PYUSD, EURAU, and MGUSD Stellar launch/issuance
  - Solo scratchpad 575 GT-20 primary process 3256 and independent blind process 3257
  - Upstream issue filed 2026-07-13: https://github.com/Stellar-Light/stellarlight/issues/518
---

## Finding

Scout's stablecoin discovery surface is neither an exhaustive asset registry nor
a consistently asset-level taxonomy. On 2026-07-10, a paginated stablecoin query
returned 161 keyword matches and 37 records whose type included Stablecoin, but
the result omitted issuer-confirmed PYUSD, EURAU, and MGUSD. It also mixed asset
records with organizations and tooling.

This encourages both false absence and category conflation. A consumer cannot
safely answer which stablecoins are live, distinguish payment stablecoins from
yield-bearing certificates/RWAs, or identify exact code+issuer assets from the
current project-level result.

## Evidence

GT-20's two independent lanes queried the live directory and separately checked
Circle, PayPal/Paxos, AllUnity/SDF, MoneyGram/Bridge, Figure, SDF's stablecoin
explainer, and the March-2026 institutional report. Primary sources confirmed
assets absent from Scout and showed that YLDS/USDY-like products require a
different legal/product class.

## Recommendation

Add an asset-oriented stablecoin model:

- asset code, issuer, SAC where applicable, legal issuer, product brand;
- payment stablecoin, regional fiat token, yield-bearing certificate, fund/RWA,
  anchor-issued asset, organization, or tooling classification;
- network, launch/current state, source URL, and as-of date;
- supply/market-cap fields only with methodology and timestamp;
- exact-asset filtering separate from project/organization search.

Add PYUSD, EURAU, MGUSD, YLDS, and USDY regression fixtures that prevent false
absence and cross-class promotion.
