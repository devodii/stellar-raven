---
id: sls-008
service: stellar-light-scout
status: verified
discovered: 2026-07-03
evidence:
  - live production execute 2026-07-03 (scout.searchProjects name probes; Solo scratchpad 521 follow-up, todo 826 comment 2224)
  - consumer-side workaround shipped: eval/qa/golden-overrides.json q-defi-lending-scf-flagships avoid item names both records explicitly
---

## Finding

The project directory carries two live, Lending-typed records that appear to be
the same lineage with no cross-link or dedupe signal: `orbit-finance` (status
Live, scfAwarded false, scfTotalAwardedUSD null, no lastActivityAt) and
`orbitcdp` (status Live, scfAwarded true, scfTotalAwardedUSD 280000). Consumers
asking "is Orbit SCF-funded?" get opposite answers depending on which record a
name query surfaces. Related inconsistency: the same `orbit-finance` record
returned `types: ["Lending"]` under `q="Orbit Finance"` but `types: []` under
`q="OrbitCDP"` in the same instant — per-query field surfacing or data
inconsistency.

## Evidence

Live 2026-07-03, production `execute` with six parallel
`scout.searchProjects` calls: `q="Orbit Finance"` → orbit-finance
(scfAwarded:false, amount null); `q="OrbitCDP"` → orbitcdp (scfAwarded:true,
$280,000, types [Lending]). Both records status Live, both surfaced in the
SCF-funded lending landscape query. The eval golden for
`q-defi-lending-scf-flagships` had already noted the naming fuzziness on its
2026-06-29 review; the live probe confirms both records still coexist and
diverge on funding.

## Recommendation

Either merge the records, mark the stale one Inactive, or add an explicit
cross-reference field (e.g. `relatedSlugs` / `renamedTo`) so consumers can
detect the lineage. Failing that, a dedupe hint in search results (same-team
records grouped) would prevent the opposite-answer failure mode. Consumer-side,
this gateway can only hardcode the pair in eval goldens (done — override entry
above), which rots the moment either record changes.
