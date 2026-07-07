---
id: sls-017
service: stellar-light-scout
status: verified
discovered: 2026-07-07
evidence:
  - eval/qa/results/2026-07-07T19-58-35-variantA.json (q-eco-wallets-overview)
  - "live verification 2026-07-07: lobstr.co homepage self-describes as 'Stellar & XRPL Wallet' (Stellar and XRP Ledger); Scout/Lumenloop directory payloads for LOBSTR carry no XRPL/multichain signal"
  - Solo todo 870 comment 2308
---
## Finding

LOBSTR's directory records omit its XRP Ledger support. LOBSTR's own site
self-describes as a "Stellar & XRPL Wallet", but the wallet's directory
entries returned by the Scout/Lumenloop surfaces describe it purely in
Stellar terms with no chain-support field and no XRPL mention — so a consumer
synthesizing from directory data alone concludes "single-chain Stellar-only"
by omission.

## Evidence

QA run 2026-07-07T19-58-35-variantA.json, case q-eco-wallets-overview: the
answering agent, working from live directory payloads, classified LOBSTR as
"single-chain Stellar-only"; same-day live check of lobstr.co contradicts it
(headline copy "Stellar & XRPL Wallet"; product copy naming both ledgers and
Ultra Stellar as the independent operator). The error is faithful synthesis
of incomplete upstream data, not agent fabrication.

## Recommendation

Add a chain/network-support field to wallet directory records (e.g.
`supportedNetworks: ["stellar", "xrpl"]`) or reflect multichain support in
the short description. Wallet rows are precisely where consumers ask
"which chains?", and an omission reads as a negative claim. Cheapest fix:
refresh the LOBSTR record's description from the provider's current site
copy; durable fix: the structured field, so omission and negation stop being
indistinguishable.
