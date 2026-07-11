---
id: sls-025
service: stellar-light-scout
status: verified
discovered: 2026-07-10
evidence:
  - live Scout exact and broad probes for ERC-8004, 8004, stellar-8004, stellar8004, and progax01
  - broad 8004 searches returned trionlabs/stellar-8004 and progax01/stellar8004 while some exact aliases returned zero
  - Solo scratchpad 575 GT-12 primary process 3237 and independent blind process 3241
  - GT-18 recurrence: exact repo search q=x402 returned zero while broader searches and direct repos exposed canonical x402, RouteDock, REAPP, ApiCharge, StellarPay402, AgentCard, and Bear implementations
  - GT-55 recurrence: exact repo search q=subquery/stellar-subql-starter returned zero while the public non-archived repository exists and broader indexer searches returned noisy adjacent rows
recurrences:
  - date: 2026-07-11
    evidence: GT-55 live Scout search returned zero rows for subquery/stellar-subql-starter at 2026-07-11T07:17:33Z; direct GitHub verification confirmed the repository exists, is non-archived, and was pushed in 2026
  - date: 2026-07-11
    evidence: GT-56 live Scout exact repository searches for passkey-kit and smart-account-kit returned zero while direct GitHub verification confirmed both repositories exist; broader smart-wallet vocabulary returned adjacent current rows
  - date: 2026-07-11
    evidence: H1's live searchRepos(q="passkey") returned only two SocketFi repositories while directly discoverable Stellar smart-wallet/passkey repositories remained absent; this is the same coverage/alias-recall defect, not evidence of an exhaustive result. solo://proj/49/scratchpad/super-corpus-rebuild--585
---

## Finding

Scout can retrieve Stellar ERC-8004-style implementation records under broad
`8004` vocabulary while missing exact identifiers and repository aliases. In
the 2026-07-10 audit, broad `8004`/`stellar-8004` probes surfaced the trion and
progax implementations, but exact `ERC-8004`, `stellar8004`, or `progax01`
queries could return zero depending on the surface.

This is not evidence that the projects are absent. Both public repositories
exist, and four referenced pubnet contracts fetched successfully. The alias
miss instead encourages a false negative: "no Stellar implementation exists"
when the records are discoverable only through a broader token.

## Evidence

The GT-12 primary and blind lanes independently ran exact and broad live Scout
queries on 2026-07-10, then verified the repositories and deployments through
GitHub and Stellar CLI. The trion implementation exposes three deployed
registries; the progax repository exposes an independent agent registry.

The older `sls-009` exact-name ranking fix does not cover this recurrence. That
finding concerned an existing exact project-name match being outranked; this
finding concerns identifier, owner, hyphenation, and repository-alias recall
returning no match.

GT-18 reproduced the same false-negative class for `x402`. Exact repo search
returned zero on 2026-07-10, including no canonical x402 Foundation, Stellar,
or OpenZeppelin implementation. Broader repo/project queries surfaced some
ecosystem projects, and direct repository plus network checks confirmed
canonical infrastructure, several testnet deployments, a PoC, and a custom
pubnet implementation. Zero exact results therefore cannot support absence.

GT-55 reproduced the alias/owner-path class again for
`subquery/stellar-subql-starter`. The exact owner/name query returned zero while
the direct public repository remained available. A broader Stellar/Soroban
indexer query returned hundreds of candidates, including irrelevant contracts,
so semantic breadth does not repair the exact-identity miss.

GT-56 reproduced the same class for smart-wallet SDK repositories. Exact live
Scout repository searches for `passkey-kit` and `smart-account-kit` returned
zero on 2026-07-11, while direct GitHub checks confirmed
`kalepail/passkey-kit` and `kalepail/smart-account-kit` exist. Broader
smart-wallet vocabulary returned adjacent current rows, so neither the exact
zero nor the broad semantic neighbors can safely stand in for identity.

## Recommendation

Normalize and index repository/project aliases across search surfaces:

- owner/name, bare repo name, slug, and hyphenless forms;
- standards identifiers such as ERC-8004 and the numeric token `8004`;
- declared project aliases, while preserving that SRC-8004 is project-local
  terminology rather than an official Stellar standard;
- an exact-alias result should outrank semantic neighbors.

Add regression probes for `ERC-8004`, `stellar-8004`, `stellar8004`,
`trionlabs`, and `progax01`. Each should retrieve the appropriate record or
explicitly report which indexed alias is missing rather than yielding a silent
false negative.

Add equivalent x402 probes for `x402`, `x402-foundation`, `x402-stellar`,
`relayer-plugin-x402-facilitator`, `RouteDock`, `StellarPay402`, `AgentCard`,
`REAPP`, and `ApiCharge`, with network/maturity fields kept separate from recall.
Add `subquery/stellar-subql-starter`, `stellar-subql-starter`, and `SubQuery`
as equivalent owner/name and product-alias probes.

Add `kalepail/passkey-kit`, `passkey-kit`, `kalepail/smart-account-kit`, and
`smart-account-kit` as equivalent owner/name and repository-alias probes. Keep
successor/legacy and security status as separately sourced metadata rather than
deriving it from search rank.
