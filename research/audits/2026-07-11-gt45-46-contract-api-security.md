# GT-45/46 contract API and security truth audit — 2026-07-11

Primary Terra/high audits and independent Sol/max blind reviews covered 20
golden cases. The independent lanes used official Stellar/OpenZeppelin docs,
current protocol/SDK/host source, the Stellar Docs/Raven APIs, Parallel and
Perplexity discovery, and safe CLI/build/test/RPC probes. Evidence and the full
per-case matrices are in Solo scratchpad 575 under processes 3325, 3328, 3326,
and 3329.

## Reconciled corrections

- Current static metadata syntax is contractmeta!(...); #[contractevent]
  remains the typed runtime-event attribute.
- Cross-contract authorization combines invocation-tree coverage for external
  addresses with implicit authorization for the directly invoking contract.
- Stable v27 release grader notes must replace, not append beside, the stale
  v26/RC assertion; deploy CLI behavior is release-sensitive.
- Instance growth can reject writes and make growth-dependent paths unavailable
  without proving an irreversible brick.
- no_std does not make allocation, ledger time, or host PRNG access
  impossible; each has explicit cost/security boundaries.
- OpenZeppelin token/upgrade APIs and audit scope are release-sensitive.
- Typed events are the current API; RPC retention is provider/configuration
  dependent.
- Ordinary public reentry is blocked, while internal auth-only modes require
  narrower wording.
- require_auth_for_args, credential paths, replay counters, and direct-invoker
  authorization are distinct mechanics.

The blind review rejected the GT-46 primary's proposed YieldBlox reversal:
current evidence supports the existing max_dev=10 adjacent-round-pass atom,
so the oracle golden was retained. Two documentation gaps were captured as
sd-022 and sd-023.
