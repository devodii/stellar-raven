---
id: sd-013
service: stellar-docs
status: verified
discovered: 2026-07-10
evidence:
  - official Create Account and Account Merge documentation/result-code pages
  - CAP-0033 sponsored-reserve semantics
  - current stellar-core CreateAccountOpFrame and MergeOpFrame behavior
  - Solo scratchpad 575 GT-29 primary 3276 and independent blind 3278
---

## Finding

The account lifecycle documentation presents the ordinary unsponsored path as
if it were universal and under-documents current merge behavior.

- Create Account copy says every account needs the current 1 XLM minimum, but
  CAP-0033 permits a sponsored account to be created with `startingBalance=0`
  while the sponsor carries the account reserves.
- Account Merge result/help text emphasizes trustlines and offers but does not
  explain that current Core permits signer-only subentries and removes those
  signers during deletion, including sponsored signers. The blocking
  sponsorship relation is asymmetric: an account providing sponsorship or
  responsible for future reserves cannot merge, while merely being sponsored
  is not the same prohibition.

This makes correct applications overfund sponsored accounts or require unsafe,
unnecessary signer cleanup before a destructive merge.

## Recommendation

Document the two account-creation paths explicitly:

- ordinary/unsponsored creation requires two current base reserves;
- sponsored creation may use zero starting balance when CAP-0033 sponsorship
  is correctly established, with reserve responsibility shifted to the sponsor.

For Account Merge, list non-signer subentries and sponsoring obligations as the
relevant blockers, state that remaining signers are removed by merge, and give
one sponsor-versus-sponsored example. Keep numeric reserve amounts dated and
link the current network parameter source.
