---
id: sd-014
service: stellar-docs
status: verified
discovered: 2026-07-10
evidence:
  - official Ledger, LedgerCloseMeta, and history/archive documentation
  - stellar-xdr ledger/SCP value definitions
  - stellar-core TxSetFrame and LedgerManager hash construction
  - Solo scratchpad 575 GT-29 primary 3276 and independent blind 3278
  - GT-41 recurrence: document timestamping guidance required historical transaction/result and ledger-close evidence because the current Manage Data entry is mutable
---

## Finding

Official documentation exposes `bucketListHash`, `txSetHash`,
`txSetResultHash`, LedgerCloseMeta, SCP envelopes, and archive retrieval in
separate places, but does not provide one current explanation of what a Stellar
transaction-inclusion proof is—or is not.

The resulting ambiguity encourages two opposite errors: describing the Bucket
List state commitment as a Bitcoin/Ethereum-style per-transaction Merkle proof,
or treating an RPC/Horizon/indexer row as a self-authenticating cryptographic
proof. Stellar does not expose a standard compact one-call per-transaction
Merkle branch through these surfaces.

## Recommendation

Add a transaction verification guide that distinguishes:

- Bucket List state commitments from transaction-set/result commitments;
- `scpValue.txSetHash` over the full serialized transaction set and
  `txSetResultHash` over the full result set;
- retrieval evidence from cryptographic recomputation;
- ledger-header hash-chain verification from SCP/quorum finality assumptions.

Provide a reproducible full-XDR verification recipe and state explicitly that
it is not a compact standard per-transaction Merkle proof. Name any supported
light-client or archive tooling separately with its trust model.
