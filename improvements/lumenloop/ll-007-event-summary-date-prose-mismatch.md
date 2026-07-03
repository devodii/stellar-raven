---
id: ll-007
service: lumenloop
status: proposed
discovered: 2026-07-03
evidence:
  - live search_content_semantic events probe (2026-07-03 evening, production)
  - 2 of ~14 India event rows affected (Bhopal + Jabalpur "Build On Stellar" workshops)
  - Solo project 49, todo 807, scratchpad 521
---

## Finding

Event summary prose can contradict the structured `start_at` field. The
Bhopal and Jabalpur "Build On Stellar" workshop rows say "July 27" in
their summary text while `start_at` is 2026-06-27 — a month off, likely a
summarizer date-extraction slip (day/month transposition against a source
that said 27 June). 2 of the ~14 India event rows probed this round are
affected; not yet observed elsewhere, so prevalence beyond this cluster
is unknown.

## Evidence

Live probe 2026-07-03 (production, free ops):
`search_content_semantic({query:"Stellar Build Station India builder
sprint", types:["events"], date_start:"2026-06-01"})` returns both rows
with `start_at: 2026-06-27` and "July 27" in the summary prose. Round
record: Solo scratchpad 521 (deep review report, q-scf-regional-india).

## Recommendation

Add a consistency check in the event summarization pipeline: if the
summary prose contains a date that disagrees with `start_at` by more than
a day, flag or regenerate. Consumers reading only summaries (common for
LLM agents) will report wrong event dates while the structured field is
correct.
