---
id: ll-024
service: lumenloop
status: proposed
discovered: 2026-07-11
intake: unclear
evidence:
  - P4 N2 candidate contrasts older Meridian 2026 Abu Dhabi/Yas Marina Oct 21-22 records with the current Lisbon/Convento do Beato Oct 28-29 schedule announced as a change on 2026-04-01; solo://proj/49/scratchpad/super-corpus-rebuild--585
---

## Finding

Lumenloop event retrieval can retain stale Meridian venue/date records without
a visible supersession relation. Older Abu Dhabi/Yas Marina October 21-22 facts
conflict with the changed Lisbon/Convento do Beato October 28-29 schedule.

## Evidence

The P4 N2 candidate documents the old and current schedules plus the April 1
change announcement. It is proposed pending a direct response that shows the
stale record returned as current.

## Recommendation

Add event revision and superseded-by metadata. Search results should privilege
the latest official schedule and label historical venue/date records as
superseded rather than returning them as interchangeable facts.
