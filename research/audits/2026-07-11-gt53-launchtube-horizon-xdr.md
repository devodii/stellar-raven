# GT-53 audit — relaying, custody, Horizon, SDKs, and raw XDR

Date: 2026-07-11
Authoring process: Solo 3382
Independent evidence: primary 3372; blind 3378; scratchpad 575

## Independence and chronology

The blind KV `gt53/blind-lock/process-3378` was written and read at
`2026-07-11T04:23:07.067Z` before scratchpad 575, the primary report/KV, current
goldens, overrides, audits, or the diff were read. Children 3380, 3381, and
3379 were fully harvested before close. The ten-case independent matrix was
sealed and read back at `04:50:20.546Z` with `primaryReportRead=false`; primary
and current-material comparison began only afterward and completed at
`04:59:32.223Z`. The blind report/KV were verified before its exact standalone
completion marker was appended at `04:59:58.716Z`.

Primary child 3376 produced no output and contributed no evidence. The blind
parent and harvested child 3379 independently re-derived its Horizon,
Scaffold, and SDK scope before authoring.

## Landed dispositions

| Case | Disposition |
|---|---|
| q-ti-launchtube-mercury | Full dispute-aware lifecycle/role correction; monthly freshness |
| q-ti-multisig-recover-lobstr-vault | Preserve protocol core; add distinct Vault phrase and current-high-threshold recovery decision tree |
| q-ti-openzeppelin-relayer | Full self-hosted Relayer versus managed Channels/funding/version/status correction |
| q-ti-parse-raw-ledger-data | Full field-to-XDR/raw-versus-parsed/JSON/data-lake-boundary repair |
| q-ti-provision-wallet-per-user | Preserve lifecycle core; add muxed non-account/internal-ledger and dated reserve/headroom precision |
| q-ti-rpc-gettransactions-pagination-xdr | Preserve prior sd-003/sd-004 correction; replace stale note and add inclusive-start/cursor-only/exact-XDR/JSON semantics |
| q-ti-run-tune-own-horizon | Expand current topology, retention, security, Docker, tuning, and upgrade behavior; retain v24 as unverifiable |
| q-ti-scaffold-stellar | Replace frozen core-CLI probe with separate-plugin/full-stack-versus-contract-only/current-source guidance |
| q-ti-sdk-package-rename | Add v11 rename history, separate v16 migration, and date all registry/release values |
| q-ti-secret-key-custody-backend | Preserve custody split; add no-plaintext detached signing, intent policy, PureEdDSA, and safe on-ledger rotation |
| q-ti-self-host-retention-backfill | Grader-note-only repair: source default 0/unlimited; 518400 remains a recommendation |
| q-ti-xdr-decode-in-code | Precision-only sibling repair: exact getLedgers types and `xdrFormat=json` field renaming |

## Disputes and freshness boundaries

- Official Stellar pages conflict on LaunchTube: the current Relayer page says
  it is discontinued/replaced, while the published Guestbook still requires a
  LaunchTube JWT. The golden gates the durable role split and disclosure, not a
  universal availability claim.
- OpenZeppelin's repository release was v1.6.0 on 2026-07-11 while rendered
  documentation still exposed 1.5.x/current paths. Hosted reachability and the
  status feed are dated observations, not permanent health guarantees.
- Current Horizon source defaults `HISTORY_RETENTION_COUNT=0` (unlimited),
  while official docs recommend 518400 ledgers for an approximate month and
  contain inconsistent default wording. The executable source default and the
  recommendation remain separate.
- Crate, SDK, Go module, provider, network-reserve, and release values are
  explicitly dated. Stable historical anchors such as the npm v11 rename are
  separated from current-version examples.

## Sibling consistency and improvements

The sweep covered passkey-kit/smart-account-kit, classic multisig and SEP-30,
custody/provisioning/C-address cases, RPC retention/archive cases, Galexie and
Hubble roles, and JS/Python/Go package cases. The requested retention and XDR
siblings were repaired in the same bundle; otherwise the existing siblings
remain consistent.

Existing owners were reused: `sd-003`, `sd-004`, and `sd-013`; `sd-017` remains
limited to Horizon lifecycle wording. One new two-lane, deduplicated,
owner-ready finding was filed: `sd-027`, for the contradictory LaunchTube
Guestbook/migration guidance.

The following remain candidates only: OpenZeppelin Relayer-versus-Channels
version/funding/status cleanup (cross-owner); one raw-XDR type/raw-versus-SDK/
JSON/decompression cross-link; Horizon retention-default and Docker-command
correction; Scaffold repository/template/plugin refresh; JS migration
discoverability; and a production custody/detached-signing guide. They were not
promoted without a clean two-lane owner boundary.

## Safety

Research and verification were read-only. No paid Lumenloop operation, secret,
funded request, account/transaction mutation, commit, push, deploy, or process
replacement was used. The existing dirty tree was preserved.
