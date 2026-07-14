---
id: sd-016
service: stellar-docs
status: verified
discovered: 2026-07-10
upstreamTitle: Make network limit tables dated and source-linked
evidence:
  - current Networks and Fees pages state 100 smart-contract transactions per ledger
  - live CONFIG_SETTING_CONTRACT_EXECUTION_LANES reports ledgerMaxTxCount 2000, last modified at ledger 60993066
  - live Testnet Horizon reports max_tx_set_size 200 while the Networks table states 100 operations per ledger
  - Solo scratchpad 575 GT-32 primary 3281 and independent blind 3284
---

## Finding

Official network-capacity tables contain hand-maintained current scalars that
have drifted from live network configuration. The most material example is the
documented 100 smart-contract transactions per ledger versus the current live
execution-lanes setting of 2,000. Testnet's documented classic-operation value
also differs from the live ledger field.

## Recommendation

Label current network-limit scalars with a source ledger/as-of timestamp and
link the RPC/ledger read that operators can repeat. Where maintainable, check
the hand-maintained value against a dated network-specific fixture in CI.
Explain that resource budgets can constrain effective throughput below the
count ceiling, and avoid presenting a validator-controlled setting as a
permanent protocol constant. Do not require the page to generate live tables
at request time.
