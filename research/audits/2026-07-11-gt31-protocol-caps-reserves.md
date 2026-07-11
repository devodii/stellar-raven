# GT-31 protocol, CAP, signer, reserve, and incident closure audit

Date: 2026-07-11

Queued correction author: Solo process 3403 (`gpt-5.6-sol`, max)

Scope: nine assigned GT-31 cases plus only their explicit consistency siblings

## Review ordering and method

Process 3403 first verified its Solo identity and the state of the two completed
dependencies. Scratchpad 575 contains the completed primary marker for process
3280 and completed blind marker for process 3282. KV
`gt31/blind-lock/process-3282` records a 2026-07-10T22:27:56.055Z seal after the
blind source/current-case audit and before any primary report or current golden
was read; the blind scratch section records the same ordering. Only after those
checks did this author consume either report.

The current effective compiled corpus was audited before editing. This avoided
overwriting later GT-29/30/32/33/43/44 repairs. Claims were then checked against
current CAP/XDR/Core/host source, official SDF incident and upgrade material,
live Horizon, and two independent public Mainnet RPCs. No paid Lumenloop query
or operator credential was used.

Pinned source heads at the author check:

- `stellar/stellar-protocol`: `fbf05c9d3220b711e181577e7dca19844c765c3c`
- `stellar/rs-soroban-env`: `1d0a2c6a522b1e6bfafed23c047372832a7976a7`
- `stellar/stellar-core`: `c16a6d17c6519505f7d1190fa6594cbdd68bce0c`
- `stellar/stellar-xdr`: `8521b97ba0e8e71d746bf3bd73def92110e6a21f`

## Pre-edit semantic baseline

Captured at 2026-07-11T08:27:32.136Z, before process 3403 changed a repository
file:

| Measure | Baseline |
|---|---|
| Compiled cases | 469: 9 targets, 460 non-targets |
| Overrides | 366 |
| Target override IDs | `q-protocol-23-whisk-caps`, `q-protocol-27-cap-0071` |
| Target-case semantic SHA-256 | `1bc5db870781afdd679651089ace1ef32a60f0e0eb288232fadd63ea32ec2359` |
| Non-target-case semantic SHA-256 | `7b652398e18f45b6fe9c43a0e3af0cc1ed342dd65ef69f70b999ad95a07868ca` |
| Target-override semantic SHA-256 | `00ecaa570c8d8945ba9e1d803cb183d2d47f663ed15e3fd25117b6d69a3c893d` |
| Non-target-override semantic SHA-256 | `9897ead88c108dd4a739ade04f6652b9cb5fae26efbdb2d988bfe36c5aaecb15` |
| Override-ID-set SHA-256 | `e2c8cb04e974e0072395e979affbce8564f1ef560824a603373b8ebad49429be` |
| Raw override-file SHA-256 | `32ed2598a9b2eef51c0fdf2052a403da182f1c7a578a455ddbd426d53ef84430` |
| Raw cases-file SHA-256 | `1d56d5e74af2bcd8dd06f4ec24de547260b8953f137a31a0b4d7fdfcdc3f7f4a` |
| Raw consistency-register SHA-256 | `ed66908e9d6f7dac7806b377bfa1953b09a46a4f257391e74714ae930a4a58aa` |
| Pre-edit dirty-status SHA-256 | `e89ab9a95fc2622f1e25152da495d2399e6d22d9f2077c2a820744ace87eac50` |

Semantic hashes use recursively key-sorted JSON, with case arrays sorted by ID.
The dirty tree already contained the coordinated truth-maintenance pass; those
files were treated as shared state, not process-3403 ownership.

## Nine assigned dispositions

| Case | Disposition | Reconciliation |
|---|---|---|
| `q-protocol-23-whisk-caps` | Correct | Lists all eight P23 CAPs: 0062, 0063, 0065, 0066, 0067, 0068, 0069, 0070. Uses `limits/slp-0004.md`; separates initial setting 1 from later setting 2 and dates the live configuration. |
| `q-protocol-24-whisk-incident` | Correct | Records the latest-TTL/stale-entry-version eviction defect; 478 affected, 84 restored, 77 modified, 394 CAP-amended; CAP-0076 fee-pool remediation for 31,879,035 stroops. Retains no-fork and removes the false broad no-loss trap. |
| `q-protocol-27-cap-0071` | Correct | Replaces pending/future judge prose, records first live P27 ledger 63386819, preserves delegation/address-bound V2 mechanics, and separates CAP Accepted status from network activation. |
| `q-protocol-accounts-signers-thresholds` | Correct | Classic signer arms are ed25519, preauth transaction, hashX, and ed25519 signed payload. secp256r1 stays in Soroban custom auth. Default sequence +1 is qualified by CAP-0021 `minSeqNum`. |
| `q-protocol-amm-cap-0038` | **No change** | Current answer already correctly says Protocol 18/CAP-0038, native constant-product/path-routing liquidity pools, not a contract. |
| `q-protocol-base-reserve-min-balance` | Correct | Adds the sponsorship-aware formula, separate selling-liability spendability, sponsored zero start and obligation shift, two-reserve pool-share trustline, dated 0.5 XLM, and contract rent boundary. |
| `q-protocol-bls12-381-cap59` | **No change** | Current answer already correctly says CAP-0059/P22, Mainnet 2024-12-05, native BLS12-381 host functions, distinct from BN254/Poseidon. |
| `q-protocol-bn254-poseidon-xray` | Correct | Names the exact three CAP-0074 BN254 functions and two CAP-0075 permutation primitives, records completed P25 activation, avoids invented hash helpers, and discloses current source errata. |
| `q-protocol-cap-process` | Correct | Adds acceptance/rejection FCP branches and Implementation Review; separates normative status, implementation/release, and per-network activation; uses SCP/FBA quorum semantics; retains CAP versus SEP. |

## Live and source findings

- Horizon ledger 63386818 closed under P26 at 2026-07-08T17:00:05Z;
  ledger 63386819 closed under P27 at 17:00:10Z. Two independent RPCs still
  reported P27 during the 2026-07-11 check.
- Both RPCs returned `CONFIG_SETTING_CONTRACT_PARALLEL_COMPUTE_V0` value 2,
  last modified at ledger 60993066. Horizon dates that ledger to
  2026-01-29T17:00:09Z. CAP-0063 itself initialized the value to 1.
- Horizon ledger 63426130 reported `base_reserve_in_stroops=5000000` on
  2026-07-11. Current Core computes minimum balance without liabilities and
  subtracts selling liabilities separately from available balance.
- CAP-0076 and two SDF incident accounts support 394 never-restored plus 84
  restored entries. The Core security release note says 396 repairable plus 84,
  which conflicts arithmetically with its own 478 total; the CAP's attached
  scope and SDF assessment control.
- CAP-0075 reproducibly says P25 in its preamble and function gates but P24 in
  Backwards Incompatibilities. It specifies `U32Val` 0/1 field selection while
  the shipped host environment uses `Symbol` values `BLS12_381`/`BN254`.
  `sd-021` remains the Docs/API explanation owner; new `sd-036` records only the
  protocol-source errata and resolves intake to `stellar/stellar-protocol`.

## Overlap reconciliation

The following later coherent fixes were preserved without rewriting their
answers: `q-protocol-parallel-execution`, `q-protocol-version-history-list`,
`q-protocol-19-preconditions-cap-0021`, `q-pc-sponsored-reserves`,
`q-pc-account-activation-not-found`, `q-asset-amm-fee-reserve`,
`q-sor-x-ray-bn254-sdk-gap`, `q-protocol-cap-vs-sep`, and
`q-protocol-validator-upgrade-vote`.

Only still-reproducible overlap defects were changed:

- `q-edge-noinfo-cap-fake-sharding`: canonical SLP path and configuration
  freshness.
- `q-protocol-current-mainnet-version`, `q-soroban-auth-delegation-p27`, and
  `q-pc-protocol-upgrade-timing`: replace contradictory pre-vote judge prose;
  preserve their later coherent answers.
- `q-pc-sequence-numbers-ordering-replace`: qualify the GT-30 absolute N+2
  statement with CAP-0021 `minSeqNum`; preserve queue/fee-bump guidance.

## Changed artifacts and safety boundary

Process 3403 authors the GT-31 override changes, the new consistency sweep,
this report, `sd-036`, and its owner-correct intake override. Compiled corpus,
sample, README counts, and the improvements index are generated only by their
repository scripts. No external issue or message was sent; no commit, deploy,
paid operation, credential use, or unrelated edit was performed.

## Post-edit verification

Regeneration retained all **469** cases and produced **372** overrides. Seven of
the nine targets now have overrides; the target override IDs are:

- `q-protocol-23-whisk-caps`
- `q-protocol-24-whisk-incident`
- `q-protocol-27-cap-0071`
- `q-protocol-accounts-signers-thresholds`
- `q-protocol-base-reserve-min-balance`
- `q-protocol-bn254-poseidon-xray`
- `q-protocol-cap-process`

`q-protocol-amm-cap-0038` and `q-protocol-bls12-381-cap59` remain explicitly
no-change and override-free. The override-ID set grew only by the five newly
corrected targets plus `q-pc-sequence-numbers-ordering-replace`; no override ID
was removed. Freshness-sensitive cases increased from 238 to 241 because P23,
the reserve value, and the fake-sharding/current-setting sibling now expose
their configuration-release horizon. The generated improvements index contains
110 findings after adding `sd-036`.

Post-edit semantic capture at 2026-07-11T08:50:28.662Z:

| Measure | Post-edit |
|---|---|
| Cases | 469: 9 targets, 460 non-targets |
| Overrides | 372: 7 target, 365 non-target |
| Target-case semantic SHA-256 | `b7a58fc1962eff814971277fe45c8a4fbf8277f66860fb4b02d70b00a9e62c22` |
| Non-target-case semantic SHA-256 | `35dce14edf8fee547150d4bbc08d1e245c8b756897b01dbd61c4b1db546e7295` |
| Target-override semantic SHA-256 | `f9cca65cc7489db8460d94c37ad5b2d5dab51395873eaa53eefc668146f6ade6` |
| Non-target-override semantic SHA-256 | `408083a44ba3909a7605411fb842b813157e80d38f18b9523d6f480407579502` |
| Override-ID-set SHA-256 | `e042afce900bbd7fe27bae70202110240eb873d3d0b8a418a4ef4964b85f96b0` |
| Raw override-file SHA-256 | `099933b84e77f92a858ecb11b566d60a7d73afc0c2fbd9c45bc8b81361630caa` |
| Raw cases-file SHA-256 | `ce2762f4e6d035235a19c907f97eec8319e690d6d1ed67db55b2d887ef7f3eff` |
| Raw consistency-register SHA-256 | `cce3905552c599bd5861029c9eb0abe76f97882d32dd051ac180ba2e033659a9` |

The target semantic delta is the seven intended corrections. The non-target
delta is limited to the five named overlap repairs: the new CAP-0021 sequence
override, three replacement-only P27 judge-note repairs, and the fake-sharding
SLP path/freshness correction. Generated `cases.json`, `sample.json`, and
`improvements/INDEX.md` came from repository scripts; README counts were updated
because the freshness count changed.

Required gates:

| Gate | Result |
|---|---|
| `node eval/qa/compile-qa.mjs --sample 30` | Pass; 469 kept, 69 skipped, sample 30, freshness 241 |
| `npm run eval:qa:lint` | Pass; 0 judge-blind findings, informational sourcing guards only |
| `npm run improvements:index` | Pass; generated index with 110 findings |
| `npm run improvements:lint` | Pass; 110 findings |
| `git diff --check` | Pass |
| `npm run secrets:scan -- --tree` | Pass; all tracked files clean |
| Scoped untracked whitespace checks | Pass; report and `sd-036` produced no whitespace diagnostics |
| Scoped untracked secret check | Pass; both files checked against high-signal patterns and 17 local secret values without disclosure |
| Targeted compiled semantic assertions | Pass; all required mechanics, counts, paths, status splits, and no-change targets verified |

Safety re-check: no paid Lumenloop, external issue/message, commit, deploy,
secret output, or unrelated author edit occurred. Process 3403 remains open for
the coordinator's final all-corpus gates and cleanup.
