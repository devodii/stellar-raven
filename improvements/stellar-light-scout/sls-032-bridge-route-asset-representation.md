---
id: sls-032
service: stellar-light-scout
status: verified
discovered: 2026-07-10
evidence:
  - live bridge/project discovery surfaced Axelar, Allbridge, Squid, CCTP, and adjacent payment records without route-level asset representation
  - quote-time checks showed canonical Stellar USDC routes via CCTP, Allbridge Core, or Squid Intents while an explicit Axelar route delivered USDC.axl
  - Solo scratchpad 575 GT-15 primary process 3243 and independent blind process 3246
---

## Finding

Bridge discovery is project-level, while safe route selection is asset- and
direction-level. A result that says Axelar, Allbridge, or Squid supports
Stellar does not reveal which messenger is selected, whether the destination
is canonical Circle USDC or USDC.axl, or whether the route is currently quoted
in the requested direction.

In the 2026-07-10 audit, canonical Stellar USDC was reached through CCTP,
Allbridge Core native liquidity, or Squid Intents depending on the route. An
explicit Axelar quote instead delivered USDC.axl. The directory-level project
records cannot express this distinction and can cause a user to receive a
different token representation than intended.

## Evidence

The blind GT-15 lane performed read-only quote-time checks across Allbridge
Next/Core and Squid/Axelar, then verified the destination issuer/SAC or contract
identity. No funded transfer was sent. Provider availability, fees, and timing
remain quote-time observations.

## Recommendation

Model and expose route-level facts or clearly mark directory output as
discovery-only:

- source/destination network and direction;
- source and destination asset identifiers;
- canonical/native, wrapped, bridged, or interchain representation;
- router, messenger, and settlement mechanism;
- current quote support/as-of;
- trust/security dependencies and provider source URL.

Add a canonical-USDC versus USDC.axl regression fixture. An Axelar project hit
must not be answerable as "canonical Stellar USDC route" without live route
evidence.
