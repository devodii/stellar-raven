# GT-52 audit — enumeration, balances, wallets, faucets, history, and Java

Date: 2026-07-11
Authoring process: Solo 3373
Independent evidence: primary 3356; blind 3368; scratchpad 575

## Independence and scope

The blind KV `gt52/blind-lock/process-3368` was created at
`2026-07-11T03:38:31.639Z` with a lock timestamp of `03:38:31.634Z`, before scratchpad 575,
prior outputs/KVs, diff, audits, overrides, or primary material. It sealed its nine-case matrix at
`03:51:53.130Z`; the primary comparison is recorded afterward at `03:59:41.674Z`. The KV records
all helpers harvested/closed, no secret or side effect, and an exact standalone marker.

The primary and blind lanes agree on all durable cores and all three full replacements. The blind
lane showed that the other six cases need material precision rather than source/tag-only changes.

| Case | Landed disposition |
|---|---|
| q-ti-enumerate-all-contracts | RPC non-enumeration, Lab/StellarExpert provenance, live/archive/ever |
| q-ti-enumerate-holders-airdrop | Zero balances, C exclusions, exact-ledger eligibility snapshot |
| q-ti-fetch-all-balances-classic-sac | No SAC double count, token-universe discovery/provenance |
| q-ti-find-export-secret-key | Product-scoped recovery and strict non-disclosure |
| q-ti-freighter-localhost-not-detected | Docs/source dispute with durable diagnostics |
| q-ti-friendbot-ratelimit-alternatives | Backoff, fund-one-create-many, local/public faucet boundary |
| q-ti-historical-events-beyond-retention | Provider range, getLedgers-only archive, dedupe/coverage |
| q-ti-historical-pointintime-balances | Exact reconstruction, deletion/replay, spendable provenance |
| q-ti-java-sdk-wallet-feebump | Java 4.0.0 factories and inner/outer wallet roles |

## Source reconciliation and safety

- Horizon `/accounts?asset` is the Classic trustline enumeration path and may return zero-balance
  trustlines; it excludes C-address contract balances and a moving crawl is not an atomic snapshot.
- SAC is an API over the same Classic balance for G accounts, not a second wrapped copy. C-address
  balances are contract state; arbitrary SEP-41 storage and global token discovery are not standard.
- Current Freighter source exposes mnemonic recovery while imported-key recovery differs. No secret
  export command was executed and no secret/recovery material was requested or displayed.
- Official HTTPS guidance and current Freighter top-level localhost injection behavior address
  different layers and conflict as universal claims; the golden preserves the dispute.
- Archive `getLedgers` depth was directly separated from old `getEvents` by the Quasar probe.
- The Java test was not run because no JRE was installed; only source/release/API evidence is claimed.

## Sibling consistency and improvements

The retention sibling `q-infra-rpc-event-retention` was corrected once in the GT-50 section and cites
both GT-50 and GT-52 matrices. `q-infra-quickstart-local-network` preserves that only local mode is a
hermetic/local-faucet environment.

Existing owners reused: `sd-023`, `sd-018`, `sd-025`, and `sk-003`. No new improvement was filed.
Research candidates without a two-lane deduped filing bar are Lab/StellarExpert list provenance,
exact holder snapshots, unified Classic/SAC portfolios, CLI/Freighter recovery documentation,
Freighter HTTPS/detection reconciliation, Friendbot 429/CI recipes, exact historical-balance SQL,
and a current Java external-wallet fee-bump example.
