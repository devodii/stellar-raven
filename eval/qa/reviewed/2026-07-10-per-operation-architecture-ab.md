# Per-operation architecture A/B — todo 903 closeout

Date: 2026-07-10 UTC
Decision: **NULL / NO SHIP** — retain the current search+execute architecture; do not rebaseline
or change production from this experiment.

## Question and arms

This round tested the pre-registered null hypothesis on the fixed QA-30 sample and the canonical
`live-data-canonical-v1` 10-case lane:

- **Search+execute:** the shipped `search` and `execute` tools.
- **Per-operation:** an isolated stdio MCP server exposing exactly the manifest's 50 service
  operations (18 Lumenloop, 20 Scout, 12 Stellar Docs) as ordinary tools. Each call was forwarded
  through the already-running local server's `execute`, preserving the shipped guard, adapter,
  normalization, redaction, truncation, and Dynamic Worker boundary.

The model contract was Claude Sonnet 5's **deferred MCP tools plus ToolSearch discovery** in both
arms. The tool definitions below are the advertised MCP wire surface, not proof that Claude
consumed every schema in context. Actual input/cache usage is reported separately.

This is specifically a 50-service-operation experiment. The direct arm did not expose manifest
skills or `codemode.artifact.read`; it is not an all-catalog plain-tool replacement. That omission
is material to the Soroban reentrancy row and to every direct-arm truncation footer.

## Reproducibility identity and order

- Repository base and existing Wrangler server revision: `7cf6213ccd4d95016b07620ffb439552367f4bba`
  (Solo dev process 2948, port 8787). No second Wrangler was started.
- Eval worktree was intentionally dirty because the new harness/runner instrumentation was the
  experiment. Run-time file SHA-256 values before closeout hardening:
  `run-qa.mjs` `43c76aaa441beb52e385ff7b92e77bbde88222b684798d4e339ae75313a9098e`;
  `plain-operation-harness.mjs` `4e0830be1f91ed5d65d323ba7c6998d75267a049f1b6ef19f9246bc49e92cb7e`;
  `evidence-pack.mjs` `7e2d30f246efb8ae5d48defbe9da88738b8f2166ead24886d829f60ac8f55a01`;
  `grade-plan.mjs` `7e88727249b95aada7374e273e8f78fdc0a6259953f1d2de1f2328a4dfc0f65a`.
- Manifest: generated `2026-07-09T23:33:45Z`; operation-id digest
  `f8ae176e2b2514dd11ae13c7938f25cd8f6afeebacaebe11b858fdad285a06a9`;
  operation-entry digest
  `c11383bffedebbbb728f61cf627efeb0766053c0f7b55aa37c6480dd82fec309`.
- QA selected-case digest:
  `c08e6feae05f1d4c88805f0ee9299766cf454992c9f1b0a8fb0409012fbdd5b7`;
  live selected-case digest:
  `efa0e4e1655ac7d09d446c49f480939aa4bbeeb3152081717ceaefe54645d790`.
- QA ran search+execute then per-operation. Live ran per-operation then search+execute. This
  cross-lane reversal is the available counterbalance; neither lane had a repeated within-lane
  counterbalanced replicate. The live lane is therefore exposed to time drift as well as normal
  single-run agent/judge variance.
- Local result stamps: QA `2026-07-10T03-35-14-variantA` and
  `2026-07-10T04-04-30-perOperation`; live `2026-07-10T04-15-05-perOperation` and
  `2026-07-10T04-25-18-variantA`. Results and plan/comparison sidecars remain gitignored.

The direct stamps' `meta.variant: "A"` is cosmetic parser residue; `meta.surface:
"per-operation"` and the filename suffix identify the arm. Future runs now record a null variant
for that arm plus runner/server revision, dirty-state digest, and runner/harness/manifest file
digests. Closeout also changed argument construction to `JSON.parse` so an own `__proto__` key
cannot acquire object-literal prototype semantics. No completed-run call contained that edge case,
so neither arm was modified or rerun asymmetrically.

## Pre-registered metrics

### QA-30

| metric | search+execute | per-operation |
|---|---:|---:|
| Original verdicts | 20 C / 9 P / 1 W / 0 E | 17 C / 11 P / 2 W / 0 E |
| Reviewed/calibrated verdicts | 20 C / 9 P / 1 W / 0 E | 17 C / 12 P / 1 W / 0 E |
| Mean turns | 8.27 | 9.70 |
| Total cost (agent + judge) | $20.0054 | $18.3735 |
| Raven calls | 189 (90 search + 99 execute) | 224 direct operations |
| ToolSearch calls | 29 | 37 |
| Truncation/loss markers | 32 in 23 cases | 54 in 19 cases |
| Framework/execution failures | 16, all recovered | 0 |
| Plan required covered | 30/30 | 28/30 |
| Mean on-plan ratio | 0.989 | 0.972 |
| Progression used | 6/11 | 2/11 |

The current arm's 16 failures were malformed or envelope-misread execute scripts (`.data`,
artifact-envelope, array-method, or guessed-operation mistakes); all agents recovered and there
were no agent or judge errors. Direct operation envelopes visibly contained 148 data responses,
12 ordinary service errors, and 10 soft-empty responses; those are service outcomes, not MCP
framework failures.

### Canonical live-10

| metric | search+execute | per-operation |
|---|---:|---:|
| Original verdicts | 7 C / 2 P / 1 W / 0 E | 10 C / 0 P / 0 W / 0 E |
| Reviewed/calibrated verdicts | 9 C / 1 P / 0 W / 0 E | 10 C / 0 P / 0 W / 0 E |
| Mean turns | 6.20 | 5.90 |
| Total cost (agent + judge) | $5.5519 | $5.1354 |
| Raven calls | 42 (22 search + 20 execute) | 38 direct operations |
| ToolSearch calls | 10 | 11 |
| Truncation/loss markers | 3 in 3 cases | 11 in 5 cases |
| Framework/execution failures | 0 | 0 |
| Plan required covered | 9/10 | 9/10 |
| Mean on-plan ratio | 0.852 | 0.796 |
| Progression used | 2/8 | 2/8 |

### Advertised wire surface and actual usage

| lane | arm | advertised tools | advertised wire chars | uncached input | cache creation | cache read | output |
|---|---|---:|---:|---:|---:|---:|---:|
| QA-30 | search+execute | 2 | 21,356 | 265,563 | 1,725,104 | 10,824,429 | 106,439 |
| QA-30 | per-operation | 50 | 79,817 | 324,549 | 1,628,326 | 8,533,525 | 87,827 |
| live-10 | search+execute | 2 | 21,356 | 88,299 | 452,514 | 2,501,209 | 24,274 |
| live-10 | per-operation | 50 | 79,817 | 97,657 | 411,742 | 1,842,693 | 24,228 |

The 79,817 versus 21,356 characters are a **3.74× advertised serialized wire surface**, not
consumed context and not evidence of always-preloaded schemas. Under Claude's deferred-tool regime,
the direct arm made more ToolSearch calls but used fewer cache-creation and cache-read tokens in
both lanes, while using more uncached input tokens. Those observed usage counters—not the wire
character estimate—are the valid context-consumption evidence.

`toolResultChars` is excluded from the decision. The runner retained execute and direct-operation
result bodies but did not retain search result bodies, so the previously computed 1.20M versus
2.25M QA totals are asymmetric capture, not comparable payload volume. Future comparison output
labels this limitation; usage/cache tokens above are the cross-arm measure.

Every direct-arm truncation/loss marker (54 QA and 11 live) included advice to use
`codemode.artifact.read`, which was unavailable in the 50-operation arm. This makes the advice
unactionable and compounds the direct arm's truncation cost. `--- SOURCE BASIS ---` is counted as a
loss/truncation marker because it represents the same capped-result boundary, although its footer
wording differs from `--- TRUNCATED ---`.

## Row review and rejudgment

Every partial, wrong, or cross-arm flip was read against the saved answer, transcript, golden, and
judge rationale. Stable-correct rows were also scanned for unsupported claims. The 16-row QA union
and three-row live union are recorded below; no failure was hidden by the calibrated headline.

| QA case | search | direct | disposition |
|---|---:|---:|---|
| `q-aas-list-token-on-exchanges-aggregators` | C | P | Direct omitted home-domain verification and venue policy; uphold P. |
| `q-defi-agentic-payment-standards-compare` | C | P | Direct omitted ACP; recurrence of `sd-005` plus the direct arm's skills omission; uphold P. |
| `q-defi-bridge-evm-to-stellar-axelar` | P | P | Both omit route verification, fees, and small-test safeguards; uphold. |
| `q-eco-stellar-rwa-stablecoin-volume` | P | P | Both omit requested SDF/Messari figures; heterogeneous known source gaps, no new mechanism. |
| `q-eco-wallets-overview` | P | P | Minor named-wallet/operator omissions; uphold. |
| `q-edge-1xlm-activation-fee` | C | P | Direct omitted block-explorer verification; borderline but supportable P. |
| `q-protocol-tier1-org-list` | P | C | Search omitted the no-canonical-live-roster caveat; direct was complete. |
| `q-scf-current-round` | P | P | Both omit cap/as-of details; uphold. |
| `q-scf-regional-india` | C | W | Identical rejudge stayed W, but the answer correctly found active multi-city activity and only missed Ambassador/chapter framing. Calibrate W→P, not C. |
| `q-sep-6-24-deprecation` | W | P | Both miss the canonical interactive-component deprecation status; live recurrence added to `sd-009`. |
| `q-sor-doc-timestamping-manage-data` | P | P | Both omit hash-comparison verification; uphold. |
| `q-sor-testing-negative-auth-events` | P | C | Search incorrectly denied `set_auths`; direct was complete. |
| `q-soroban-deploy-cli` | C | P | Direct used valid defaults but omitted the explicitly requested canonical flags; uphold P. |
| `q-soroban-reentrancy` | C | W | Direct guessed that re-entry is possible; search read the updated security skill explaining the host block. Genuine wrong, but specifically confounded by omitting skills from the direct arm; existing `sk-002` is fixed upstream. |
| `q-soroban-storage-types` | P | C | Search omitted the auto-restore footprint caveat; direct was complete. |
| `q-ti-rpc-gettransactions-pagination-xdr` | P | P | Both gave the generic default-100 claim/omissions; fresh live re-check reproduced `sd-003`. |

| live case | search | direct | disposition |
|---|---:|---:|---|
| `q-live-rfps-passkey-smart-account` | P | C | Transcript carried the SCF verification URL; identical rejudge flipped search to C. Calibrate P→C. |
| `q-live-oracle-repo-triage` | P | C | Search's figures were transcript-supported, but “unfixed” contradicted “addressed by client.” A rejudge overcorrected to W; retain P for the one minor wrong claim. |
| `q-live-ecosystem-crowded-underbuilt` | W | C | Transcript explicitly returned the `RWA` cluster and amount. Identical rejudge repeated an unsupported “almost certainly Asset” premise; calibrate W→C as an evidence-pack/judge artifact. |

The India rejudge cost $0.1122700 and the three live rejudgments cost $0.3117925, for $0.4240625
total. Fresh live verification then confirmed
the `sd-003` and `sd-009` recurrences. No new finding was filed: two existing Stellar Docs
findings gained evidence, while the reentrancy miss is a known fixed-upstream skills/surface
confound rather than a new service defect.

## Decision

The QA lane moves against the direct arm after review (20/9/1 versus 17/12/1), with more turns,
more tool calls, worse required/progression coverage, and more truncation markers, despite lower
cost and lower cache-token usage. The live lane favors direct by one reviewed verdict
(10/0/0 versus 9/1/0) with slightly fewer calls/turns/cost, but that is a single replicate in a
drifting lane and two of the original three apparent wins were judge artifacts.

This is not a measured win for either a production per-operation surface or a routing change. The
honest outcome is **null/no-ship**: keep search+execute, keep routing baselines unchanged, and retain
the isolated harness as a reproducible architecture instrument. A future direct-surface test would
need within-lane repeated counterbalancing and parity for skills plus artifact retrieval before it
could support an all-catalog architecture decision.
