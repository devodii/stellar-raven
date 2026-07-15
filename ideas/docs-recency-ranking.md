# Docs recency ranking — evidence-first experiment

Status: research note only. Do not add a global recency boost without a measured A/B win.

Recorded: 2026-07-15 from
[`kalepail/stellar-raven#24`](https://github.com/kalepail/stellar-raven/issues/24).

## Decision

Recency metadata is feasible to capture, but modification time is not reliable enough to become a
default ranking signal. Keep the current Algolia relevance order. Revisit only as a bounded
experiment, with exposing modification dates to agents preferred over automatic re-ranking.

The issue originally mixed two independent layers:

- Raven's top-level `search` ranks operation and skill cards, not documentation pages. Page
  recency does not belong in `src/catalog/scoring.ts`.
- `stellarDocs.*` results retain Algolia's ranking. Raven sorts by `weight.position` only when
  reconstructing the sections of one page through `get_doc_page_sections`.

## Evidence

- Current Algolia records contain no page date, `lastmod`, modified timestamp, or commit metadata.
  They expose content, hierarchy, tags, version, `recordVersion`, and relevance weights.
- Rendered docs pages expose `time[itemprop="dateModified"]`, and Algolia's `recordExtractor` can
  attach arbitrary record attributes. Capturing a numeric `lastModified` is straightforward.
- Modification time measures editing activity, not correctness or supersession. A formatting
  sweep, migration, translation, or link fix can make old guidance look fresh.
- A live query for `stellar container start testnet` ranked the stale Lab Quickstart page first.
  That page's modification date was newer than the correct Quickstart pages, so a recency boost
  would strengthen the wrong result
  (`improvements/stellar-docs/sd-031-cli-container-command-drift.md`).
- The conflicting Horizon retention pages share the same modification timestamp, so recency cannot
  distinguish them
  (`improvements/stellar-docs/sd-028-horizon-retention-default-wording-conflict.md`).
- Canonical-page defects and crawler propagation lag provide no newer indexed alternative to
  promote. Ranking cannot repair those classes.
- Historical and meeting-note queries can be harmed by an unconditional preference for recently
  edited pages.

Algolia applies custom ranking criteria as sequential tie-breakers. Appending
`desc(lastModified)` after the existing page-rank, level, and position criteria would be safe but
probably inert; placing it earlier would materially change the shared Docs search surface and
needs the repository's read-only A/B gate.

## Bounded experiment

Use the existing read-only `scripts/eval-algolia-raven.mjs` harness:

1. Add 10–20 verified stale/current page pairs plus historical-query negative controls.
2. Read `dateModified` from the rendered pages to simulate the signal without changing the shared
   crawler or index.
3. Compare baseline with:
   - a strict final recency tie-break;
   - recency used only for explicit current/latest intent;
   - modification dates exposed to the agent with ranking unchanged.
4. Review every movement. Docs retrieval and historical-query regressions are blockers.

If an arm wins, make the smallest production change: extract a numeric `lastModified`, expose it
on Raven hits, and change ranking only if the winning arm requires it. Do not fetch pages or GitHub
history during normal requests, and do not create another standing index solely for this signal.

## Trigger to revisit

Reopen only when either a reproducible stale/current pair set exists or eval failures show that a
newer indexed page repeatedly loses to a superseded one. General concern about stale documentation
is not enough: most known failures are source-content, coverage, or propagation defects rather than
recency-ranking defects.

## References

- https://www.algolia.com/doc/tools/crawler/extracting-data/overview
- https://www.algolia.com/doc/guides/managing-results/relevance-overview/in-depth/ranking-criteria
- [`research/services/stellar-docs-algolia.md`](../research/services/stellar-docs-algolia.md)
- [`scripts/eval-algolia-raven.mjs`](../scripts/eval-algolia-raven.mjs)
