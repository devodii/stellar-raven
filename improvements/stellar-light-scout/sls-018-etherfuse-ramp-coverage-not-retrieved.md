---
id: sls-018
service: stellar-light-scout
status: reported-upstream
discovered: 2026-07-08
evidence:
  - local repo issue kalepail/stellar-raven#8 opened 2026-07-08 describes Etherfuse missing from generic Mexico on-ramp / MXN / anchor search despite Etherfuse FX coverage
  - live verification 2026-07-08: GET /api/projects/search?q=Etherfuse%20Stablebonds%20Mexico%20CETES returns Etherfuse with coverage countries ["Mexico"], currencies ["USD","MXN"], asOf "2026-07-07", and an etherfuse/ramp-api-example repo
  - live verification 2026-07-08: GET /api/projects/search?q=Mexico%20on-ramp%20fiat%20MXN%20peso%20deposit%20anchor returns 12 records and Etherfuse is absent
  - upstream issue filed 2026-07-08: https://github.com/Stellar-Light/stellar-scout/issues/7
probe:
  type: http-text
  url: https://stellarlight.xyz/api/projects/search?q=Mexico%20on-ramp%20fiat%20MXN%20peso%20deposit%20anchor
  expect:
    status: 200
    excludes:
      - etherfuse
---

## Finding

Structured coverage exists for Etherfuse, but generic Mexico on-ramp queries
do not retrieve it. A named Etherfuse query returns a high-confidence directory
record with `coverage.countries:["Mexico"]`, `coverage.currencies:["USD","MXN"]`,
and the `etherfuse/ramp-api-example` repository, while the broader query
`Mexico on-ramp fiat MXN peso deposit anchor` returns 12 other records and omits
Etherfuse entirely.

This is no longer the original `sls-012` structured-data absence. The data is
present; retrieval/ranking is not using the new coverage fields, ramp vocabulary,
or repository signal strongly enough for country/currency on-ramp intent.

## Evidence

Live 2026-07-08:

`GET /api/projects/search?q=Etherfuse%20Stablebonds%20Mexico%20CETES` returned
Etherfuse as the first result with:

- `category:"Protocol/Contract"`
- `types:["RWA"]`
- `coverage:{countries:["Mexico"], currencies:["USD","MXN"], seps:[], asOf:"2026-07-07"}`
- `repos[0].fullName:"etherfuse/ramp-api-example"`

The same service, same day:

`GET /api/projects/search?q=Mexico%20on-ramp%20fiat%20MXN%20peso%20deposit%20anchor`
returned 12 records. Etherfuse was not present.

## Recommendation

Use `coverage.countries`, `coverage.currencies`, and ramp/on-ramp repository
signals as searchable/ranking features for project search. For multi-product
companies, let secondary capabilities such as ramps supplement the dominant
category/type rather than being hidden behind the primary Protocol/Contract/RWA
classification. A generic Mexico/MXN on-ramp query should retrieve Etherfuse,
even if the result is clearly framed as an issuer/tokenizer/ramp API rather
than a conventional Anchor-category record.
