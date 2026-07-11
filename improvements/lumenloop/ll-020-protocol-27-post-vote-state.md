---
id: ll-020
service: lumenloop
status: proposed
discovered: 2026-07-11
intake: unclear
evidence:
  - P4 N2 live-candidate review found the indexed Zipper Protocol 27 item remains a pre-vote guide saying "mainnet vote July 8" and cannot itself establish activation; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - the existing ll-015 finding independently records the linked primary source and Horizon boundary as July 8 activation, showing why schedule text must not stand in for current state
---

## Finding

Lumenloop's Protocol 27 editorial retrieval leaves a pre-vote scheduling item as
the available event record without a superseding activation/status record. A
consumer can recover the July 8 vote schedule but cannot determine from that
record whether the vote passed or when Mainnet activated.

## Evidence

The P4 N2 candidate probe on 2026-07-11 found the indexed Zipper item framed
as a pre-vote guide. The separate live/primary reconciliation already recorded
in ll-015 establishes that activation occurred on July 8. This is a proposed
coverage/supersession finding pending a fresh production retrieval transcript.

## Recommendation

Publish or index a post-vote record with separate `scheduledAt`, `voteResult`,
and `activatedAt` fields, and mark the pre-vote guide as superseded for current
status queries. Do not make a schedule alone answer a passage/activation query.
