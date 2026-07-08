---
id: sls-016
service: stellar-light-scout
status: reported-upstream
discovered: 2026-07-07
evidence:
  - eval/qa/results/2026-07-07T19-26-06-variantA.json (q-live-hackathon-recent-winners)
  - "live probe 2026-07-07: GET /api/hackathons/{stellar-agents-x402-stripe-mpp,stellar-hacks-zk-gaming} — itemized per-place amounts appear only in description markdown ('First Place:** $5,000 in XLM' …); structured winner entries carry an identical pool-level award label"
  - Solo todo 870 round record (scratchpad artifact-source-basi--545)
  - upstream issue filed 2026-07-07: https://github.com/Stellar-Light/stellar-scout/issues/5
  - live re-verified 2026-07-08: /api/hackathons/stellar-agents-x402-stripe-mpp still returns winners with award "10K Prize Pool" and no winner-level amount fields; no top-level prizeTiers field is present
recurrences:
  - date: 2026-07-08
    evidence: improvements probe plus live jq re-check; winners[0] has hackathonPlacement "1st Place", award "10K Prize Pool", placementRank 1, and no awardAmountUSD/awardAmount/awardAsset fields
probe:
  type: http-text
  url: https://stellarlight.xyz/api/hackathons/stellar-agents-x402-stripe-mpp
  expect:
    status: 200
    contains:
      - "First Place:** $5,000 in XLM"
      - "10K Prize Pool"
    excludes:
      - awardAmountUSD
---
## Finding

Per-winner award amounts are not structured. Winner entries on completed
hackathons carry `hackathonPlacement`/`placementRank` (fixed in sls-001) plus an
`award` field, but that field holds the same pool-level label for every winner
(e.g. "10K Prize Pool"). The actual per-place split ($5,000 / $2,000 / $1,250 /
$1,000 / $750 in XLM) exists only inside the hackathon `description` markdown
prose. `prizePoolUSD` is total-only.

## Evidence

Both completed hackathons probed on 2026-07-07 show the pattern: the itemized
split is present verbatim in `description` ("First Place:** $5,000 in XLM"),
while no winner-level or track-level structured field carries per-place
amounts. Consumer-side symptom, reproducible: in QA run
2026-07-07T19-26-06-variantA.json the answering agent correctly extracted the
split from the prose, and an evidence-bounded judge — seeing only the
structured award fields — graded the amounts as fabricated. Any consumer that
trusts structured fields over prose will either miss the split or mistrust a
correct one.

## Recommendation

Add a structured per-place amount to winner entries — e.g.
`awardAmountUSD`/`awardAmount` + `awardAsset` alongside the existing
`hackathonPlacement`/`placementRank` — or a `prizeTiers` array on the
hackathon (rank → amount → asset), keeping the prose as display copy.
Cheapest fix: `prizeTiers` at the hackathon level, since the ranked winner
join already exists via `placementRank`. Until then the description prose is
the only source of truth for amounts; this repo's judge evidence packs are
being extended to include prose regions matched to answer claims (Solo todo
filed this round) as the consumer-side workaround.

Live re-check 2026-07-08: `/api/hackathons/stellar-agents-x402-stripe-mpp`
still returns ranked winners with `award:"10K Prize Pool"` and no
`awardAmountUSD`, `awardAmount`, or `awardAsset` fields on the winner rows.
