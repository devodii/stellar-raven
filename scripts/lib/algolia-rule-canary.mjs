export const PRIMARY_INDEX = "crawler_Stellar Docs - Docusaurus";
export const DOCS_FACET = [["docusaurus_tag:docs-default-current"]];

export const RULE_CANARY_CASES = [
  {
    id: "sd-006-cli-curl-command",
    assertionPrefix: "raven-promote-stellar-cli-install/curl-command",
    category: "CLI/install",
    finding: "sd-006",
    query: "curl -fsSL github stellar-cli",
    expectUrlIncludes: ["/docs/tools/cli/install-cli"],
    note: "Command-shaped install query should reach the canonical CLI install page.",
  },
  {
    id: "sd-006-cli-install-intent",
    assertionPrefix: "raven-promote-stellar-cli-install/natural-intent",
    category: "CLI/install",
    finding: "sd-006",
    query: "stellar cli install command",
    expectUrlIncludes: ["/docs/tools/cli/install-cli"],
    note: "Natural install intent should not lose to unrelated install-command snippets.",
  },
];

export function buildRuleCanaryParams(testCase, enableRules, hitsPerPage = 5) {
  return {
    analytics: false,
    clickAnalytics: false,
    query: testCase.query,
    hitsPerPage,
    facetFilters: DOCS_FACET,
    enableRules,
    attributesToRetrieve: ["url", "url_without_anchor"],
    attributesToHighlight: [],
    attributesToSnippet: [],
  };
}

export function targetRank(hits, expectedUrlParts) {
  const rank = hits.findIndex((hit) => {
    const url = hit.url_without_anchor || hit.url || "";
    return expectedUrlParts.some((part) => url.includes(part));
  });
  return rank === -1 ? null : rank + 1;
}

export function rankLabel(rank) {
  return rank === null ? "miss" : `#${rank}`;
}

/**
 * Evaluate the same two invariants for every behavioral rule canary:
 *   1. the intended target is rank 1 with rules enabled;
 *   2. rules materially improve the target over the rules-disabled control.
 *
 * Keeping the assertion engine generic makes new rule guards data additions,
 * not new query-specific branches.
 */
export function evaluateRuleCanary(testCase, rulesOnHits, rulesOffHits) {
  const rulesOnRank = targetRank(rulesOnHits, testCase.expectUrlIncludes);
  const rulesOffRank = targetRank(rulesOffHits, testCase.expectUrlIncludes);
  const prefix = testCase.assertionPrefix ?? testCase.id;
  const assertions = [
    {
      name: `${prefix}/rules-on-target-rank-1`,
      ok: rulesOnRank === 1,
      expected: "rules-on target rank #1",
      actual: `rules-on ${rankLabel(rulesOnRank)}`,
    },
    {
      name: `${prefix}/rules-on-off-material-delta`,
      ok: rulesOnRank !== null && (rulesOffRank === null || rulesOnRank < rulesOffRank),
      expected: "rules-on target rank better than rules-off control",
      actual: `rules-on ${rankLabel(rulesOnRank)}, rules-off ${rankLabel(rulesOffRank)}`,
    },
  ];
  return { id: testCase.id, rulesOnRank, rulesOffRank, assertions };
}
