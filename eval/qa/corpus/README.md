# QA corpus migration staging area

This directory is inert until the C5 compiler cutover. C3 adds the owned-corpus structure and
one-shot migration tooling; C4 adds its generated per-case and live-contract outputs. The legacy
compiler continues to read `eval/corpus/raven-next` plus `eval/qa/golden-overrides.json` meanwhile.

`migration-ledger.json` uses schema `qa-migration-ledger-v1`. Its `rows` contain `sourceId`,
`source`, `disposition` (`carry | merge | redefine | retire`), `destination`, and `reason`.
Destinations are required for `carry`, `merge`, and `redefine`; reasons are required for
`merge`, `redefine`, and `retire`. The migration seeds all 469 battery IDs as `carry`.
