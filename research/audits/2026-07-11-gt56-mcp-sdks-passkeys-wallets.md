# GT-56 correction audit — MCP discovery, SDKs, passkeys, and wallets

Date: 2026-07-11 UTC
Authoring process: Solo 3402 (`gpt-5.6-sol`, `max`)
Truth inputs: GT-56 primary process 3394 and accepted final blind process 3398 only

## Scope and controls

This pass authors provenance-bearing corrections for exactly these 12 cases:

1. `q-tool-mcp-servers-skills-discovery`
2. `q-tool-official-sdks-list`
3. `q-tool-passkey-wallet-recovery`
4. `q-tool-passkeykit-smart-wallet`
5. `q-tool-python-sdk`
6. `q-tool-rust-soroban-sdk`
7. `q-tool-sdk-repos-discovery`
8. `q-tool-skill-detail-install`
9. `q-tool-smart-wallet-repos-discovery`
10. `q-tool-wallets-comparison`
11. `q-tool-wallets-kit`
12. `q-tool-which-sdk-comparison`

Processes 3395 and 3396 were coordinator-invalidated with zero verdict
contribution and supplied no semantic input. The author did not run paid
Lumenloop research, read secrets, edit the vendored corpus or mirrored skills,
commit, deploy, create an external issue, or send an external message.

## Accepted blind chronology

- Lock `gt56/blind-lock/process-3398`: `2026-07-11T07:22:53.051Z`.
- Phase 1 remained external-only and filesystem-quarantined.
- Helpers 3399–3401 independently researched their assigned clusters. Their
  parent harvested them; the coordinator closed them and verified all absent at
  `2026-07-11T07:42:32.956Z`.
- Seal `gt56/blind-seal/process-3398`: `2026-07-11T07:47:18.164Z`, exactly 12
  ordered rows, `primaryReportRead=false`, `currentGoldenRead=false`, and
  `filesystemQuarantine=true`.
- Primary report read: `2026-07-11T07:48:21.938Z`.
- Current goldens read: `2026-07-11T07:49:17.792Z`.
- Final exact revalidation: `2026-07-11T07:55:29.756Z`; final flags both true;
  exact marker `GT-56 BLIND COMPLETE — process 3398`.

## Baseline captured before author edits

The workspace was already dirty with prior truth-maintenance, drift, and
improvements work. No reset, checkout, or unrelated rewrite was performed.

| Proof | Before-edit value |
| --- | --- |
| compiled cases | 469 |
| target cases | 12 |
| target semantic SHA-256 | `1fb82e6d8c23e21fe598f550f69e8224d83e0db22502dcad355adfb13a328ddb` |
| non-target cases | 457 |
| non-target semantic SHA-256 | `912bc993c29780064400a430ac5258cbf9120495f9d3aaaa89fcf27cde12b8f8` |
| overrides | 354; none of the 12 target ids present |
| override-key SHA-256 | `bdb836ba0377c0fa1355cf770cc42142dd4bd69dff0be8e556c66604982ea998` |
| raw `golden-overrides.json` | `a92a74a92a3357802d23fc59500021cc248085fa281885e44ee4777b731460ea` |
| raw `cases.json` | `eb586827fdc6e6e86a8f9066c72df0e009192aaa8d5e737e32a837ff7718e985` |
| raw `sample.json` | `12b615ceacd1fa181c2e803e3de5dfca730c36723b92bc89da62fb9e3d4507ce` |
| raw QA README | `1493b73a81e94c0c5d1ed99e4775d03657325fc62123b92c6317c78a0e0b2cc0` |
| raw improvements index | `6d40f54f413061a2fe064b9be11e805b2339c45a6996eb942b048fc6ef0738d7` |
| dirty-status SHA-256 | `7fff14dff25ea21ceef964d2b41f675ef06490f80a424a8511249276057c9779` |

The same baseline is stored in Solo KV
`golden-author/gt56/process-3402` before any file mutation.

## Evidence and truth-domain policy

The 12 overrides use the primary and sealed-blind matrices to triangulate:

- official Stellar/MCP/FIDO/OpenZeppelin documentation (class A);
- current source repositories and release/package metadata (class B/registry);
- live Scout skills/repository results for claims about Scout's own observed
  response (class C), never as self-corroboration;
- cross-case empirical/sibling checks already recorded by the two valid lanes.

Volatile rosters, search results, package versions, module lists, activity, and
maintainer status are dated or expressed as answer-time behavior. A Scout zero
is a soft retrieval fact, not evidence that a repository does not exist. Audit
scope is attached to an exact artifact/release, not inherited from a brand.

## Complete disposition

| Case | Disposition | Durable correction |
| --- | --- | --- |
| MCP-server discovery | retain core; freshness/provenance repair | Live `kind=mcp-server` rows only; row `generatedAt`, source/install/scope/safety; separate connected-server `tools/list` and Agent Skills. |
| Official SDK list | material repair | Split client/XDR from contract SDKs; exact SDF/community tiers; Rust canonical/default, not exclusive; include community Solang/AssemblyScript with maturity caveats. |
| Passkey recovery | material safety repair | Sole-passkey loss may be irrecoverable; only preconfigured surviving authority can rotate; sync, relaying, indexing, and SEP-30 are distinct. |
| PasskeyKit smart wallet | material safety/freshness repair | Greenfield Smart Account Kit 0.4.2 plus exact OZ account-contract release; Passkey Kit legacy, unaudited demo, no-real-value warning; no inherited full-stack audit. |
| Python SDK | freshness/capability repair | Community PyPI `stellar-sdk` / `StellarCN/py-stellar-base`, Horizon+RPC, 15.0.0 on 2026-07-04, Python >=3.10,<4, PyPy 3.11. |
| Rust soroban-sdk | semantic/release repair | SDF Rust contract crate; v27.0.0 on 2026-07-08; target-network compatibility; canonical, not exclusive. |
| SDK repository discovery | live ranking repair | Only current returned rows; dated role/maintainer/archive/activity/direct URL; no static rank, stars, ownership, quality, or safety inference. |
| Skill detail/install | routing/safety repair | Direct exact detail permitted; list/search only for unknown identity; full SKILL.md/support files/dependencies/provenance/review/host install/side effects. |
| Smart-wallet repository discovery | live retrieval repair | Only observed Scout rows; exact zero is not absence; direct current Smart Account Kit/OZ and legacy Passkey Kit verification labeled outside Scout. |
| Wallet comparison | taxonomy repair | Separate wallet product, wallet-building SDK, Wallets Kit, smart-account tooling, hardware wallet products, and WalletConnect protocol; product-specific custody/recovery. |
| Wallets Kit | package/API repair | Community Creit-Tech; v2 JSR `@creit-tech` 2.5.0; dotted npm scope legacy; static `init`, default/configured/optional modules, per-module capabilities. |
| SDK choice | decision-framework repair | Choose execution role first, then capabilities/runtime/releases/compatibility/risk; no blanket SDF/community SLA, audience, quality, or safety ranking. |

Eleven cases receive substantive semantic repairs. The MCP-server case retains
its narrow routing core but receives realtime freshness and provenance changes.

## Sibling consistency sweep

- MCP/detail: `q-tool-cli-skills-discovery` remains broad multi-kind discovery;
  the two GT-56 rows stay narrow MCP-only and exact single-skill detail.
- SDKs: the official-list/choice/Python/Rust rows were reconciled with JS, Go,
  Java, Flutter, package-rename, current-version, Wasm-language, and EVM-porting
  siblings. Client versus contract roles and maintainer tiers now agree.
- Passkeys: recovery and kit rows were reconciled with SEP-30, add-signer,
  P-256/WebAuthn, delegated-auth, and smart-wallet repository siblings. No API
  implies a back door after the sole signer is lost.
- Wallets: comparison/Kit rows were reconciled with Freighter, Wallet SDK,
  connect-button, ecosystem-wallet overview/enumeration, and smart-account
  siblings. Ledger/Trezor and WalletConnect keep distinct product types.

No non-target compiled case is changed by the override application; the final
non-target semantic hash is recorded below after regeneration.

## Improvements dedupe and owner routing

| Candidate | Disposition |
| --- | --- |
| Python SDK RPC omission | Existing `sd-033`; no duplicate. |
| Exact passkey/smart-account repo miss | New recurrence in existing `sls-025`; no smart-wallet-only duplicate. |
| Wallet type/taxonomy/availability | New recurrence in existing `sls-033`. |
| Smart-wallet guide routes to legacy/unaudited Passkey Kit | New verified docs-owned `sd-034`, explicitly distinct from `sd-027` LaunchTube role migration. |
| Wallets Kit JSR/package/API drift in Stellar Docs | New verified docs-owned `sd-035`. |
| Legacy Wallets Kit scope/API embedded in official dapp skill | New verified skill-owner `sk-010`; local mirror remains untouched. |

`improvements/intake.json` maps `sd-034` and `sd-035` to
`stellar/stellar-docs`, and `sk-010` to `stellar/stellar-dev-skill`.

## Final counts, hashes, and gates

Derived counts after regeneration:

- overrides: **354 → 366**; all 12 GT-56 ids applied;
- freshness-sensitive cases: **227 → 238**;
- horizons: docs-release 59, package-release 4, quarterly 62, realtime 7,
  weekly 36, with other horizon counts unchanged;
- improvements: **106 → 109** total (skills 10, Stellar Light/Scout 45,
  Stellar Docs 35, Lumenloop 19);
- compiled cases: 469; deterministic sample: 30.

Semantic and raw proof:

| Proof | Final value |
| --- | --- |
| target semantic SHA-256 | `542a97d31a132c80ffcb827a51909e38671bd5a7d394fbb0bab23fc40f04b843` (changed from baseline) |
| non-target semantic SHA-256 | `912bc993c29780064400a430ac5258cbf9120495f9d3aaaa89fcf27cde12b8f8` (exact baseline match) |
| override-key SHA-256 | `e2c8cb04e974e0072395e979affbce8564f1ef560824a603373b8ebad49429be` |
| raw `golden-overrides.json` | `a98801a453371758341b05dd1deeedf1c76e2d4629f9d8cce509f6546551228d` |
| raw `cases.json` | `4d23f6c029c9b9eef42017555a5df8dc43fd6ccdfcef54b6d7b0e2bdef3237cf` |
| raw `sample.json` | `12b615ceacd1fa181c2e803e3de5dfca730c36723b92bc89da62fb9e3d4507ce` (byte-identical to baseline) |
| raw QA README | `ee451d2b2c3979b216237efcdc24eb293522b7104ac6b070fb062f5b57a9bacd` |
| raw improvements index | `c72277dede2c2f916a38b321970e6b8bc406a5c62ae8400b4643c535776a895e` |

Verification results:

- `node eval/qa/compile-qa.mjs --sample 30` — pass; 469 cases, 238
  freshness-sensitive, sample 30.
- `npm run eval:qa:lint` — pass; **0 judge-blind** avoid items; 57
  informational sourcing guards.
- `npm run improvements:index` — pass; generated 109-finding index.
- `npm run improvements:lint` — pass; 109 findings.
- `git diff --check` — pass.
- `npm run secrets:scan -- --tree` — pass; tracked tree clean.
- scoped untracked high-signal secret scan — no matches.
- scoped untracked whitespace checks — clean after removing two Markdown
  hard-break spaces from this audit header.

## Safety

- Paid Lumenloop used: no.
- Secrets read or printed: no.
- Vendored corpus or mirrored skill edited: no.
- Commit/deploy/external issue/message: no.
- Existing Wrangler process replaced or duplicated: no.
- Unrelated dirty-tree changes reverted or reformatted: no.
