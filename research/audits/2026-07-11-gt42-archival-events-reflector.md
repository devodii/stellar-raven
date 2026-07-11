# GT-42 archival, event, and Reflector reconciliation

Primary process 3308 and blind process 3315 independently audited ten cases.
The blind review corrected two late primary claims: current direct SAC events
do carry the CAP-67 asset topic, and normal P23 auto-restore uses
`archivedSorobanEntries` with `restorePreamble` nil.

Durable findings:

- P23 restoration and execution normally occur in one submitted invocation.
- Restore TTL is `current + minPersistentTTL - 1`; extension is
  `current + extendTo`, bounded by `maxEntryTTL - 1`.
- Direct SAC and Classic unified events share the asset-appended CAP-67 shape;
  custom SEP-41 events retain the generic schema.
- Immediate contract invoker authorization is automatic. Explicit
  `authorize_as_current_contract` entries start at deeper calls.
- Reflector's current Pulse ABI uses `lastprice`; the operator registry must be
  consulted for network/type/ID, and the prior CBQ example is a DAO, not an
  oracle. The public site still contains stale x_* wording, so live ABI/source
  controls until the operator resolves the conflict.

Full version-pinned sources, test commands, and per-case matrices are in Solo
scratchpad 575.
