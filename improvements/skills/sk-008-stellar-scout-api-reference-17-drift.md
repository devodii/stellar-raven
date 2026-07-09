---
id: sk-008
service: skills
status: reported-upstream
discovered: 2026-07-09
evidence:
  - live drift issue 14: inventory/stellar-light.json refreshed to OpenAPI/status 1.7.0
  - ecosystem-skills/skills/stellar-light/stellar-scout/references/api-reference.md (mirror of upstream Stellar-Light/stellar-scout @ c2a6f95)
  - upstream issue filed 2026-07-09: https://github.com/Stellar-Light/stellar-scout/issues/8
---

## Finding

The upstream `Stellar-Light/stellar-scout` skill API reference lags the live
Scout OpenAPI 1.7.0 contract for two exposed read endpoints. The live
`GET /api/partners` operation now accepts a `ramps` query parameter and returns
a typed `PartnersResponse` / `Partner` schema, while the skill's
`references/api-reference.md` still lists the older params and a short,
informal row shape. The live `GET /api/repos/explain` response also gained
richer `codeVerified` fields, but the skill prose still documents only the
older high-level response keys.

Because this repo mirrors and bundles the upstream skill as runtime guidance,
agents reading `codemode.skill.read` can miss the new ramp-specific filter and
under-describe repo verification evidence even though the callable API already
supports it.

## Evidence

Live inventory refreshed for issue 14 shows:

- `inventory/stellar-light.json:1753` documents `GET /api/partners` parameter
  `ramps`, with valid values `on-ramp`, `off-ramp`, or comma-separated both.
- `inventory/stellar-light.json` now defines `Partner` and `PartnersResponse`
  component schemas, including partner fields such as `rampTypes`, `seps`,
  `assets`, `freshness`, `trust`, and `verified`.
- `inventory/stellar-light.json` expands repo/code verification output with
  fields such as `mainnetContractId`, `sdkCapabilities`, and `symbols`.

The mirrored upstream skill still says:

- `ecosystem-skills/skills/stellar-light/stellar-scout/references/api-reference.md:244`
  lists `/api/partners` params as `type`, `sector`, `region`, `accepting=1`,
  `q`, and `limit`/`offset`, with no `ramps`.
- `ecosystem-skills/skills/stellar-light/stellar-scout/references/api-reference.md:238`
  describes `/api/repos/explain` as returning `repo`, `routedVia`, `answer`,
  `alternateRepos`, and `sources`, omitting the new code-verification fields.

`gh api repos/Stellar-Light/stellar-scout/commits/main` showed the upstream
skill source still pinned at commit `c2a6f95eeb02261d54a2a72b68595886f8fba0e8`
from 2026-07-08, so `ecosystem-skills/update.sh` has no newer source to mirror.

## Recommendation

Update the upstream `references/api-reference.md` in
`Stellar-Light/stellar-scout` to match OpenAPI 1.7.0 for these endpoints:
document the `ramps` filter and typed partner fields for `GET /api/partners`,
and include the richer `codeVerified` fields for `GET /api/repos/explain`.
After the upstream source changes, rerun this repo's `ecosystem-skills/update.sh`
and `npm run skills:bundle` so runtime skill prose and generated catalog
artifacts stay aligned.
