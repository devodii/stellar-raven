# GT-49 platforms, Horizon/RPC, Galexie, and Hubble truth audit — 2026-07-11

GT-49 used a Terra/high primary audit followed by a pre-read-locked Sol/max
blind review. The blind lane triangulated official docs/source/releases,
Stellar Docs/Raven retrieval, live read-only Horizon/RPC/Friendbot probes,
Parallel, Perplexity, and three non-interactive helper lanes. Full matrices are
in Solo scratchpad 575 under processes 3335 and 3341.

## Reconciled result

- Anchor Platform uses the canonical stellar/anchor-platform repository and
  current dated SEP coverage; installation is not automatic conformance.
- SDP Core now implements native SEP-10/24 flows and does not require an
  external Anchor Platform.
- Friendbot supports current G/C Testnet/Futurenet flows, but its success body
  is intentionally unstable.
- Galexie exports ledger metadata to object storage; stellar-etl transforms it;
  Hubble is the hosted public BigQuery analytics layer.
- Official Stellar sources conflict over whether Horizon is already
  deprecated or only nearing EOL. Goldens now encode the dispute and durable
  maintenance/availability facts instead of pinning a polarity.
- Stellar RPC is not Soroban-only or a complete Horizon replacement.
  Retention is configurable, archive integration is method-specific, and
  curated resources still require Horizon/indexers/custom views.
- The migration guide's pre-CAP-67 future tense is tracked by sd-025.

The GT-49 helper processes 3343-3345 were harvested and closed before the
parent lane was closed.
