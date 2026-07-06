---
id: sls-003
service: stellar-light-scout
status: verified
discovered: 2026-07-03
evidence:
  - eval/qa/results/2026-07-03T03-49-35-variantA.json
  - eval/qa/results/2026-07-03T04-13-42-variantA.json
  - live re-execution resolved all five cited audit reports exactly
  - Solo project 49, todo 822, comments 2204-2210
  - live re-verified 2026-07-06 (eval round todo 846): OtterSec/Axelar citation still resolves exactly (stellarsecurityportal.com/report/45, auditor OtterSec, protocol Axelar Network) — the trust anchor holds
---

## Finding

Positive finding, recorded as a trust anchor: the audit corpus is excellent. All
five audit-report citations an eval agent made resolved exactly on live
re-execution:

- OtterSec report/45 — Axelar
- Coinspect report/31 — Tricorn (with HIGH findings)
- Veridise report/49 — Hot Bridge
- Certora report/77 — Spectra
- Quarkslab report/4 — Allbridge

## Evidence

2026-07-03 eval round results files above; every citation re-executed live
against the local server and resolved to the exact report.

## Recommendation

No action. Recorded so future rounds can treat the audit corpus as a reliable
citation target and notice if that ever regresses.
