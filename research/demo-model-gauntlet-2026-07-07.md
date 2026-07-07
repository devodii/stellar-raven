# Demo Model Gauntlet - 2026-07-07

## Decision

Use `openai/gpt-5.4` as the `/demo/chat` primary model and `openai/gpt-5.4-mini` as the fallback.

Keep `xai/grok-4.3` and `@cf/moonshotai/kimi-k2.7-code` as control models for future gauntlets, not as production defaults.

## Why

The demo needs to look competent under the exact production path: Cloudflare Worker, `/demo/chat` SSE, AI Gateway, `workers-ai-provider`, Vercel AI SDK tool calls, the live Stellar Raven `search` and `execute` tools, and the existing tool/step budget. Generic benchmark rankings were useful for candidate selection, but the final call came from end-to-end runs against this stack.

Combined broad plus finalist results:

| Model | Overall Pass | Clean Terminal | p50 ms | p95 ms | Tool Failures | Call |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `openai/gpt-5.4` | 21/24 | 23/24 | 8161 | 11340 | 4 | Primary |
| `openai/gpt-5.4-mini` | 19/24 | 20/24 | 5359 | 8081 | 7 | Fallback |
| `xai/grok-4.3` | 20/24 | 23/24 | 10514 | 13279 | 4 | Control |
| `@cf/moonshotai/kimi-k2.7-code` | 15/24 | 15/24 | 18654 | 34344 | 11 | Control |
| `openai/gpt-5.5` | 4/8 | 7/8 | 15266 | 26876 | 3 | Reject |
| `@cf/openai/gpt-oss-120b` | 2/8 | 7/8 | 3810 | 14276 | 2 | Reject |

`openai/gpt-5.4` had the best reliability/latency balance. `openai/gpt-5.4-mini` was faster and cheaper, but it had more tool-budget failures and weaker consistency, so it is better as fallback than stage default.

`xai/grok-4.3` was a strong control but slower than GPT-5.4 and repeatedly stumbled on the Soroswap builder prompt. `@cf/moonshotai/kimi-k2.7-code` was too slow and too likely to exhaust the tool/step budget for a live demo.

## Candidate Set

The gauntlet intentionally covered both Cloudflare Workers AI `@cf` models and AI Gateway Unified Billing provider models:

- OpenAI: `openai/gpt-5.4`, `openai/gpt-5.4-mini`, `openai/gpt-5.5`, `@cf/openai/gpt-oss-120b`
- Anthropic: `anthropic/claude-sonnet-4.6`, `anthropic/claude-haiku-4.5`, `anthropic/claude-fable-5`
- Google: `google/gemini-3.5-flash`
- xAI: `xai/grok-4.3`
- Moonshot/Kimi: `@cf/moonshotai/kimi-k2.7-code`

Research also checked Cloudflare's model catalog and provider docs before the gauntlet. A later repro found that Anthropic was not actually unavailable: Cloudflare's Anthropic endpoint accepts streaming and tools, but rejects the AI SDK Anthropic provider's `system: [{ type: "text", text }]` block-array shape. The demo now normalizes that to a plain string before `env.AI.run`.

Gemini remains blocked in the exact tool path for a different reason. Cloudflare's Gemini OpenAI-compatible endpoint successfully emits an initial tool call, but the follow-up request only succeeds if the assistant tool call preserves Google's `extra_content.google.thought_signature`. The current AI SDK/tool transcript drops that provider-specific field, so the follow-up returns Cloudflare `7003` / user-input error.

## Workload

The harness used eight representative end-to-end prompts:

- `rpc-simulate`
- `soroswap-builder`
- `open-rfps`
- `activity-leaderboard`
- `no-market-hallucination`
- `skill-routing`
- `zk-repos`
- `wallet-recovery`

Each run records status, time to first meaningful frame, total duration, final/error frames, search/execute calls, and whether the model used the expected tools. A pass requires a clean enough terminal result plus prompt-specific evidence that the answer did the intended work.

## Artifacts

The reusable runner is `scripts/run-demo-model-gauntlet.mjs`.

Raw traces and generated summaries:

- `research/gauntlets/2026-07-07-demo-model-gauntlet.json`
- `research/gauntlets/2026-07-07-demo-model-gauntlet-summary.md`
- `research/gauntlets/2026-07-07-demo-model-gauntlet-finalists.json`
- `research/gauntlets/2026-07-07-demo-model-gauntlet-finalists-summary.md`
- `research/gauntlets/2026-07-07-anthropic-gemini-reprobe-normalized.json`
- `research/gauntlets/2026-07-07-anthropic-gemini-reprobe-normalized-summary.md`
- `research/gauntlets/2026-07-07-gpt54-sonnet-headtohead.json`
- `research/gauntlets/2026-07-07-gpt54-sonnet-headtohead-summary.md`
- `research/gauntlets/2026-07-07-demo-model-gauntlet-smoke.json`
- `research/gauntlets/2026-07-07-demo-model-gauntlet-smoke-summary.md`
- `research/gauntlets/2026-07-07-demo-model-gauntlet-sonnet-smoke.json`
- `research/gauntlets/2026-07-07-demo-model-gauntlet-sonnet-smoke-summary.md`

Representative commands:

```sh
node scripts/run-demo-model-gauntlet.mjs --run-id 2026-07-07-demo-model-gauntlet
node scripts/run-demo-model-gauntlet.mjs --run-id 2026-07-07-demo-model-gauntlet-finalists --models openai/gpt-5.4,openai/gpt-5.4-mini,xai/grok-4.3,@cf/moonshotai/kimi-k2.7-code --repeats 2
node scripts/run-demo-model-gauntlet.mjs --run-id 2026-07-07-gpt54-sonnet-headtohead --models openai/gpt-5.4,anthropic/claude-sonnet-4.6 --repeats 2
```

## Anthropic/Gemini Reprobe

After pressing on the provider failures, the demo added a Cloudflare-specific Anthropic normalization wrapper and reran the same workload.

| Model | Overall Pass | Clean Terminal | p50 ms | p95 ms | Tool Failures | Call |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `openai/gpt-5.4` | 16/16 | 16/16 | 9276 | 19775 | 0 | Keep primary |
| `anthropic/claude-sonnet-4.6` | 14/16 | 14/16 | 20601 | 38362 | 2 | A/B candidate, not default |
| `anthropic/claude-haiku-4.5` | 5/8 | 5/8 | 7599 | 8456 | 4 | Reject as fallback |
| `google/gemini-3.5-flash` | 0/8 | 0/8 | 1652 | 1822 | 0 | Blocked by tool-result transcript |

Sonnet is now worth keeping in future A/B tests, especially for answer quality, but it should not replace GPT-5.4 for the live demo default. In the head-to-head repeat, GPT-5.4 was both more reliable and much faster. Sonnet's two failures were both `rpc-simulate` turns where it made a second execute call and hit the demo tool budget.

## Follow-Ups

- Keep Sonnet 4.6 in the A/B candidate pool after the Anthropic system-field normalization, but do not promote it without a larger pass-rate and latency win.
- Re-test Gemini only after preserving `extra_content.google.thought_signature` across AI SDK tool-result follow-ups, or after Cloudflare relaxes that requirement in the OpenAI-compatible Gemini path.
- Tighten the skill-routing tool guidance. The top models most often failed by asking for the wrong skill section shape or making an unnecessary second execute call.
- Re-run this gauntlet before any high-stakes demo or after upgrading `workers-ai-provider`, AI SDK, Cloudflare model catalog entries, or model defaults.

## Cost Probe

A follow-up cost pass on the same eight prompts parsed the Worker's `demo-chat` usage logs. Formula:

`((inputTokens - cacheReadTokens) * inputRate + cacheReadTokens * cachedInputRate + billableOutputTokens * outputRate) / 1_000_000`

For Unified Billing provider models, add Cloudflare's 5% credit purchase fee. For Grok, this table conservatively treats reported reasoning tokens as billable output.

| Model | Avg input | Avg cache read | Avg output | Avg reasoning | Est. cost / chat | Est. cost / 100 | Cold no-cache / chat |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `openai/gpt-5.4` | 12,247 | 8,864 | 658 | 0 | $0.0216 | $2.16 | $0.0425 |
| `xai/grok-4.3` | 13,004 | 10,192 | 214 | 391 | $0.0074 | $0.74 | $0.0187 |
| `@cf/moonshotai/kimi-k2.7-code` | 12,655 | 11,480 | 834 | 0 | $0.0066 | $0.66 | $0.0154 |

On cost alone, `openai/gpt-5.4` is about 3.3x Kimi and 2.9x Grok for this cached demo workload. The model decision still favors GPT-5.4 because the full gauntlet showed materially better live-demo reliability and latency than Kimi, and better reliability/latency balance than Grok.

For reference, `openai/gpt-5.4-mini` on the same GPT-5.4 token profile would be about $0.0065 per cached chat after the Unified Billing fee, which is roughly Kimi-priced; it remains a good fallback but had more tool-budget failures than GPT-5.4 in the gauntlet.
