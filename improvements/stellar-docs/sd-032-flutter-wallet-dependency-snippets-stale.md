---
id: sd-032
service: stellar-docs
status: reported-upstream
discovered: 2026-07-11
upstreamTitle: Avoid stale incompatible Flutter wallet SDK version pins
evidence:
  - stellar/stellar-docs main commit 45770fa8 pins stellar_wallet_flutter_sdk ^1.0.6 and stellar_flutter_sdk ^2.1.3 in the English and Spanish wallet tutorial snippets
  - pub.dev API reported stellar_wallet_flutter_sdk 1.1.3 published 2026-06-24 with stellar_flutter_sdk ^3.2.0 as its dependency
  - pub.dev API reported stellar_flutter_sdk 3.2.1 published 2026-06-28
  - rechecked 2026-07-14: both current tutorial translations still pin ^1.0.6 with ^2.1.3; pub.dev reports wallet SDK 1.1.3 with stellar_flutter_sdk ^3.2.0 and standalone stellar_flutter_sdk 3.3.0
  - Solo scratchpad 575 GT-55 pre-read-sealed blind process 3393 and author repro process 3397
  - upstream issue filed 2026-07-14: https://github.com/stellar/stellar-docs/issues/2606
---

## Finding

The current Flutter Wallet SDK tutorial pins this pair in both English and
Spanish:

```yaml
stellar_wallet_flutter_sdk: ^1.0.6
stellar_flutter_sdk: ^2.1.3
```

As of 2026-07-14, pub.dev reports wallet SDK 1.1.3 and general SDK 3.3.0.
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
SDK is sufficient. If both packages must be explicit, test the pair against
current pub constraints and update English and Spanish together, so the wallet
SDK cannot resolve against an incompatible documented general-SDK range.
