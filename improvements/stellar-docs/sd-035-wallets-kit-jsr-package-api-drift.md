---
id: sd-035
service: stellar-docs
status: verified
discovered: 2026-07-11
evidence:
  - current Stellar developer wallet tooling documentation references the legacy dotted npm Wallets Kit scope
  - current maintainer installation guide prefers the v2 JSR package @creit-tech/stellar-wallets-kit and labels @creit.tech/stellar-wallets-kit the legacy npm compatibility scope
  - JSR reports v2.5.0 published 2026-06-29 and current Creit-Tech source uses static StellarWalletsKit.init with configured/default modules
  - Solo scratchpad 575 GT-56 sealed blind process 3398 and primary process 3394 independently verified package, API, and module-status drift
---

## Finding

Current Stellar developer documentation for Stellar Wallets Kit lags the
maintainer's v2 distribution and API. The docs still lead with the dotted npm
scope `@creit.tech/stellar-wallets-kit`, while the maintainer now prefers the
JSR scope `@creit-tech/stellar-wallets-kit` and warns that npm compatibility
publishing may stop. Current v2 source uses static `StellarWalletsKit.init(...)`
with configured modules; older constructor/`allowAllModules` examples do not
describe the current default/optional module model.

This package/API drift also obscures capability boundaries. `defaultModules()`
does not mean every exported module is active, and WalletConnect or hardware
modules have additional configuration, dependency, or environment requirements.

## Evidence

GT-56 independently compared the current Stellar page with the maintainer site,
JSR registry, repository/release, and module source. The direct reproduction
URLs are:

- https://developers.stellar.org/docs/tools/developer-tools/wallets
- https://stellarwalletskit.dev/installation.html
- https://stellarwalletskit.dev/kit-structure.html
- https://jsr.io/@creit-tech/stellar-wallets-kit
- https://github.com/Creit-Tech/Stellar-Wallets-Kit

The separate upstream skill copy is tracked in `sk-010`; this finding remains
owned by `stellar/stellar-docs`.

## Recommendation

Make the v2 JSR scope the primary install path and label the dotted npm scope as
legacy compatibility. Replace v1 constructor/`allowAllModules` snippets with the
current static initialization and `defaultModules()`/explicit-module model.
Document configured/default versus optional modules and link each module's
current prerequisites and supported signing methods. Date the package/API note
and cross-link the maintainer's migration guidance.
