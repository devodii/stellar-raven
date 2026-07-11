---
id: sk-012
service: skills
status: proposed
discovered: 2026-07-11
evidence:
  - P4 H2 observed skills.stellar-dev.agentic-payments describe "MPP Channel mode" while current official MPP-on-Stellar material names the intent Session and implements it with a one-way payment channel; solo://proj/49/scratchpad/super-corpus-rebuild--585
---

## Finding

The served agentic-payments skill presents "MPP Channel mode" as the public
mode name. Current MPP material uses Session for the payment intent, with a
one-way payment channel as its settlement mechanism; the wording blurs intent
and implementation.

## Evidence

P4 H2 compared the served skill terminology with the current official MPP on
Stellar documentation on 2026-07-11. The architecture is broadly aligned, but
the unqualified public label invites callers to describe a channel mechanism as
the protocol intent.

## Recommendation

Rename the guidance to "MPP Session (channel-backed)" and retain "channel" as
a search synonym. Briefly distinguish Session from one-time Charge behavior and
from the channel that settles the session.
