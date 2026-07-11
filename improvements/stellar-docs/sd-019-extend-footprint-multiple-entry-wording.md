---
id: sd-019
service: stellar-docs
status: verified
discovered: 2026-07-11
evidence:
  - extend-persistent-entry-js guide says different entries require separate transactions
  - current ExtendFootprintTTLOpFrame iterates every read-only footprint entry
  - one operation applies one extendTo offset across multiple footprint keys
  - Solo scratchpad 575 GT-42 blind process 3315
---

## Finding

The JavaScript persistent-entry extension guide says a single
`ExtendFootprintTTLOp` cannot extend multiple ledger entries together. Current
Core instead iterates all entries in the read-only footprint. The real
constraint is one Soroban operation per transaction and one shared `extendTo`
offset, not one ledger key per operation.

## Recommendation

Correct the guide and add an example with two read-only footprint keys extended
to the same relative offset. State that entries requiring different target
offsets need separate operations/transactions.
