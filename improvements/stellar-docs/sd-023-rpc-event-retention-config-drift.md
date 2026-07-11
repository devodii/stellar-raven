---
id: sd-023
service: stellar-docs
status: verified
discovered: 2026-07-11
evidence:
  - getEvents method docs state a 24-hour default and seven-day maximum
  - current stellar-rpc source configures retention in ledgers and defaults to 120960
  - live public getHealth reported ledgerRetentionWindow=120960
  - Solo scratchpad 575 GT-46 blind 3329
---

## Finding

The event-query documentation presents a universal time-based default and
maximum that disagree with current stellar-rpc source and a live public
endpoint. Retention is endpoint/configuration dependent, so the static day
counts can mislead indexer and recovery designs.

## Recommendation

Describe the configured ledger-retention window, show how to inspect
getHealth/provider configuration, and frame any day conversion as an
approximation. Keep the durable guidance: RPC history is bounded and an
external indexer is required for longer retention.
