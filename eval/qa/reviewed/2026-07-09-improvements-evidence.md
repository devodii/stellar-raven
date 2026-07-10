# Reviewed QA evidence used by improvements — 2026-07-09

This is the durable, redacted review record for QA rows cited by `sd-005`, `sd-008`, and
`sd-009`. Full result files remain intentionally gitignored. This record preserves scores and the
reviewed finding-relevant details without answers, transcripts, local paths, or costs.

Both rounds used `claude-sonnet-5` for answering and judging, judge rubric `v2.4`, and evidence-pack
contract `p3`. Every listed verdict was manually reviewed and upheld; no judge artifact was found.

## Post-Protocol-27 smoke

- Source stamp: `2026-07-09T19-25-25-variantA.json`
- Source SHA-256: `fc8313dabb2e3ed2c07815fbabde6698131be9d754d2b3475dbc5795b99eaf62`
- Window: `2026-07-09T19:09:39.001Z` through `2026-07-09T19:25:25.795Z`
- Aggregate: 8 rows — 0 correct, 3 partial, 5 wrong, 0 error

| Row | Verdict | Reviewed finding-relevant detail |
|---|---|---|
| `q-edge-fresh-latest-protocol-version` | wrong | Asserted current Protocol 27 from code/schedule evidence without the required live-network/staleness qualification. |
| `q-pc-protocol-upgrade-timing` | wrong | Presented stale Protocol 26 timing and missed the completed Protocol 27 activation. |
| `q-protocol-27-cap-0071` | partial | CAP-0071 mechanics were accurate; Mainnet activation status was omitted. |
| `q-protocol-current-mainnet-version` | wrong | Called Protocol 26 current after Protocol 27 activation. |
| `q-protocol-latest-stellar-core-release` | partial | Recovered Protocol 27 scope but not a concrete current `v27.x` release tag. |
| `q-protocol-version-history-list` | wrong | Omitted material history and called Protocol 26 latest. |
| `q-soroban-auth-delegation-p27` | wrong | Denied that Protocol 27/CAP-0071 adds the delegated/address-bound credential feature. |
| `q-soroban-current-sdk-cli-version` | partial | Recovered both stable `v27.0.0` versions but omitted the durable release-feed freshness caveat. |

## Sample-30 rows used by findings

- Source stamp: `2026-07-09T19-53-07-variantA.json`
- Source SHA-256: `1165f2e6f833fad094119875943e3d09c859d069ead7c4b260373d6a124377c0`
- Window: `2026-07-09T19:18:04.675Z` through `2026-07-09T19:53:07.129Z`
- Aggregate: 30 rows — 20 correct, 8 partial, 2 wrong, 0 error

### `q-defi-agentic-payment-standards-compare`

- Verdict: `partial`
- Missing facts (1): AP2 is Google's Agent Payments Protocol and ACP is a general agent-commerce
  protocol; both are general/coordination standards rather than Stellar-native settlement
  mechanisms. The candidate declined to assert this because the catalog had no grounding.
- Wrong claims: none.
- Reviewed disposition: the x402/MPP mechanics and Stellar-specific framing were correct. The
  explicit AP2/ACP punt was honest but left the requested comparison incomplete, so the partial
  verdict measures the upstream corpus gap recorded by `sd-005`.
- Evidence-pack SHA-256: `b1b10ced33bc4ff4f9c4a8c845d7b93ad258e88b887a19ae373cad84b06262f2`

### `q-sep-6-24-deprecation`

- Verdict: `wrong`
- Missing facts: none.
- Wrong claims (1): the candidate said no explicit SEP-6 interactive-component deprecation language
  exists, contradicting SEP-0006's status note that those components are deprecated in favor of
  SEP-24.
- Reviewed disposition: recommending SEP-24 for interactive flows did not cure the direct denial of
  the canonical deprecation fact. The verdict was upheld and supports the docs-parity gap recorded by
  `sd-009`.
