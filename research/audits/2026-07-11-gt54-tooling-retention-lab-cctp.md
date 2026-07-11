# GT-54 golden-truth correction audit — tooling, retention, Lab, XDR, and CCTP

Date: 2026-07-11

Authoring process: Solo 3391

Primary verification: Solo 3383

Independent blind verification: Solo 3386

Shared record: Solo project 49, scratchpad 575

## Scope and authoring decision

This audit covers exactly ten active QA cases:

1. `q-ti-secret-key-vs-mnemonic-derivation`
2. `q-ti-self-host-core-rpc-full-history`
3. `q-ti-self-host-retention-backfill`
4. `q-ti-stellar-lab-usage-and-new-ui`
5. `q-ti-testnet-mainnet-migration`
6. `q-ti-testnet-usdc-faucet`
7. `q-ti-tx-too-late-resubmit`
8. `q-ti-video-tutorials`
9. `q-ti-xdr-decode-in-code`
10. `q-tool-cctp-stellar-integration`

The landed shape is eight new `golden-overrides.json` entries and material
amendments to the existing retention and XDR entries. No corpus snapshot was
edited. Every target has a truth domain, multi-class corroboration, provenance,
root cause, sibling sweep, explicit traps, and dated handling for volatile facts.

## Blind chronology verification

The independent lane's chronology was re-read from both its scratchpad report
and KV key `gt54/blind-lock/process-3386` before authoring:

| UTC | event |
|---|---|
| 2026-07-11T05:15:32.768Z | process 3386 called `whoami` and wrote/read the blind lock with `primaryReportRead=false` before prohibited material |
| 2026-07-11T05:32:34.112Z | helper 3387's capacity-blocked partial was harvested for provenance only; verdict contribution was exactly zero; helper closed/absent |
| 2026-07-11T05:33:05.177Z | replacement helper 3390 launched |
| 2026-07-11T05:49:48.542Z | complete matrices from helpers 3388 and 3389 were fully harvested; both closed/absent |
| 2026-07-11T06:01:05.298Z | replacement 3390's actual completion marker and three complete rows were fully harvested; closed/absent |
| 2026-07-11T06:06:25.716Z | all helpers absent; exactly ten cases sealed with `primaryReportRead=false` |
| 2026-07-11T06:06:43.351Z | seal read-back verified ten cases, required fields, and at least two source classes |
| 2026-07-11T06:13:03.599Z | only now were the primary/current corpus/diff/audits read; `primaryReportRead=true` |
| 2026-07-11T06:20:22.916Z | final reconciliation/report completed |

Helper scopes were losslessly accounted for: 3388 covered Lab, migration, faucet,
`tx_too_late`, and videos; 3389 covered XDR and CCTP; replacement 3390 covered
secret derivation, full history, and retention/backfill. The capacity failure
from 3387 supplied no final claim verdict.

## Source policy

Claims were classified per `golden-truth`:

- protocol/implementation facts: official specifications/docs plus versioned
  source or safe executable evidence;
- live product/provider facts: dated official product pages plus live read-only
  service/interface evidence;
- disputes: represented as source disagreement, never averaged or pinned;
- unverifiable deployment/wallet negatives: explicitly scoped to the inspected
  version/configuration instead of generalized.

The main evidence classes were:

- A — Stellar, Circle, BIP/SLIP and product-owner specifications/docs;
- B — versioned Stellar Core/RPC/Horizon/SDK/Lab/Circle CCTP source and releases;
- C — free read-only RPC/Horizon/Iris/media/product surfaces;
- F — published vectors, CLI help, typed XDR round trips, source tests, and
  read-only deployed-interface inspection.

No aggregator corroborated itself. No secret, mnemonic, faucet request,
transaction, signature, deployment, reingestion, backfill, configuration change,
paid Lumenloop request, or write-capable production credential was used.

## Per-case semantic corrections

| case | landed correction |
|---|---|
| secret key vs mnemonic | Separates a 32-byte `S...` child seed from BIP39 entropy/64-byte seed and SEP-5 hardened `m/44'/148'/x'` derivation; records no inverse; corrects current CLI import; marks direct-import backup behavior wallet-specific; treats Lab storage as test-only plaintext browser state. |
| Core/RPC full history | Replaces the compressed setup recipe with explicit Core replay/archive, Captive Core transport, RPC local-method/getLedgers-datastore, Horizon ingestion, Galexie storage, Hubble batch analytics, and ledger-2 boundaries. |
| retention/backfill | Adds RPC v27.1.1 defaults and synchronous datastore-backed `BACKFILL` prerequisites; preserves getLedgers-only direct fallback; distinguishes Horizon v27.0.0 zero/unlimited default, explicit reingestion, and nonzero reaping. |
| Stellar Lab | Uses current feature/signer categories without frozen coordinates; records plaintext `localStorage` and non-air-gap limits; distinguishes `contract asset deploy` from `contract id asset`. |
| Testnet→Mainnet | Keeps separate ledger/state/configuration, qualifies fresh-key advice as prudent/role-specific rather than protocol law, and treats channel accounts as optional throughput architecture rather than account creation. |
| Testnet USDC | Preserves Friendbot=XLM and trustline≠balance; dates Circle faucet/issuer; distinguishes classic issuer, deterministic SAC, and Lab path-payment distribution; turns freshness on. |
| `tx_too_late` | Defines the ordinary outer precondition no-fee/no-sequence scope, separates ambiguous hash lookup from resubmission, and requires current-sequence/bounds/fee rebuild, Soroban re-simulation, re-signing, and a new hash. |
| video tutorials | Adds the official Developer Tutorials playlist and current docs entry points, makes playlist metadata non-gating, rejects upload date as compatibility proof and rejects LumenLoop `start_offset` as automatic playback seconds; turns freshness on. |
| XDR decode | Preserves exact getLedgers/RPC JSON-mode repair while adding explicit envelope/result/`TransactionMeta` outer types, arm-4 MetaV4/`OperationMetaV2` structure, canonical explicit-type XDR-JSON, lossless integers, original-XDR retention, and parse-versus-network-hash semantics. |
| CCTP | Replaces launch-only prose with V2/domain 27, dated deployments, native USDC/SAC identity, source-domain Iris flow, CctpForwarder hook safety, managed-service distinction, and integer 7↔6 decimal normalization. |

## Disputes and non-flattened uncertainty

### SEP-52

SEP-52 v0.1.0 is Draft “Key Sharing Method for Stellar Keys.” It extends SEP-5
with SLIP-39 Shamir mnemonic shares. It is not a 24-word representation of one
`S...` key; recommended 256-bit entropy produces 33-word SLIP-39 shares in the
reference behavior. This corrects both the inherited golden and the primary
review's proposed one-key/24-word replacement.

### Horizon retention wording

Official prose disagrees: one Horizon surface promotes `518400` into default
wording, while configuring/source define executable
`HISTORY_RETENTION_COUNT=0` as unlimited/no automatic reaping. The golden
gates the source behavior and records `518400` as a dated one-month
recommendation. It does not average the values.

### RPC BACKFILL

RPC v27.1.1 source resolves the earlier uncertainty: `BACKFILL=true` is a
synchronous datastore-backed materialization path before normal ingestion.
Coverage remains approximate/configuration-dependent and direct datastore
fallback remains `getLedgers`-only. An environmental linker failure in a wider
methods-package test was inconclusive and was not promoted into product evidence.

### Lab security and SAC identity

Current Laboratory source serializes saved keypair objects, including secret
values in tests, into browser `localStorage` as plaintext JSON. Browser-local
or self-hosted is not synonymous with offline/air-gapped, and source review
cannot prove the universal negative that every runtime has no secret egress.
Separately, `stellar contract asset deploy` deploys a SAC; `stellar contract
id asset` only derives its deterministic ID.

### Circle CCTP conflicts

Circle's Stellar→Arc quickstart passes threshold 1000 and labels it Fast, while
supported-chain/finality/fee matrices mark Stellar-as-source Fast N/A or omit
it. The golden marks source Fast support disputed and recommends Standard
threshold 2000 until Circle reconciles its official surfaces.

Circle's rendered Stellar contracts reference spells
`handle_receive_finalized_message` / `handle_receive_unfinalized_message`,
while official source and deployed interfaces use
`handle_recv_finalized_message` / `handle_recv_unfinalized_message`. The
golden uses the deployed names while recording the documentation contradiction.

The durable CCTP mechanics remain: Circle domain 27, source-domain Iris lookup,
the native classic-USDC/SAC bridge identity, both forwarding fields plus
versioned recipient hook, on-chain CctpForwarder distinct from managed
Forwarding Service, and Stellar 7-decimal local values normalized to 6-decimal
CCTP messages with outbound dust retained/inbound scaling by ten.

## Sibling consistency sweep

The compiled 469-case corpus was searched by topic, then the direct siblings
were read:

- secrets: `q-ti-find-export-secret-key`,
  `q-ti-secret-key-custody-backend`,
  `q-ti-provision-wallet-per-user` and CLI/wallet identity cases;
- retention/history: `q-ti-run-tune-own-horizon`,
  `q-infra-rpc-event-retention`,
  `q-ti-historical-events-beyond-retention`, archive-provider, Hubble,
  Galexie, historical-balance and getTransactions cases;
- Lab/SAC: `q-tool-lab-what-is`, `q-asset-deploy-sac-cli`,
  `q-sor-native-xlm-sac-address` and Quickstart;
- networks/funding: passphrase, Testnet/Futurenet, Friendbot, provisioning,
  SDP and channel-account cases;
- XDR: `q-ti-parse-raw-ledger-data` and
  `q-ti-rpc-gettransactions-pagination-xdr`;
- CCTP: `q-token-circle-usdc-on-stellar` and bridge-route siblings.

The final overrides preserve the already-authored atoms: getLedgers-only direct
archive depth; provider-configured event retention; Horizon zero/unlimited
source default; classic issuer versus SAC; same `G...` text but separate
network state; Friendbot XLM only; and CCTP live date 2026-05-19. No sibling
contradiction remains after the qualifiers above.

## Improvements reconciliation

Three clear, reproducible Stellar Docs content gaps were filed:

- `sd-028` — Horizon `0` executable default versus `518400`
  default/recommendation wording;
- `sd-029` — missing current RPC BACKFILL startup/prerequisite/method-boundary
  documentation;
- `sd-030` — Lab Saved Keypairs plaintext localStorage and
  self-hosted-versus-air-gap boundary.

Existing findings were not stretched:

- `sd-023` remains the static RPC event-retention/default/maximum issue;
- `sk-003` remains the unconditional getLedgers-to-genesis skill promise;
- `sd-024` and `sd-003` are adjacent XDR/resource/indexability findings, not
  the requested MetaV4/XDR-JSON correction;
- `sk-006` is error-keyed discoverability, not `tx_too_late` semantics;
- `sls-032` is route-level canonical/bridged asset representation, not Circle's
  Fast/handler documentation conflicts.

CLI/SEP-52, transaction-timeout wording, migration, faucet, video, and XDR
golden incompleteness did not meet the bar for additional deduped findings.
Circle owns the reproducible Fast and handler conflicts, but
`improvements/` has collections only for the four upstream surfaces this
server fronts; no dishonest Stellar-Docs/Scout placeholder was created and no
external issue/message was sent.

## Derived counts and verification

After deterministic regeneration:

- kept/skipped QA cases: 469 / 69;
- effective/applied overrides: 344 / 344;
- GT-54 target entries: 10 (8 new, 2 amended);
- freshness-sensitive cases: 218;
- freshness horizons: 62 quarterly, 36 weekly, 39 protocol-release,
  49 docs-release, 25 monthly, 2 yearly, 2 scf-round, and one each annual,
  config-release and realtime;
- indexed improvements: 103.

Semantic proof found all ten targets present/applied with zero field mismatches.
The non-target override hash remained
`d28364b26aceefa8b2bc05b38c636451b318e66ea0a5ad756da900b62f3ca88b`,
identical to the pre-authoring baseline; the `GT-54` provenance marker occurs
on exactly the ten requested IDs.

Required gates:

- `node eval/qa/compile-qa.mjs --sample 30` — pass;
- `npm run eval:qa:lint` — pass, 0 judge-blind and 51 informational
  sourcing guards;
- `npm run eval:plan -- eval/qa/results/2026-07-09T19-53-07-variantA.json`
  — pass; headline unchanged at 28/30 required-covered and mean on-plan ratio
  0.977777… (the ignored sidecar's `gradedAt` was refreshed);
- `npm run improvements:index` — pass, 103 findings;
- `npm run improvements:lint` — pass, 103 findings;
- `git diff --check` — pass;
- `npm run secrets:scan -- --tree` — pass for the tracked tree; an explicit
  high-signal/live-env comparison over all ten scoped files, including the four
  new untracked files, also found zero matches.

## Safety and repository scope

Edits are limited to the ten effective golden entries, their generated QA
artifacts and derived README count, this audit, three findings/intake mappings,
and the generated improvements index. The vendored corpus, consistency register,
runtime/catalog/inventory surfaces, unrelated findings, and concurrent dirty-tree
work were not edited by this process. No commit, push, deploy, upstream issue,
message, paid research call, faucet, transaction, signing action, secret access,
or production mutation occurred.
