---
id: ll-017
service: lumenloop
status: reported-upstream
discovered: 2026-07-10
evidence:
  - exact Tyler van der Hoeven A/V passage query returned ten semantically related but person-unrelated results
  - semantic content search mixed relevant official Tyler material with unrelated low-similarity results
  - official Docs author and event pages provide exact-name controls
  - Solo scratchpad 575 GT-35 primary 3287 and blind 3289
  - 2026-07-13 production Justin Rice interaction recovered exact-name historical event rows only after broad semantic search
  - 2026-07-13 localhost Strupey probe returned voluminous semantic neighbors but zero exact-token rows across the broad families
  - Solo scratchpad 611 evidence-poor retrieval review
  - https://github.com/lumenloop/lumenloop-backend/issues/36
recurrences:
  - date: 2026-07-13
    evidence: production rays a1a519aa3907e144 through a1a51b394acdc572 recovered exact-name Justin Rice history only after broad semantic search, while narrow operations were empty or adjacent
  - date: 2026-07-13
    evidence: localhost Strupey broad-family probe returned voluminous semantic neighbors but no exact-token result row, reproducing the missing match-provenance risk on a negative control
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

## Recurrence — 2026-07-13

Production rays `a1a519aa3907e144` through `a1a51b394acdc572` showed both sides of
the provenance gap. Narrow directory/project/docs calls for Justin Rice returned
empty or adjacent `ok` data; the later `search_content_semantic` call recovered
exact-name, dated 2020–2021 Stellar event records. A negative-control localhost
probe for `Strupey` also returned large semantic result sets, but compact
exact-token projections found no row containing the requested term in LumenLoop,
Scout research/projects/builders, or Stellar Docs.

The gateway now labels semantic rows as candidates and exposes bounded recovery
operations separately from ranked search hits, but it still cannot manufacture
the missing upstream match provenance. This finding remains the upstream owner
for exact lexical/entity flags, matched spans, similarity, and source/date fields.

The targeted QA run `eval/qa/results/2026-07-13T18-59-22-variantA.json`
confirmed the residual risk. The Strupey open-world case correctly rejected
semantic neighbors and asked for clarification, but the Tyler case found real
exact-name material and then made an unsupported claim that no further articles,
research, or SEP/CAP credits existed. The gateway added a host-observed
candidate-evidence reminder keyed only to broad operation IDs; upstream exact
match/provenance fields would make this constraint data-native instead of prose-
dependent.

The bounded post-fix probe
`eval/qa/results/2026-07-13T19-09-10-variantA.json` improved that Tyler answer to
a source-cited exact-name roster and removed the universal negative. It still
omitted an observation date for mutable role and directory-count claims, so the
gateway reminder now distinguishes source publication dates from the as-of date
needed for current facts. This remains a prose mitigation; structured upstream
match provenance is still the durable fix.
