---
id: ll-026
service: lumenloop
status: proposed
discovered: 2026-07-11
intake: unclear
evidence:
  - P4 N2 candidate records the CME Stellar-product announcement on 2026-01-15 and start of trading on 2026-02-09 as distinct facts; solo://proj/49/scratchpad/super-corpus-rebuild--585
---

## Finding

Lumenloop event summaries risk collapsing a product announcement, effective
date, and first-trade date into one event timestamp. For the CME item, January
15 is the announcement while February 9 is the reported start of trading; one
untyped date can produce a wrong answer to either question.

## Evidence

P4 N2 recorded the two dates in its 2026-07-11 candidate review. This is a
proposed factual-model finding awaiting a captured Lumenloop event response and
primary-source URLs in the record.

## Recommendation

Model announcement, effective, launch, and first-trade timestamps separately,
with a short event-type label in every generated summary. Preserve the source
publication date as another distinct field.
