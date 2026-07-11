---
id: sd-029
service: stellar-docs
status: verified
discovered: 2026-07-11
evidence:
  - current RPC admin and data-lake pages inspected 2026-07-11 do not explain the v25.1+ BACKFILL startup path and prerequisites
  - stellar-rpc v27.1.1 options.go defaults BACKFILL=false and SERVE_LEDGERS_FROM_DATASTORE=false
  - stellar-rpc v27.1.1 service.go and backfill.go synchronously materialize an approximate trailing window before normal ingestion
  - narrow config and ingest source tests recorded in Solo scratchpad 575 GT-54 blind process 3386
---

## Finding

Current Stellar RPC administration content does not document the shipped
`BACKFILL` path well enough to distinguish it from retention and direct
data-lake serving. Since v25.1, RPC can synchronously materialize approximately
its configured trailing window from a compatible datastore before normal live
ingestion, but the operator-facing pages still leave readers with the older
retention-only model.

The missing boundary is safety-relevant:

- `BACKFILL` defaults false and requires
  `SERVE_LEDGERS_FROM_DATASTORE=true` plus compatible datastore coverage;
- fresh ordinary RPC startup begins at the current history-archive tip, so
  increasing retention alone does not restore older rows;
- direct datastore fallback without materialization remains
  `getLedgers`-only, while transaction/event methods read local tables;
- datastore/checkpoint gaps and existing local state constrain what can be
  materialized, so exact coverage should not be promised.

## Evidence

The pre-read-locked GT-54 blind lane inspected v27.1.1
`options.go`, `service.go`, `backfill.go`, database
and method handlers, then ran narrow non-mutating config/ingest tests. It
confirmed defaults of `HISTORY_RETENTION_WINDOW=120960`,
`SERVE_LEDGERS_FROM_DATASTORE=false` and `BACKFILL=false`,
with synchronous backfill before live ingestion when enabled.

The independent primary lane correctly rejected fixed storage/day and universal
backfill claims but could not resolve the current implementation from the
operator prose alone. This is distinct from sd-023, which owns stale
24-hour/seven-day event-retention wording.

## Recommendation

Add a versioned RPC startup/recovery section that:

1. lists the three current defaults;
2. contrasts ordinary fresh startup, a larger future retention window, direct
   `getLedgers` datastore serving, and `BACKFILL` materialization;
3. states datastore, serve-flag, local-state, gap and checkpoint prerequisites;
4. explains which methods remain local-table-backed;
5. labels release-note storage/duration figures as dated examples rather than
   capacity guarantees.

Cross-link the section from configuration, data-lake integration and retention
method pages.
