---
id: sd-022
service: stellar-docs
status: reported-upstream
discovered: 2026-07-11
upstreamTitle: Clarify that Soroban contracts have no allocator by default
evidence:
  - Hello World describes contracts as having no allocator
  - current Rust-dialect/allocator material and soroban-sdk v27 alloc module make allocation optional
  - SDK v27 alloc and no-default-feature compile probes passed
  - Solo scratchpad 575 GT-46 primary 3326 and blind 3329
  - upstream issue filed 2026-07-14: https://github.com/stellar/stellar-docs/issues/2594
---

## Finding

Current introductory wording turns the default no-allocator configuration into
an absolute platform restriction. Soroban contracts are no_std, but the SDK
alloc feature or a custom allocator can enable guest allocation at additional
CPU and code-size cost.

## Recommendation

Say "no allocator by default" in introductory material, link the allocator
caveat, and keep the stronger invariant focused on no_std, unsupported
floating point, and the preference for host-backed SDK types.
