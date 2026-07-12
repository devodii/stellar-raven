# 2026-07-12 answering-model A/B — Opus, Fable, and Sonnet control

This round tested whether the 14 partials from the
`2026-07-11T21-44-47-variantA.json` comparison anchor (12C / 14P / 4W) were bounded by
answering-model capability. It used a predeclared 2-replicate × 3-arm design: requested aliases
`opus`, `fable`, and the `claude-sonnet-5` control, with three ordered 10-case shards per
logical run over the same 30-case sample.

**Verdict: inconclusive.** Neither non-control arm produced a strict adjudicated recovery, versus
the predeclared model-bound threshold of at least three recovered anchor cases for one arm.
The evidence also does not meet the stricter server-bound proof rule. This round supports **no
default-model change, no per-question tuning, and no new upstream finding**.

## Measurement contract and run guards

- Variant A; sample 30; judge `claude-sonnet-5`; rubric `v2.4`; evidence pack `p3`.
- Server revision argument: `d35003050024d43abe72d0820eacb8d37a0bf92a`.
- The `opus` and `fable` availability probes resolved to `claude-opus-4-8` and
  `claude-fable-5`, respectively. Result metadata correctly retains the requested aliases rather
  than claiming those resolved identities as `meta.model`.
- MCP surface SHA-256
  `50e0f782ca2b743d9d73467e285d83ae2294bab7bd00c82f65da9846ab925ef5` matched the
  first boundary at every later shard boundary. The scoped
  `git status --porcelain src/ wrangler.jsonc package.json` also remained unchanged: three
  modified source files plus untracked `src/observability-request.ts`. The mandatory
  mid-schedule halt rule never fired.
- The deterministic combiner passed 18 distinct source paths and stamps, six complete logical
  runs, and 180 rows. Each run contains the same 30 sample IDs exactly once, in its three declared
  ordered shards. Cross-run tuple uniformity passed after excluding only the answering-model
  field. Two independent combined outputs were byte-identical, SHA-256
  `683ae8804e003390931d32199bedcdb136019b2d973e780de245568dab47cd63`.
- All 18 plan artifacts were present and source-aligned: 179/180 required-covered, with one
  truncated diagnostic. The incomplete-replicate invalidation rule did not fire.

The six logical runs were launched in the predeclared interleaved order, not grouped by arm, to
limit temporal confounding across the live server interval.

## Raw Sonnet-judge results

These are the original `claude-sonnet-5` judge scores. They are kept separate from identical-input
re-judges and the later blind adjudication.

| Logical run | Source stamps by s1 / s2 / s3 | Raw C / P / W | Reported cost |
|---|---|---:|---:|
| opus-1 | `2026-07-12T01-40-27` / `04-30-42` / `05-58-41` | 15 / 14 / 1 | $26.6405445 |
| opus-2 | `2026-07-12T03-44-01` / `04-48-26` / `07-06-57` | 13 / 13 / 4 | $24.04637205 |
| fable-1 | `2026-07-12T02-05-54` / `04-03-37` / `06-23-14` | 12 / 15 / 3 | $46.9104234 |
| fable-2 | `2026-07-12T03-20-42` / `05-19-58` / `06-46-13` | 16 / 11 / 3 | $46.49289115 |
| control-1 | `2026-07-12T02-30-05` / `04-15-54` / `05-39-01` | 11 / 16 / 3 | $21.4518069 |
| control-2 | `2026-07-12T02-52-16` / `05-00-19` / `07-24-37` | 14 / 12 / 4 | $20.8940373 |

All stamps above name `-variantA.json` result files. The QA subtotal is **$186.4360753**.
The raw strict rates vary materially across replicates within the same arm: Opus is 50.0% versus
43.3%, Fable 40.0% versus 53.3%, and control 36.7% versus 46.7%. Those spreads are a warning
against reading the best single run as a model effect.

## Re-judge variance

Nine `re-judge.mjs --flips-vs` comparisons re-judged each replicate-2 row that disagreed with the
same arm's replicate-1 shard baseline. The baseline was always replicate 1 of the same model and
same shard; no cross-model baseline was used.

Across 34 identical-input judge calls, 21 scores were stable and 13 changed. Transitions were
11 C→C, 5 P→P, 5 W→W, 5 P→C, 4 C→P, 3 W→P, and 1 P→W. Reported re-judge cost was
**$6.5839187**. These calls measure judge instability on the selected discordant rows; they do not
convert the raw run tables into a new aggregate score and are not a significance test.

## Blind adjudication

The primary Grok-4.5 adjudicator received 144 randomized opaque packets spanning 24 cases and all
six runs for each selected case. Packets contained the question, golden/key facts, candidate answer,
and transcript evidence. They did not contain arm, answering-model, logical-run, source-stamp,
original-score, cost, schedule, or aggregate labels. The adjudicator returned structured
per-key-fact and wrong-claim findings for all 144 unique packet IDs.

The escalation predicate selected 73 opaque packets: every primary uncertainty row, every
conclusion-driving anchor disagreement, and every correct-with-contradiction structural
inconsistency. An independent gpt-5.6-terra adjudicator reviewed those packets under the same
label-stripped protocol.

The deterministic join found:

- **40** Grok/Terra score agreements;
- **33** score disagreements, retained explicitly with `adjudicatedScore: null`;
- no silent winner and no use of unresolved rows to establish a recovery or regression.

Thus the adjudicated findings below are not replacements for the raw Sonnet tables. They are the
stricter, blinded disposition used only for the predeclared recovery/regression and tri-state rules.

## Recovery and regression accounting

A case counted as a model recovery only when it was one of the 14 anchor partials, both replicates
of the same non-control arm adjudicated **correct**, and both control replicates remained
**partial or wrong**. The predeclared model-bound verdict required **at least three** such cases
for one arm, with no blind-upheld replicated new-wrong regression.

| Accounting | Opus | Fable |
|---|---:|---:|
| Strict adjudicated anchor recoveries | 0 | 0 |
| Threshold required for model-bound | ≥3 | ≥3 |
| Raw replicated wrong-regression candidates | 0 | 1 |
| Blind-upheld replicated wrong regressions | 0 | 0 |

The one raw Fable regression candidate was
`q-defi-streaming-payments-prior-art`: both Fable runs were raw W while both controls were P.
Blind adjudication scored both Fable answers partial, so the candidate was not upheld as a
replicated wrong regression.

Neither arm approaches the model-bound threshold. A server-bound verdict is also unavailable:
there is no per-case proof that required evidence was unavailable or unusable for every anchor,
25 anchor rows remain unresolved after the two adjudicators, and multiple saved transcripts show
relevant evidence followed by synthesis or completeness omissions. The only valid tri-state
result is therefore **inconclusive**.

## Cost ledger

| Metered component | Reported cost |
|---|---:|
| 18 QA shards | $186.4360753 |
| Opus/Fable availability probes | $0.536326 |
| 34 re-judge calls | $6.5839187 |
| **Reported-cost total** | **$193.55632** |

The Grok, Terra, and Sol Solo review processes exposed no USD meter. They are recorded as
unmetered review calls rather than silently treated as zero-cost. Therefore **$193.55632 is the
reported-cost ledger, not an all-in measured spend**.

## Caveats and interpretation

- **Composite live interval:** concurrent source work existed in the shared checkout and Wrangler
  could hot-reload. The boundary surface hash and scoped status stayed fixed, and every stored run
  carried the same runner/source identity tuple, but this remains an observational answering-model
  comparison over a composite live interval. It does not establish a causal effect for any repo
  commit.
- **Answering and judging variance:** only two answering replicates were run per arm, the raw
  replicate spreads are large, 13/34 selected identical-input re-judges changed score, and 33/73
  escalated blind packets remained unresolved. The committed 23.3% per-row any-flip noise floor is
  a caution, not a significance threshold. No statistical ranking of Opus, Fable, and Sonnet is
  claimed.
- **Designed sample:** the 30 cases are the frozen QA sample, not a random full-corpus estimate.
  The recovery claim is intentionally narrower still: the 14 predeclared anchor partials.
- **Raw versus adjudicated:** raw Sonnet scores remain the run record. Blind findings govern only
  the declared recovery/regression decision; unresolved adjudicator disagreements remain null.

## Verification and closeout

An independent gpt-5.6-sol verifier (Solo process 3476) reproduced the combined artifact,
adjudication join, and escalation selection; checked source and plan completeness, tuple/surface/
status uniformity, costs, re-judge pairings, packet blinding and coverage, recovery/regression
counts, and tri-state application. Its final verdict was **APPROVE**, with no open findings after
the raw-regression wording was corrected.

Validation passed: `npm run typecheck`; `npm test` (43 files, 532 tests);
`npm run build`; `eval:selftest`; `eval:compile`; `eval:qa:compile`;
`eval:qa:lint -- --stale` (0 errors, 109 warnings); `eval:qa:selftest`; and
`secrets:scan -- --tree`.

Nothing new was established upstream. The round rechecked the known answering/synthesis boundary
but found no replicated, adjudication-upheld service gap, so no `improvements/` item is filed.
The operational closes are explicit: **no default-model change, no per-question tuning, and no new
upstream finding**.

Coordination record: `solo://proj/49/todo/963`; approved brief, execution ledger, adjudication,
verifier reconciliation, and final record draft: Solo scratchpad 603.
