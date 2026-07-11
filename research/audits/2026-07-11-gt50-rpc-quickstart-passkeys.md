# GT-50 audit — RPC, Quickstart, providers, networks, and passkeys

Date: 2026-07-11
Authoring process: Solo 3373
Independent evidence: primary 3349; blind 3361; scratchpad 575

## Independence and scope

The blind KV `gt50/blind-lock/process-3361` was created before restricted reads and sealed its
11-case matrix at `2026-07-11T03:53:28.522Z`. Its chronology says the primary report, scratchpad
575, compiled cases, overrides, prior audits, diff, siblings, and improvements were unread at seal.
The later KV fields and scratchpad report record the primary comparison after the seal, complete
descendant harvest/closure, and the exact standalone completion marker. The primary and blind
matrices agree on the durable facts; blind-only refinements were retained where narrower.

| Case | Landed disposition |
|---|---|
| q-infra-query-contract-events-rpc-howto | Full current-schema/cursor/three-limit correction |
| q-infra-quickstart-local-network | Current CLI, four modes, local-only hermetic/faucet boundary |
| q-infra-rpc-event-retention | Provider-configured dispute-aware rewrite; shared GT-52 sibling fix |
| q-infra-rpc-methods-list | Exact 12 methods; ordinary-versus-archive getLedgers |
| q-infra-rpc-provider-archive-tier | Blind-only method-versus-historical-reach wording fix |
| q-infra-rpc-providers-list | Existing 15-row/category correction reverified, not replaced |
| q-infra-secp256r1-passkeys | Full WebAuthn/`__check_auth`/CAP-51 layered security semantics |
| q-infra-simulate-transaction-howto | Core retained; restore/assemble/sign/send/poll precision |
| q-infra-testnet-vs-futurenet | Durable roles retained; provider/version/Friendbot precision |
| q-infra-what-is-stellar-rpc | Rename retained; Classic-plus-contract/non-indexer scope added |
| q-infra-which-indexer | Existing Alchemy/docs dispute reverified, not replaced |

## Source reconciliation

- Retention is a configured ledger range. Current stock/live observations were 120,960 ledgers,
  but the method page's 24-hour/seven-day prose conflicts with source/admin/live behavior and is
  not a universal gate.
- Event response page size, one-request ledger scan span, and retained history are distinct.
- RPC Archive extends `getLedgers` historical reach only. Ordinary RPC still has the method within
  local retention; archive does not imply old events, transactions, or state.
- Current getEvents types are `system` and `contract`; `diagnostic` was rejected live and removed
  from current stream semantics.
- CAP-0051 is the P-256 primitive, not a full WebAuthn verifier. Challenge, authorization context,
  origin, RP ID, flags, credential, replay/counter, and policy checks remain application/RP duties.

## Sibling consistency and improvements

The sweep covered event publishing/indexing, getTransactions limits, self-host retention/history,
Hubble/RPC layering, network passphrases, passkey tooling, and indexer/provider cases. The single
GT-52 retention sibling is the same `q-infra-rpc-event-retention` entry and was landed once.
The matching consistency-register cluster was updated from categorical Horizon and 24h/7d prose
to the same source-conflict, provider-configured, method-specific model.

Existing owners were reused: `sd-023`, `sd-004`, `sd-003`, `sk-003`, `sd-010`, and `sd-008`.
No new finding was filed. Remaining candidates—Quickstart/CLI sibling drift, stale OpenRPC version
metadata, simulateTransaction example parsing, provider endpoint health, and WebAuthn hardening—did
not have two-lane, deduped owner-ready evidence in this authoring scope.
