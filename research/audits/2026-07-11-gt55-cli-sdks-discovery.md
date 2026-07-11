# GT-55 — CLI, SDK, wallet, Lab, repository, and leaderboard correction audit

Date: 2026-07-11
Author: Solo process 3397 (`gpt-5.6-sol`, `max`)
Scope: 12 GT-55 cases; exactly 10 new target overrides and 2 semantic no-changes

## Boundary and method

This was a forward-only golden-truth correction pass. The author read the
repository instructions, `golden-truth` runbook, `improvements-pipeline`
runbook, their linked charters, PLAN, and ARCHITECTURE before editing. The
vendored corpus remained read-only. Hand-authored changes used `apply_patch`;
`cases.json`, `sample.json`, and `improvements/INDEX.md` came only from their
scripts.

The primary input was process 3392. The independent input was the pre-read
sealed blind process 3393. The author reconciled them rather than copying
either report. Public official docs/source/package/service checks were rerun
only where needed to validate authoring or an improvement candidate. No paid
Lumenloop call, credential, write endpoint, transaction, faucet, container
start, external issue, commit, push, deployment, or external message was used.

## Blind chronology and independence

The Solo KV record proves the blind lane's ordering:

| Event | UTC evidence |
| --- | --- |
| lock written | `2026-07-11T06:37:21.363Z` |
| lock read back | `2026-07-11T06:37:27.875Z` |
| 12-row seal written | `2026-07-11T06:53:52.436Z` |
| seal read back | `2026-07-11T06:53:52.451Z` |
| sealed flags | `primaryReportRead=false`; `currentGoldenRead=false` |
| canonical seal equality | true; FNV-1a `cceb5695` |
| primary first read | `2026-07-11T06:54:15.620Z` |
| current goldens first read | `2026-07-11T06:54:51.452Z` |

The blind lane spawned no helper. Process 3397 also spawned no helper. The
existing Solo `dev` process remained untouched.

## Reconciled dispositions

| Case | Final disposition | Coherent correction |
| --- | --- | --- |
| `q-tool-cli-init-build-deploy` | new override | Current flow and `wasm32v1-none`; replace invalid `stellar network container start` with `stellar container start`; date to CLI/docs release. |
| `q-tool-cli-install` | new override | Remove apt/AUR overreach; retain documented script/Homebrew/Cargo/Windows/Action and Docker execution; label SVM third-party. |
| `q-tool-cli-skills-discovery` | new override | Separate valid kind/source enums from current rows; preserve honest empty categories and answer-time freshness. |
| `q-tool-cli-testnet-identity-howto` | no change | Existing effective override remains semantically and byte-hash unchanged. |
| `q-tool-flutter-mobile-sdk` | new override | Wallet-specific `stellar_wallet_flutter_sdk` over general `stellar_flutter_sdk`; both Soneso/community; dated releases; no comparative safety ranking. |
| `q-tool-freighter-wallet` | new override | SDF-provided, open-source, noncustodial browser/mobile product as of date; not the network's exclusive official wallet. |
| `q-tool-go-sdk-ingest` | new override | Current `github.com/stellar/go-stellar-sdk` module and `/ingest` plus `/ingest/ledgerbackend`; old `stellar/go` paths deprecated. |
| `q-tool-indexer-repos-discovery` | new override | Fresh, directly verified, role-labeled rows; no frozen roster or repoScore-quality inference; external supplements labeled; sls-025 recurrence. |
| `q-tool-java-sdk` | new override | Preserve Lightsail/community ownership; add dated `network.lightsail:stellar-sdk:4.0.0`; remove unsupported safety ranking. |
| `q-tool-js-sdk-package` | no change | No override added; effective compiled case hash remains unchanged. |
| `q-tool-lab-what-is` | new override | Account creation across Mainnet/Testnet/Futurenet; Friendbot only Testnet/Futurenet; retain current official Lab scope. |
| `q-tool-leaderboard-open-issues` | new override | Correct `/api/leaderboard`/`scout.getLeaderboard` route, generatedAt/scope, issue-only caveat, backlog-not-activity/quality framing, realtime freshness; sls-036 recurrence. |

Primary process 3392 proposed six corrections and six no-changes. The valid
blind reconciliation established 10/2. Four blind-only corrections were
accepted because they were independently supported: Flutter package roles,
Freighter exclusivity, Java's unsupported comparative ranking, and leaderboard
route/provenance freshness.

The CLI-install nuance was not copied from either preliminary polarity. Docker
is documented by `stellar/stellar-cli` as container execution. Current official
Docs explicitly label SVM a third-party version manager. The blind lane's
initial “SVM absent” hypothesis was retracted after this evidence; the final
golden does not repeat it.

## Author verification record

### CLI and Docs

- Local `stellar 27.0.0` help accepted
  `stellar container start [local|testnet|futurenet|pubnet]` and rejected
  `stellar network container start` before any container was launched.
- Current official Quickstart getting-started docs use
  `stellar container start local`.
- Current Lab/Quickstart docs and current English source still use
  `stellar network container start testnet`; a current Spanish guide retains
  the same retired nesting for local mode.
- Current `stellar/stellar-cli` README documents script, Homebrew, Cargo, Nix,
  GitHub Action, and Docker execution. The correction gates only the channels
  needed by the case and does not promote apt/AUR without a primary source.
- Current install Docs explicitly call SVM third-party.

### Flutter, Java, Go, and Python

- `stellar_wallet_flutter_sdk` 1.1.3 was published 2026-06-24 and declares
  `stellar_flutter_sdk: ^3.2.0`; `stellar_flutter_sdk` 3.2.1 was published
  2026-06-28.
- Current English and Spanish wallet tutorial snippets still pin wallet
  `^1.0.6` with general SDK `^2.1.3`, which can conflict when the current wallet
  package is selected.
- Current Maven/release evidence agrees on
  `network.lightsail:stellar-sdk:4.0.0` as of 2026-07-11.
- Current Go docs/source use `github.com/stellar/go-stellar-sdk`, with ingestion
  under `ingest` and `ingest/ledgerbackend`; the old module is deprecated.
- Current Client SDKs Docs describe Python as Horizon-only, while Python
  `stellar-sdk` 15.0.0, its source README, and current official Python examples
  support Stellar RPC.

### Live Scout

- At `2026-07-11T07:17:34Z`, the skills payload exposed six valid kinds and
  five valid sources, 30 total rows, but zero current `agent-kit` rows and zero
  current `community` rows.
- At `2026-07-11T07:17:33Z`, exact repo search for
  `subquery/stellar-subql-starter` returned zero while direct GitHub evidence
  confirmed the public non-archived repo. A broad indexer query returned 359
  candidates including irrelevant contracts.
- At `2026-07-11T07:17:34.351Z`, `sort=issues&range=all` returned project
  rollups with `generatedAt`, `openIssuesTotal`, `repoCount`, and
  `lastActivityAt`. Contemporaneous GitHub issue-only counts differed for some
  leaders. The golden preserves scope/cache disagreement and does not average.

## Improvements dedupe and disposition

Three service-owned findings cleared the reproducibility and dedupe bar:

- `sd-031-cli-container-command-drift.md`: current official source and live
  Docs teach a command CLI 27 rejects. Distinct from sd-006 code-block indexing
  and sd-026 optimize-command drift.
- `sd-032-flutter-wallet-dependency-snippets-stale.md`: current tutorial
  constraints can conflict with the current wallet package graph. Distinct
  from crawler visibility.
- `sd-033-python-sdk-rpc-capability-omitted.md`: current Client SDKs prose is
  Horizon-only while the current package/source and other official guides use
  Python RPC. Distinct from sd-003 reference-page indexability.

Existing findings were updated only for genuine recurrences:

- `sls-025`: exact SubQuery owner/name recall miss;
- `sls-036`: issue-sort project/cache/metric scope and backlog semantics.

No external issue was created. Intake routes the three new content findings to
`stellar/stellar-docs`; generated index count is 106.

## Sibling consistency sweep

The compiled corpus was searched by shared entity and corrected token. Direct
siblings checked included:

- CLI/Quickstart: `q-infra-quickstart-local-network`,
  `q-soroban-deploy-cli`, `q-soroban-cli-init-build`,
  `q-tool-cli-testnet-identity-howto`, and
  `q-ti-cli-rust-windows-troubleshooting`;
- skills: `q-tool-mcp-servers-skills-discovery` and
  `q-tool-skill-detail-install`;
- Flutter/SDK roster: `q-tool-official-sdks-list` and
  `q-tool-which-sdk-comparison`;
- wallets: `q-eco-freighter-wallet`, `q-eco-wallets-overview`,
  `q-tool-wallets-kit`, and `q-tool-wallets-comparison`;
- Go/indexing: `q-ti-sdk-package-rename`, `q-infra-which-indexer`,
  `q-infra-galexie-vs-etl`, `q-soroban-event-indexing-design`, and
  `q-tool-sdk-repos-discovery`;
- Java: `q-ti-java-sdk-wallet-feebump` and
  `q-tool-official-sdks-list`;
- Lab/Friendbot: `q-ti-stellar-lab-usage-and-new-ui`,
  `q-infra-friendbot-fund-testnet`, `q-infra-testnet-vs-futurenet`, and
  `q-ti-testnet-usdc-faucet`;
- leaderboard: `q-eco-most-active-defi-projects`.

No sibling answer retains `stellar network container start` as a valid current
command. The no-change targets remained byte-hash identical. No contradiction
was added between community recognition and SDF maintenance, between wallet
and general SDK layers, between raw ingestion and API polling, or between
backlog and activity metrics.

## Machine-checkable semantic proof

- Baseline target override keys: only
  `q-tool-cli-testnet-identity-howto`.
- Final target override keys: that existing key plus the exact 10 correction
  targets above; `q-tool-js-sdk-package` still has no override.
- Exactly 10 target compiled case hashes changed, and they are exactly the 10
  correction IDs.
- `q-tool-cli-testnet-identity-howto` compiled hash remained
  `fe342cfcd60c50f974589e3f8d2026a5088ec29f220efa03c470f6c3360b0cad`.
- `q-tool-js-sdk-package` compiled hash remained
  `bc3d94145114c57907a8ca844690d4918f5db512264dad0907bf585a1f9be913`.
- Non-target override canonical hash remained
  `48d3f774a6c530f45019b071fb97995c935dba667bb020c9b3f98ae4da6c185f`.

Final derived counts:

- 469 kept / 69 skipped;
- 354 authored overrides / 354 applied / 0 stale;
- 227 freshness-sensitive;
- freshness horizons: annual 1, config-release 1, docs-release 55, monthly 25,
  protocol-release 39, quarterly 63, realtime 4, scf-round 2, weekly 35,
  yearly 2, unstated 242;
- 106 improvements findings.

README freshness counts changed and were updated. No README edit was made for
an unchanged derived value.

Key artifact hashes before adding this non-self-hashing report:

| Artifact | SHA-256 |
| --- | --- |
| `eval/qa/golden-overrides.json` | `a92a74a92a3357802d23fc59500021cc248085fa281885e44ee4777b731460ea` |
| `eval/qa/cases.json` | `eb586827fdc6e6e86a8f9066c72df0e009192aaa8d5e737e32a837ff7718e985` |
| `eval/qa/sample.json` | `12b615ceacd1fa181c2e803e3de5dfca730c36723b92bc89da62fb9e3d4507ce` |
| `eval/qa/README.md` | `1493b73a81e94c0c5d1ed99e4775d03657325fc62123b92c6317c78a0e0b2cc0` |
| `improvements/INDEX.md` | `6d40f54f413061a2fe064b9be11e805b2339c45a6996eb942b048fc6ef0738d7` |

## Gates

- `node eval/qa/compile-qa.mjs --sample 30`: pass; 469/69, 354 applied,
  227 freshness-sensitive.
- `npm run eval:qa:lint`: pass; 0 judge-blind findings, 55 informational
  answer-visible sourcing guards.
- `npm run improvements:index`: pass; generated 106 findings.
- `npm run improvements:lint`: pass; 106 findings.
- `git diff --check`: pass.
- `npm run secrets:scan -- --tree`: pass; all tracked files clean.
- Scoped no-index whitespace and high-signal secret scan for the six GT-55
  untracked report/finding files: pass.

## Safety

- Dirty tree and unrelated concurrent work preserved.
- No vendored corpus, consistency register, runtime catalog, inventory, source
  implementation, or secrets file edited.
- No helper or descendant spawned; no unrelated process stopped or closed.
- No paid Lumenloop, secret access/printing, external write, issue/PR, commit,
  push, deploy, faucet, transaction, signing, or production mutation.
- Process 3397 remains open for coordinator consumption.
