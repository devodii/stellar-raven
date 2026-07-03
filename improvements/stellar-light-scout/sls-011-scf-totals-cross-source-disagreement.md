---
id: sls-011
service: stellar-light-scout
status: verified
discovered: 2026-07-03
evidence:
  - live production execute 2026-07-03 (scout.searchProjects + lumenloop.get_project on slug lobstr; Solo scratchpad 521 follow-up, todo 826 comment 2224)
  - consumer-side workaround shipped: eval/qa/golden-overrides.json q-eco-lobstr-wallet graderNotes instruct not penalizing either figure
---

## Finding

Scout and Lumenloop disagree on the same project's total SCF funding with no
documented counting basis on either side: for slug `lobstr`, Scout reports
`scfTotalAwardedUSD: 232000` while Lumenloop reports
`scf: { awarded_round: [2, 17, 22], awarded_total: 267463 }`. A consumer (or
an eval golden) cannot know whether one source is stale, they count different
award sets (e.g. excluding one round type), or one is simply wrong. Filed under
scout because Scout exposes a bare total with no round breakdown — Lumenloop at
least shows its work; the reconciliation itself needs both owners.

## Evidence

Live 2026-07-03, production `execute` in a single script: both records fetched
in the same instant, figures as above ($35,463 apart, ~15%). Neither record
carries an as-of date or a basis note for the figure.

## Recommendation

Cheapest first: (1) document each source's counting basis (which rounds/award
types are included) next to the figure; (2) expose the per-round breakdown in
Scout the way Lumenloop does, so consumers can reconcile mechanically; (3)
longer-term, agree a shared source of truth for SCF award data. Until then no
consumer can hard-gate an SCF dollar amount — this repo's eval golden had to
downgrade amounts to "source-reported, never penalize either figure".
