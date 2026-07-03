---
id: ll-008
service: lumenloop
status: verified
discovered: 2026-07-03
evidence:
  - live production execute 2026-07-03 (lumenloop.get_project on lobstr and moneygram; Solo scratchpad 521 follow-up, todo 826 comment 2224)
  - consumer-side workaround shipped: eval/qa/golden-overrides.json q-crp-anchors-by-corridor concrete trap on the footprint conflation; q-eco-lobstr-wallet graderNotes caution
---

## Finding

Directory records carry misleading region/coverage values, two live instances:

1. **lobstr**: `operating_region: ["Indonesia"]` while `based_in: "Estonia"` —
   implausible for a global consumer wallet; looks like a mis-mapped field.
2. **moneygram**: description states "over 200 countries and territories" —
   MoneyGram's *corporate money-transfer* footprint — with no distinction from
   the *Stellar USDC off-ramp* coverage (~170–174 countries per Scout and the
   MoneyGram developer docs) and no as-of date. Any consumer quoting the
   record inherits the conflation; the same corpus disagrees with itself
   (Scout "170+ cash-out countries", a third record says "185+").

Related but distinct from ll-003 (region *vocabulary* is free-text): these are
wrong/unqualified *values*, which a controlled vocabulary alone wouldn't fix.

## Evidence

Live 2026-07-03, production `execute`: `get_project({slug:"lobstr"})` and
`get_project({slug:"moneygram"})` returned the values quoted above; the Scout
counterpart figures were fetched in the same probe session for comparison.

## Recommendation

(1) Fix the lobstr `operating_region` mapping (spot-audit the field across
records — one implausible value in a two-record sample suggests more). (2) For
coverage claims in descriptions, distinguish corporate footprint from
Stellar-rail coverage and date the figure; the eval corpus shows the 200+
figure actively propagating into wrong answers about the Stellar off-ramp.
