# Discovery Eval

Phase 0 discovery-only instrument for the discovery redesign. It asks a narrower question than QA: if a naive agent makes exactly one live MCP `search` call with the user's question, did the returned catalog hits surface the right source family and at least one usable operation or skill?

The runner talks to the real MCP server over HTTP and does not import `src/` search or scoring code. That keeps the lane pointed at the live product surface rather than an offline reimplementation.

## Run

```sh
node eval/discovery/run-discovery.mjs --url http://localhost:8788
```

`--url` defaults to `http://localhost:8788` and may include or omit `/mcp`. For non-local targets, provide an auth token through one of `RAVEN_MCP_BEARER_TOKEN`, `MCP_BEARER_TOKEN`, `MCP_ADMIN_TOKEN`, or `RAVEN_ADMIN_TOKEN`; the runner sends it as a bearer token and never prints it.

Results are written to `eval/discovery/results/<ISO-stamp>.json` and are local evidence, matching the existing eval results convention.

## Seed Pools

- `extended-strict-misses`: the 12 current extended-lane strict top-5 misses derived from `eval/routing-cases.json`. They are the cases where strict labels still miss while broader acceptable families can be defensible.
- `issue-9-exemplars`: vague/status/current-recommendation questions from GitHub issue #9's exemplar class, authored against exact manifest ids.
- `lumenloop-agentic-misses`: the LumenLoop-labelled agentic boundary slice from `eval/agentic/sample.json` and the committed 2026-07-04 drift notes. The named row-level JSON is local-only and absent in this worktree, so those cases are marked provisional where needed.
- `round-844-real-user`: representative real-user alias/error/tooling questions from the round-844 lane context in `eval/README.md`, using committed routing-corpus questions as durable refs.

## Grading

For each case, the runner calls `search` once with the case question and `limit: 8`.

- `familyHit@3`: any rank 1-3 hit has `service` in `expectedFamilies`.
- `usableOp@5`: any rank 1-5 hit has `id` in `acceptableOps`.
- Raw rank 1-8 hits are recorded as `{ rank, id, service, kind, tier, score }` plus any additional score fields returned by the server that this runner knows to preserve.

The summary reports overall counts and per-seed-pool counts. The runner deliberately does not classify misses.

## Phase 0 Baseline

Baseline run against the Solo `dev-wt` server at `http://localhost:8788` on 2026-07-09:
`eval/discovery/results/2026-07-09T13-04-06-928Z.json` (local-only evidence).

| pool | n | familyHit@3 | usableOp@5 |
| --- | ---: | ---: | ---: |
| extended-strict-misses | 12 | 6/12 (50.0%) | 4/12 (33.3%) |
| issue-9-exemplars | 10 | 10/10 (100.0%) | 7/10 (70.0%) |
| lumenloop-agentic-misses | 8 | 6/8 (75.0%) | 5/8 (62.5%) |
| round-844-real-user | 10 | 10/10 (100.0%) | 9/10 (90.0%) |
| overall | 40 | 32/40 (80.0%) | 25/40 (62.5%) |

## Miss Classification

Classification happens during review, not in the runner:

- `retrieval`: one-search discovery failed to surface a needed family or usable op even though the exposed catalog contains one.
- `agent-behavior`: the needed family/op was visible, but an agent likely needs better search planning, follow-up search, or source-family guidance.
- `downstream`: discovery was sufficient; the later answer would fail because of execute usage, upstream data/content quality, missing fields, stale source data, or synthesis.
