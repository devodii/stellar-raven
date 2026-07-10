import { describe, expect, it } from "vitest";
import {
  analyzeArchitectureRow,
  compareArchitectureResults,
  summarizeArchitecture
} from "../eval/qa/compare-architecture-ab.mjs";

const baseMeta = {
  model: "claude-sonnet-5",
  judgeModel: "claude-sonnet-5",
  judgeRubric: "v2.4",
  packVersion: "p3",
  casesPath: "eval/qa/sample.json",
  caseContract: null,
  sampleN: 1,
  toolSurface: { toolCount: 2, advertisedWireChars: 100 }
};

const plan = (requiredCovered) => ({
  summary: { cases: 1, requiredCoveredCount: requiredCovered ? 1 : 0 },
  rows: [{ id: "q1", requiredCovered, onPlanRatio: requiredCovered ? 1 : 0 }]
});

describe("architecture A/B metric collector", () => {
  it("counts direct operation calls, costs, truncation, and errors", () => {
    const row = {
      id: "q1",
      agent: { turns: 4, costUsd: 0.2, promptChars: 900, error: null },
      verdict: { score: "partial", costUsd: 0.05 },
      transcript: [
        {
          tool: "mcp__raven__scout_getRfps",
          result: '{"ok":false,"error":{"kind":"soft-empty"}}',
          isError: false
        },
        {
          tool: "mcp__raven__stellarDocs_search_docs",
          result: '{"ok":true,"data":{}}\n--- SOURCE BASIS ---',
          isError: false
        },
        { tool: "ToolSearch", resultChars: 40 }
      ]
    };
    const analyzed = analyzeArchitectureRow(row);
    expect(analyzed.operationToolCalls).toBe(2);
    expect(analyzed.ravenToolCalls).toBe(2);
    expect(analyzed.harnessToolCalls).toBe(1);
    expect(analyzed.truncatedToolResults).toBe(1);
    expect(analyzed.visibleEnvelopes["soft-empty"]).toBe(1);
    expect(analyzed.totalCostUsd).toBeCloseTo(0.25);
    const summary = summarizeArchitecture([row]);
    expect(summary.verdicts.partial).toBe(1);
    expect(summary.truncatedCases).toBe(1);
    expect(summary.capturedToolResultScope).toMatch(/not comparable/);
  });

  it("refuses mismatched cases and compares plan coverage", () => {
    const search = {
      meta: { ...baseMeta, surface: "search-execute" },
      rows: [{ id: "q1", agent: { turns: 3 }, verdict: { score: "correct" }, transcript: [] }]
    };
    const perOperation = {
      meta: {
        ...baseMeta,
        surface: "per-operation",
        toolSurface: { toolCount: 50, advertisedWireChars: 10000 }
      },
      rows: [{ id: "q1", agent: { turns: 4 }, verdict: { score: "partial" }, transcript: [] }]
    };
    const comparison = compareArchitectureResults({
      search,
      perOperation,
      searchPlan: plan(true),
      perOperationPlan: plan(false)
    });
    expect(comparison.verdictTransitions).toEqual({ "correct→partial": 1 });
    expect(comparison.searchExecute.plan.requiredCoveredCount).toBe(1);
    expect(comparison.perOperation.plan.requiredCoveredCount).toBe(0);
    expect(comparison.perOperation.toolSurface.toolCount).toBe(50);
    expect(comparison.meta.metricLimitations.capturedToolResultChars).toMatch(/absent/);

    perOperation.rows[0].id = "different";
    expect(() =>
      compareArchitectureResults({ search, perOperation, searchPlan: plan(true), perOperationPlan: plan(false) })
    ).toThrow(/case ids/);
  });
});
