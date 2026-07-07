---
id: sk-001
service: skills
status: fixed-upstream
discovered: 2026-07-03
evidence:
  - eval/qa/results/2026-07-03T03-49-35-variantA.json
  - eval/qa/results/2026-07-03T04-13-42-variantA.json
  - caused 2 baseline QA verdicts in the 2026-07-03 round
  - Solo project 49, todo 822, comments 2204-2210
  - eval/qa/results/2026-07-03T16-06-45-variantA.json (q-soroban-deploy-cli, partial) — recurred; live skill.read of build-deploy-invoke still serves wasm32-unknown-unknown while live docs say wasm32v1-none (Solo scratchpad 521)
  - live re-verified 2026-07-06 (eval round todo 846): skill.read of build-deploy-invoke still serves wasm32-unknown-unknown twice (build comment + deploy --wasm path), zero occurrences of wasm32v1-none
  - recurred in the 2026-07-06 QA round: eval/qa/results/2026-07-06T18-48-22-variantA.json (q-soroban-deploy-cli, partial; verdict-review workflow wf_01b3347d-1b8) — live re-probe confirmed wasm32-unknown-unknown still in SKILL.md build/deploy plus development.md and testing.md while developers.stellar.org uniformly says wasm32v1-none (8/8 search hits; rust-dialect page: wasm32-unknown-unknown "not supported" on Rust 1.82+)
  - recurred in the 2026-07-07 artifact-lane QA round: eval/qa/results/2026-07-07T19-58-35-variantA.json (q-soroban-deploy-cli, partial) — transcript sourced `target/wasm32-unknown-unknown/release/*.wasm` directly from `codemode.skill.read("skills.stellar-dev.smart-contracts", sections=["build-deploy-invoke", ...])`; live MCP re-probe on 2026-07-07 found stale `wasm32-unknown-unknown` in build-deploy-invoke (2), development.md (3), and testing.md (3), while Stellar Docs hits for `stellar contract build` returned `wasm32v1-none` and no old target.
  - upstream remediation filed 2026-07-07: stellar/stellar-dev-skill#44; PR stellar/stellar-dev-skill#45 updates the source skill to `wasm32v1-none`, removes `--global`, and switches examples to canonical `--source-account`.
  - fixed upstream and refreshed locally 2026-07-07: PR #45 merged at stellar-dev-skill commit 3d75a157f6fe; `ecosystem-skills/update.sh` now pins `stellar-dev` to that commit.
---

## Finding

The upstream `stellar-dev/smart-contracts` skill instructed the stale build
target `wasm32-unknown-unknown`: SKILL.md lines ~137 and ~145, plus
`development.md` and `testing.md`. The current CLI target is `wasm32v1-none`.
This caused 2 baseline QA verdicts in the 2026-07-03 round. The local Raven
demo and QA goldens now guard against repeating the stale example, and the
mirrored skill has been refreshed from the fixed upstream source.

## Evidence

2026-07-03 eval round results files above; the stale target propagated directly
into agent answers. The 2026-07-07 local mitigation was verified by regenerating
the demo and QA cases, then scanning the local non-mirror changes for the
canonical command forms. Upstream issue #44 and PR #45 carried the source-skill
fix, and the mirror was refreshed through the normal sync path.

## Recommendation

No further upstream action is needed for this finding. Keep the QA overrides as
freshness/canonicalization guards; future syncs should preserve the fixed
`wasm32v1-none`, no-`--global`, `--source-account` examples.
