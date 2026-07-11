---
id: sls-019
service: stellar-light-scout
status: verified
discovered: 2026-07-10
evidence:
  - live GET /api/research source=cap exact-identifier sweep on 2026-07-10
  - target ranks for CAP-0021/0035/0038/0058/0066/0071/0074 were 7/18/23/11/3/1/9 respectively
  - control query Asset Clawback ranked the CAP-0035 document first
  - Solo scratchpad 575 drift verdict and independent read-only review by process 3209
---

## Finding

Scout 1.7.11 adds `source=cap` to `GET /api/research`, but exact canonical CAP
identifiers are not reliable retrieval keys. In a seven-identifier live sweep,
five target CAP documents missed the top five; `CAP-0038` ranked 23rd and
`CAP-0035` ranked 18th. The content exists and can rank well by title—the
control query `Asset Clawback` put CAP-0035 first—so this is an
identifier-normalization/ranking gap rather than missing source data.

This is distinct from fixed finding `sls-009`, which concerned exact project
names in `searchProjects`. The new failure is in `searchResearch` over the CAP
source lane.

## Evidence

The following read-only probe was run against the live API on 2026-07-10:

```sh
for id in 0021 0035 0038 0058 0066 0071 0074; do
  curl -fsS --get https://stellarlight.xyz/api/research \
    --data-urlencode "q=CAP-$id" \
    --data-urlencode source=cap \
    --data-urlencode limit=25
done
```

The canonical target ranks were:

| identifier | target rank |
|---|---:|
| CAP-0021 | 7 |
| CAP-0035 | 18 |
| CAP-0038 | 23 |
| CAP-0058 | 11 |
| CAP-0066 | 3 |
| CAP-0071 | 1 |
| CAP-0074 | 9 |

Five of seven exact identifiers therefore missed top five. The title control
`q=Asset Clawback&source=cap` returned CAP-0035 at rank one, confirming that the
record is present and the failure is query handling/ranking. Repeated chunks
for one CAP can also crowd the result list ahead of the exact target.

## Recommendation

Normalize `CAP-N`, `CAP-NNNN`, and equivalent punctuation/case forms to the
canonical identifier, apply an exact identifier/title boost before vector
ranking, and deduplicate chunks per CAP before final result slicing. Add a
small exact-ID regression set spanning old and recent CAPs; canonical IDs
should retrieve their own document at rank one or, at minimum, inside top five.
