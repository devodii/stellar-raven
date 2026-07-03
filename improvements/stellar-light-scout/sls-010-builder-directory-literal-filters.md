---
id: sls-010
service: stellar-light-scout
status: verified
discovered: 2026-07-03
evidence:
  - live production execute 2026-07-03 (scout.getBuilders 16-probe fan-out; Solo scratchpad 521 follow-up, todo 826 comment 2224)
  - consumer-side workaround shipped: eval/qa/golden-overrides.json q-builder-by-region-latam graderNotes instruct per-country fan-out
---

## Finding

Builder-directory filtering is literal substring over free-text fields, which
breaks the two query shapes region questions actually take:

1. **No region-synonym expansion**: `location="Latin America"` (and "LatAm")
   returns 0 matches even though 18 LatAm profiles exist (Brazil 10, Chile 5,
   Costa Rica 2, Colombia 1 of 112 total) — the location values are free-text
   country/city strings, so region-level terms never match. `searchProjects`
   already does category-synonym expansion; builders has no equivalent.
2. **`q` is strict-literal against bio text**: `location=Brazil&q=payments`
   returns only 1 of the 10 Brazil profiles although others are
   payments-relevant (e.g. a profile building "Boleto Guardian, a
   blockchain-based [payments] infra" does not contain the literal token
   "payments").

Coverage note for the directory owners: Argentina, Mexico, Peru, and Venezuela
have zero profiles despite active Stellar communities — likely a
Passport-sync/coverage gap rather than an API defect.

## Evidence

Live 2026-07-03, production `execute` fan-out: per-country `getBuilders` for 8
LatAm countries plus 7 location×skill combos plus the unfiltered total (112).
Zero-match responses correctly return the structured filter-miss advisory
(112-profile directory restated, Discord/GitHub fallbacks) — the miss
signalling is good; the matching is what's literal.

## Recommendation

Cheapest first: (1) region-synonym expansion in the location filter (region →
country list), mirroring the category synonyms searchProjects already has;
(2) semantic or synonym fallback for the builder `q` filter, matching
project-search behavior. Until then every regional consumer must know to fan
out by country name — undiscoverable from the API surface alone.
