---
id: ll-011
service: lumenloop
status: verified
discovered: 2026-07-10
intake: unclear
evidence:
  - live get_document on research id 66 and article id 6520
  - summaries describe $61 million or $61M XLM and blur attempted incident, affected Blend/YieldBlox component, and containment status
  - primary operator/on-chain evidence establishes a completed 2026-02-22 drain, distinct quarantine, remediation, and unproven attacker recovery
  - Solo scratchpad 575 GT-09 primary process 3226
---

## Finding

Lumenloop's YieldBlox incident summaries repeat material unit, identity, and
status errors. Research document 66 calls the incident attempted, attributes
it broadly to Blend, and describes "$61 million in XLM." Article 6520's long
summary correctly dates February 22, but its short summary still says "$61M
XLM."

The underlying quantity is 61,249,278.3064502 XLM, not a dollar-denominated
asset amount. The event was a completed drain from a community-managed
YieldBlox Blend V2 pool. About 48 million XLM was later quarantined, while
supplier and backstop remediation occurred separately; quarantine and
remediation are not proof of attacker-fund recovery.

## Evidence

Live read-only get_document calls for research id 66 and article id 6520 were
run on 2026-07-10. Their summaries were compared with Script3/YieldBlox
operator notices and postmortem, Reflector disclosures, remediation records,
independent Blockaid/BlockSec reporting, and representative on-chain
transactions.

The evidence supports a manipulated USTRY/USDC SDEX trade propagated through
Reflector Pulse and accepted by the pool. It does not establish a Blend core,
Reflector contract, or Stellar protocol exploit.

## Recommendation

Correct or supersede the published summaries. Store event date separately from
newsletter/article publication date, keep asset quantities separate from USD
valuations, identify the YieldBlox community pool rather than Blend broadly,
and separate completed drain, validator quarantine, remediation, and
attacker-fund recovery.

Add a factual-conflict regression that rejects "$61M XLM," May as the event
date, attempted/contained-before-loss framing, and quarantine-as-recovery.
