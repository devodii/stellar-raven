---
id: sd-032
service: stellar-docs
status: verified
discovered: 2026-07-11
evidence:
  - stellar/stellar-docs main commit 45770fa8 pins stellar_wallet_flutter_sdk ^1.0.6 and stellar_flutter_sdk ^2.1.3 in the English and Spanish wallet tutorial snippets
  - pub.dev API reported stellar_wallet_flutter_sdk 1.1.3 published 2026-06-24 with stellar_flutter_sdk ^3.2.0 as its dependency
  - pub.dev API reported stellar_flutter_sdk 3.2.1 published 2026-06-28
  - Solo scratchpad 575 GT-55 pre-read-sealed blind process 3393 and author repro process 3397
---

## Finding

The current Flutter Wallet SDK tutorial pins this pair in both English and
Spanish:

```yaml
stellar_wallet_flutter_sdk: ^1.0.6
stellar_flutter_sdk: ^2.1.3
```

As of 2026-07-11, pub.dev reported wallet SDK 1.1.3 and general SDK 3.2.1.
More importantly than simple version age, wallet SDK 1.1.3 declares
`stellar_flutter_sdk: ^3.2.0`. A resolver allowed to select the current wallet
release can therefore conflict with the tutorial's explicit `^2.1.3` general
SDK constraint.

## Evidence

The current docs source, live pub.dev package metadata, and Soneso repositories
independently reproduce the mismatch. The tutorial's “get the latest version”
link does not make the pasted two-line dependency block coherent.

No existing Stellar Docs finding covers language-tab dependency drift.
`sd-006` covered crawler code-block visibility, not whether the indexed/source
snippet is installable.

## Recommendation

Prefer installing only `stellar_wallet_flutter_sdk` when its transitive general
SDK is sufficient. If both packages must be explicit, generate or test the
snippet against current pub constraints and update English/translations
together. Add a dependency-resolution check so a current wallet release cannot
conflict with the documented general SDK range.
