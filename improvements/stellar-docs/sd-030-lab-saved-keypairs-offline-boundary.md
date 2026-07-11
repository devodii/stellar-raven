---
id: sd-030
service: stellar-docs
status: verified
discovered: 2026-07-11
evidence:
  - Lab Saved Keypairs docs inspected 2026-07-11 restrict the feature to Testnet and Futurenet and say never Mainnet
  - current stellar/laboratory localStorageSavedKeypairs source serializes saved keypair objects into browser localStorage
  - current Laboratory tests persist the S-secret value in the saved object
  - Solo scratchpad 575 GT-54 primary process 3383 and pre-read-locked blind process 3386
---

## Finding

Stellar Lab documentation does not make the Saved Keypairs storage and offline
boundary prominent enough for a secret-bearing browser tool. Current Laboratory
source serializes saved keypair objects to browser `localStorage` as
plaintext JSON, and current tests place the `S...` secret in that object.
The Saved Keypairs page correctly restricts use to Testnet/Futurenet and says
never Mainnet, but readers can still mistake “saved locally” or a self-hosted
Lab instance for encrypted custody or an air-gapped signer.

Self-hosting changes who serves the UI; it does not by itself remove RPC/Horizon,
simulation/submission, package/runtime or other network dependencies. Source
inspection of client-side signing also cannot prove the universal negative that
no deployment/runtime ever transmits a secret.

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

Add a high-visibility warning beside Saved Keypairs and raw-secret signing:

- storage is browser `localStorage`, not encrypted custody;
- use throwaway Testnet/Futurenet material only and never Mainnet authority;
- clearing/browser-profile/extension behavior can affect persistence and backup;
- “local” or “self-hosted” is not synonymous with offline/air-gapped;
- for a real air gap, export unsigned XDR to a separately trusted offline or
  hardware signer and return only the signature/signed envelope;
- do not promise universal non-egress without an audited deployment/runtime.
