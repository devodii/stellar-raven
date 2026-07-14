---
id: sd-033
service: stellar-docs
status: reported-upstream
discovered: 2026-07-11
upstreamTitle: Document Python SDK support for Stellar RPC
evidence:
  - current developers.stellar.org client SDKs page says the Python SDK communicates with Horizon and lists only a Horizon networking API
  - stellar/stellar-docs main commit 45770fa8 contains the same Horizon-only Python section
  - stellar-sdk 15.0.0 on PyPI, published 2026-07-04, says it connects to Horizon and Stellar RPC
  - current StellarCN/py-stellar-base README lists a Stellar RPC networking layer and Horizon/RPC transaction submission and queries
  - current official Stellar event and transaction guides already use stellar_sdk.soroban_rpc Python APIs
  - Solo scratchpad 575 GT-55 primary candidate and author repro process 3397
  - upstream issue filed 2026-07-14: https://github.com/stellar/stellar-docs/issues/2600
---

## Finding

The official Client & XDR SDKs page describes the current community Python SDK
as Horizon-only. It says `py-stellar-base` communicates with a Horizon server
and lists only a Horizon networking API. The current Python package and source
instead support both Horizon and Stellar RPC, and current official Stellar
guides already import Python RPC types such as `stellar_sdk.soroban_rpc`.

This mismatch can make the Python SDK appear unsuitable for current contract
and RPC work even though the capability is shipped and used elsewhere in the
same documentation set.

## Evidence

The docs page/source, PyPI 15.0.0 metadata, upstream SDK README, and current
official Python RPC examples independently reproduce the omission. This is a
content-parity defect; it does not duplicate `sd-003`, which concerns RPC
method reference pages missing from the search index.

## Recommendation

Update the Python SDK section to say it communicates with both Horizon and
Stellar RPC, list the RPC networking/submission capability, and link the
current Python RPC documentation/examples. Keep community-maintainer and
Python-version wording synchronized with the package's current metadata.
