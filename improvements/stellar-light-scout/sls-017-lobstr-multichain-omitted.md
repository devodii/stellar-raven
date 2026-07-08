---
id: sls-017
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-07-07
evidence:
  - eval/qa/results/2026-07-07T19-58-35-variantA.json (q-eco-wallets-overview)
  - "live verification 2026-07-07: lobstr.co homepage self-describes as 'Stellar & XRPL Wallet' (Stellar and XRP Ledger); Scout/Lumenloop directory payloads for LOBSTR carry no XRPL/multichain signal"
  - "prevalence sweep 2026-07-07: Scout returned 45 Wallet-typed records for q=wallet. In the first 20, multichain support was present for Hana, HOT Wallet, Bitget Wallet, Klever, Unstoppable Wallet, Ledger, and Trezor; Decaf appears outside Wallet type as Payments but its record explicitly says Solana and Stellar. xBull, Beans, Freighter, Vesseo/Vibrant, Albedo, Rabet, and Solar own-site checks did not reveal an omitted non-Stellar chain in this sample. Result: keep verified as a LOBSTR stale-omission, not a broad multichain-wallet prevalence claim."
  - Solo todo 870 comment 2308
  - upstream issue filed 2026-07-07: https://github.com/Stellar-Light/stellar-scout/issues/4
  - fixed upstream in 2026-07-08 drift: live LOBSTR project search now returns supportedNetworks ["stellar","xrpl"] and description text naming Stellar and XRP Ledger (XRPL)
---
## Finding

LOBSTR's directory records omit its XRP Ledger support. LOBSTR's own site
self-describes as a "Stellar & XRPL Wallet", but the wallet's directory
entries returned by the Scout/Lumenloop surfaces describe it purely in
Stellar terms with no chain-support field and no XRPL mention — so a consumer
synthesizing from directory data alone concludes "single-chain Stellar-only"
by omission.

A 2026-07-07 prevalence sweep keeps this as verified but narrows the claim:
this is LOBSTR-specific in the sampled wallet set, not evidence that Scout
systematically drops multichain support. Scout already describes multichain
support for Hana, HOT Wallet, Bitget Wallet, Klever, Unstoppable Wallet,
Ledger, Trezor, and Decaf. Spot checks of xBull, Beans, Freighter,
Vesseo/Vibrant, Albedo, Rabet, and Solar did not reveal another omitted
non-Stellar chain in the first-page wallet sample.

## Evidence

QA run 2026-07-07T19-58-35-variantA.json, case q-eco-wallets-overview: the
answering agent, working from live directory payloads, classified LOBSTR as
"single-chain Stellar-only"; same-day live check of lobstr.co contradicts it
(headline copy "Stellar & XRPL Wallet"; product copy naming both ledgers and
Ultra Stellar as the independent operator). The error is faithful synthesis
of incomplete upstream data, not agent fabrication.

Live re-check 2026-07-08: `GET /api/projects/search?q=LOBSTR&limit=10`
returns the LOBSTR row with `supportedNetworks:["stellar","xrpl"]` and
shortDescription text saying it is for the Stellar and XRP Ledger (XRPL)
networks. The original omission is fixed.

## Recommendation

Add a chain/network-support field to wallet directory records (e.g.
`supportedNetworks: ["stellar", "xrpl"]`) or reflect multichain support in
the short description. Wallet rows are precisely where consumers ask
"which chains?", and an omission reads as a negative claim. Cheapest fix:
refresh the LOBSTR record's description from the provider's current site
copy; durable fix: the structured field, so omission and negation stop being
indistinguishable.
