---
id: sd-030
service: stellar-docs
status: reported-upstream
discovered: 2026-07-11
upstreamTitle: Disclose plaintext browser storage for Lab saved keypairs
evidence:
  - Lab Saved Keypairs docs inspected 2026-07-11 restrict the feature to Testnet and Futurenet and say never Mainnet
  - current stellar/laboratory localStorageSavedKeypairs source serializes saved keypair objects into browser localStorage
  - current Laboratory tests persist the S-secret value in the saved object
  - rechecked 2026-07-14: the current page says browser local storage but does not state that it is plaintext JSON; current Laboratory source serializes saved keypairs with JSON.stringify
  - Solo scratchpad 575 GT-54 primary process 3383 and pre-read-locked blind process 3386
  - upstream issue filed 2026-07-14: https://github.com/stellar/stellar-docs/issues/2605
---

## Finding

Stellar Lab documentation does not make the Saved Keypairs storage and offline
boundary prominent enough for a secret-bearing browser tool. Current Laboratory
source serializes saved keypair objects to browser `localStorage` as
plaintext JSON, and current tests place the `S...` secret in that object.
The Saved Keypairs page correctly restricts use to Testnet/Futurenet and says
never Mainnet, but it does not state the concrete storage property: the secret
is persisted as plaintext browser storage, not encrypted custody.

## Evidence

Both GT-54 verification lanes reviewed the current Lab docs and source. The
pre-read-locked blind lane independently confirmed the browser-storage boundary
before reading the primary report, and the final reconciliation records
plaintext JSON in `localStorage` as the controlling fact. No secret was
generated, pasted, saved or transmitted during verification.

This is a docs-content gap rather than a claim that local browser storage is a
remote service. It is also separate from wallet/hardware/external-signature
flows, which avoid placing a production seed in Lab.

## Recommendation

Add one warning beside the existing Saved Keypairs network restriction: an
`S...` secret is stored as plaintext JSON in browser `localStorage`, not
encrypted custody. Keep the existing Testnet/Futurenet-only and never-Mainnet
guidance.
