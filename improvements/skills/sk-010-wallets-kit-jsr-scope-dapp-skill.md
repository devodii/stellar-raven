---
id: sk-010
service: skills
status: reported-upstream
discovered: 2026-07-11
evidence:
  - stellar/stellar-dev-skill commit c2f3c0728c32044ed8b6d696767c3aed71b4e32d dapp SKILL.md installs and imports @creit.tech/stellar-wallets-kit
  - the same dapp skill uses the legacy new StellarWalletsKit constructor and allowAllModules API
  - current Wallets Kit maintainer documentation prefers JSR @creit-tech/stellar-wallets-kit and static StellarWalletsKit.init with configured/default modules
  - local pinned mirror ecosystem-skills/skills/stellar-dev/dapp/SKILL.md reproduces the upstream source bytes; Solo scratchpad 575 GT-56 process 3398 records the owner split
  - upstream issue filed 2026-07-13: https://github.com/stellar/stellar-dev-skill/issues/56
---

## Finding

The official `stellar/stellar-dev-skill` dapp skill embeds a stale Stellar
Wallets Kit dependency and API. At pinned upstream commit
`c2f3c0728c32044ed8b6d696767c3aed71b4e32d`, its recommended dependencies install
the legacy dotted npm scope `@creit.tech/stellar-wallets-kit`; the multi-wallet
example imports that scope and uses `new StellarWalletsKit(...)` with
`allowAllModules()`.

The kit maintainer's current v2 guidance prefers the JSR scope
`@creit-tech/stellar-wallets-kit` and static `StellarWalletsKit.init(...)` with
configured/default modules. An agent following the current skill can therefore
generate legacy installation and integration code even when it correctly chose
the official Stellar skill.

## Evidence

The repo's pinned mirror reproduces the upstream `stellar-dev-skill` source and
records the exact source commit in `ecosystem-skills/MANIFEST.json`. The stale
commands occur in `ecosystem-skills/skills/stellar-dev/dapp/SKILL.md` under
Recommended Dependencies and Stellar Wallets Kit (Multi-Wallet). Current owner
evidence is:

- https://github.com/stellar/stellar-dev-skill/blob/c2f3c0728c32044ed8b6d696767c3aed71b4e32d/skills/dapp/SKILL.md
- https://stellarwalletskit.dev/installation.html
- https://github.com/Creit-Tech/Stellar-Wallets-Kit
- https://jsr.io/@creit-tech/stellar-wallets-kit

The docs-owned copy is tracked separately in `sd-035`; this finding targets only
the upstream skill repository. The local mirror must not be edited as a fix.

## Recommendation

Update the dapp skill to prefer the v2 JSR package and current static-init API.
Teach `defaultModules()` versus explicitly configured optional modules and their
prerequisites, and add a dated migration note for users still on the dotted npm
scope/v1 API. Add a source check or test that compiles the Wallets Kit snippet
against the documented current package so embedded dependency drift is caught
before the next skill release.
