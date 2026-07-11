---
id: sls-026
service: stellar-light-scout
status: verified
discovered: 2026-07-10
evidence:
  - live Scout Aquarius project response reports scfTotalAwardedUSD 391000 and rounds 17,23,27,30
  - current official Aquarius SCF payload reports three Awarded rows totaling/paid 291000, a 100000 Pending liquidity row, and round 30 as Ineligible
  - live Lumenloop Aquarius aggregate reports 291000 and awarded rounds 17,23,27
  - Solo scratchpad 575 GT-13 primary process 3238 and independent blind process 3240
  - GT-17 recurrence: semantic RWA rows with award_type Build included Test Transaction, Ready for Payment, and Information Collection statuses
  - GT-38 recurrence: primary process 3297 and blind process 3299 reproduced Scout Aquarius $391K with rounds 17/23/27/30 against official $291K paid, $100K Pending, and $70K Ineligible row semantics
  - GT-37 recurrence: SocketFi and JS kit awarded-round lists include non-awarded submissions; Chainlink Relayer, WageLink, and Stellar Oracle Shield have official awards despite Scout false negatives
recurrences:
  - date: 2026-07-10
    evidence: GT-38 independently reproduced the Aquarius aggregate/row-status conflict and confirmed that round 30 must never be described as Awarded
  - date: 2026-07-10
    evidence: GT-37 independently reproduced awarded-round membership inflation, funded-status false negatives, and awarded-versus-paid loss across oracle, passkey, and payroll fixtures
  - date: 2026-07-10
    evidence: GT-40 showed the same status/basis problem at aggregate scale, where round-ledger and project-record awarded/paid totals differ by more than $12M
---

## Finding

Scout's Aquarius SCF summary collapses incompatible award statuses into one
total and round list. On 2026-07-10 Scout reported `$391,000` and rounds 17,
23, 27, and 30. The current official SCF project payload instead showed:

- round 17, $147,000, Awarded;
- round 23, $94,000, Awarded;
- round 27, $50,000, Awarded;
- Liquidity Award '24 Q1, $100,000, Pending; and
- round 30, $70,000, Ineligible.

The three awarded rows and official `totalPaid` equal $291,000. The same
official page displays `totalAwarded=391000`, apparently including the Pending
liquidity row, while Scout's round list includes the Ineligible round 30 and
does not identify the pending row. A consumer cannot reconstruct the source
truth from the Scout summary.

## Evidence

Two independent golden-truth lanes fetched the official SCF project payload,
Scout, and Lumenloop on 2026-07-10. Lumenloop returned $291,000 and awarded
rounds 17/23/27, matching the awarded-row sum. Scout returned $391,000 and
17/23/27/30. The official page itself contains an aggregate/row-status
contradiction, so upstream normalization must preserve both rather than select
one silently.

This is a successor to the fixed generic count-basis work in `sls-011`.
Exposing that a total is reconstructed is not enough when pending and
ineligible rows are assigned to the wrong award membership.

GT-17 found the same class beyond Aquarius. Official RWA/tokenization
submission pages included rows whose `award_type` was Build and whose proposed
amount was populated, while current status was Test Transaction, Ready for
Payment, or Information Collection. Semantic discovery cannot normalize those
rows to Awarded without carrying the official status.

## Recommendation

Return per-submission status and separate aggregates:

- awarded, paid, pending, and ineligible amounts;
- awarded round IDs versus all related round IDs;
- source-display total and independently derived awarded-row sum;
- an explicit conflict flag when source aggregate and row statuses disagree;
- source URL and as-of timestamp.

Add an Aquarius regression fixture. It must not describe round 30 as awarded
or $391,000 as paid, and it must expose the pending $100,000 liquidity row and
the official aggregate conflict.

Add cross-status RWA fixtures for Talwex, Lend tokenized real estate, and TERWA
Wine Asset Vault. A populated amount or Build award type must not imply Awarded.
