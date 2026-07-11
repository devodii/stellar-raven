# GT-51 audit — bindings, wallets, explorers, submission, and custody

Date: 2026-07-11
Authoring process: Solo 3373
Independent evidence: primary 3353; blind 3360; scratchpad 575

## Independence and scope

The blind KV `gt51/blind-lock/process-3360` records Solo `whoami` as the first task action and a
pre-read lock before scratchpad 575, primary material, prior output/KV, diff, audits, overrides, or
compiled goldens. The nine-case matrix was sealed at `2026-07-11T03:50:00.777Z`; only afterward did
the reviewer read and reconcile primary 3353. The KV also records all three descendants harvested
and closed and one durable standalone completion marker.

| Case | Landed disposition |
|---|---|
| q-ti-bindings-to-nextjs-integration | Current generated `Client`, client boundary, fee semantics |
| q-ti-block-explorer-basics | Network/identifier discipline and dated product coverage |
| q-ti-channel-accounts-throughput | Source/signature mapping, immutable envelope, no TPS promise |
| q-ti-classic-submission-errors | Generic versus Payment/SetOptions result-code namespaces |
| q-ti-cli-rust-windows-troubleshooting | Winget/prebuilt first, MSVC prerequisites, current target |
| q-ti-compute-token-lp-market-data | Methodology/data boundary plus Horizon dispute/freshness |
| q-ti-connect-wallet-button-code | Structured results and current `requestAccess` flow |
| q-ti-contract-verification-explorers | SEP-55/58, Lab provenance, verification-not-safety |
| q-ti-custodial-account-generation-c-address | G/C creation/auth, sponsorship, muxed memo route |

## Reconciled disagreements

- Generated binding source controls over a stale generated README. Current output exports `Client`;
  exact generated/package APIs remain release-sensitive and must compile against installed types.
- `op_bad_signer` was not deleted: it remains the documented SetOptions-specific label paired with
  `SET_OPTIONS_BAD_SIGNER`; generic operation authorization is `op_bad_auth`.
- The market-data slug uses “compute” as a verb. An independently discovered asset named COMPUTE is
  unrelated and deliberately excluded from the golden.
- `requestAccess` is the current recommended one-call permission/address flow. `setAllowed` remains
  valid, but cannot substitute for structured result handling, network checks, and rejection UX.
- SEP-55 attestation and SEP-58 reproducible-build vocabulary are complementary Draft standards.
  Only current Lab implementation was directly confirmed; other explorer support stays unclaimed.

## Sibling consistency and improvements

The sweep included binding/deploy/fee siblings, Freighter/Wallets Kit, channel/fee-bump/retry,
Horizon lifecycle/Hubble, build verification, C-address/SAC, and CLI installation/build targets.
The shared RPC/Horizon consistency-register cluster was updated to disclose the official lifecycle
wording conflict rather than retaining a categorical deprecated/not-deprecated sentence.

Existing owners reused: `sk-006`, `sd-017`, `sd-023`, `sd-013`, and fixed `sk-001` context.
No new improvement was filed. Two owner-worthy candidates remain documented but did not clear the
two-lane direct-defect bar here: the Stellar frontend guide's structured `isConnected`/connect-flow
drift, and stellar-cli's stale generated TypeScript README. The SDK-major duplication observation
compiled successfully and remains investigation-only.
