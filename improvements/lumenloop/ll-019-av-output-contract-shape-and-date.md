---
id: ll-019
service: lumenloop
status: verified
discovered: 2026-07-11
intake: unclear
evidence:
  - current manifest/inventory description for find_av_passages
  - live execute response returned a top-level array, not declared object results shape
  - rows exposed AI summary/long_summary and opaque start_offset but no transcript text
  - created_at values behaved as ingestion metadata rather than reliable recording dates
  - Solo scratchpad 575 GT-44 primary 3316 and blind 3324
---

## Finding

The A/V passage contract is internally inconsistent beyond the already-filed
verbatim-quote claim. Documentation describes an object containing results,
while the live adapter returns a top-level array. It exposes AI summaries and
an opaque `start_offset`, not transcript text or playback seconds. `created_at`
is also described/consumed as a recording date even where it appears to be an
ingestion timestamp for older material.

## Recommendation

Publish one machine-checked response schema and separate recording/event date,
ingestion date, opaque passage-order key, AI summary, and any actual transcript
field. If transcript text is intentionally unavailable, remove quote/timestamp
language from every operation description and example.
