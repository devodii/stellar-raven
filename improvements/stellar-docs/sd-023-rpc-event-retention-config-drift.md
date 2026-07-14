---
id: sd-023
service: stellar-docs
status: reported-upstream
discovered: 2026-07-11
upstreamTitle: Replace stale RPC transaction and event retention guidance
evidence:
  - getEvents method docs state a 24-hour default and seven-day maximum
  - current stellar-rpc source configures retention in ledgers and defaults to 120960
  - live public getHealth reported ledgerRetentionWindow=120960
  - Solo scratchpad 575 GT-46 blind 3329
  - live recheck 2026-07-14: getEvents still says a 24-hour default; getTransaction still names the retired transaction-retention-window setting and recommends a seven-day cap; current source uses one positive history-retention-window in ledgers with a stock 120960-ledger default
  - upstream issue filed 2026-07-14: https://github.com/stellar/stellar-docs/issues/2595
---

## Finding

The getEvents and getTransaction pages still present universal time-based
retention guidance that disagrees with current stellar-rpc source. getEvents
says the default is 24 hours; getTransaction names the retired
`transaction-retention-window` setting and says private instances can adjust it
up to seven days. Current RPC uses one positive `history-retention-window`
expressed in ledgers for transactions and events, with a stock default of
120960 ledgers (about seven days). Provider configuration and observed ledger
cadence determine the effective time span.

## Recommendation

Replace the retired setting and universal day counts with the current
ledger-count configuration. Show how to inspect `getHealth`/provider
configuration and frame day conversions as approximations. Keep the durable
guidance: RPC history is bounded and an external indexer is required for
longer retention.
