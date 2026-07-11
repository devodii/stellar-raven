---
id: sls-045
service: stellar-light-scout
status: verified
discovered: 2026-07-10
evidence:
  - live getRfps/open probe returned five actual Q2 briefs plus a synthetic scf-round-45 row
  - response metadata reported open=5 while matched/returned contained six rows
  - official SCF RFP page independently listed the same five real briefs
  - Solo scratchpad 575 GT-39 primary process 3300 and blind process 3303
---

## Finding

The RFP discovery response prepends a synthetic current-round row to the
actual RFP records. The same response reports five open RFPs in metadata but
returns six matched rows, so consumers that count or render the result array
can misstate the number of current briefs and treat round metadata as an RFP.

## Recommendation

Return round context in a typed metadata field rather than as an RFP row. At
minimum, mark synthetic rows with an explicit discriminator and make
`matched`, `returned`, and `open` counts state whether metadata rows are
included. Add a contract test asserting that the five current briefs produce
five RFP records.
