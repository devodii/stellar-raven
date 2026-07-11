---
id: ll-017
service: lumenloop
status: verified
discovered: 2026-07-10
evidence:
  - exact Tyler van der Hoeven A/V passage query returned ten semantically related but person-unrelated results
  - semantic content search mixed relevant official Tyler material with unrelated low-similarity results
  - official Docs author and event pages provide exact-name controls
  - Solo scratchpad 575 GT-35 primary 3287 and blind 3289
---

## Finding

Person-oriented semantic and A/V searches do not expose enough match provenance
to distinguish an exact named-person hit from topic similarity. An exact Tyler
van der Hoeven query returned ten unrelated passages, while broader semantic
search mixed true Tyler appearances with false positives. This is distinct from
ll-005's silent exact-entity person lane: the semantic lane returns data, but its
relationship to the named person is not answer-safe.

## Recommendation

Expose similarity score, matched text span, entity link, source publication/event
date, and an exact-lexical or exact-entity constraint. For a named-person query,
mark topic-only matches explicitly and do not rank them as attributed content
without an exact name/entity match.
