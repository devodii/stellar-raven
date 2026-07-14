import { describe, expect, it } from "vitest";
import {
  candidateEvidenceBlock,
  evidenceCheckpointBlock
} from "../src/policy/evidence-checkpoint";

describe("evidence checkpoint prose", () => {
  it("keeps candidate guidance conditional and attribution-focused", () => {
    expect(candidateEvidenceBlock(undefined)).toBe("");
    expect(candidateEvidenceBlock(2, true)).toBe("");

    const block = candidateEvidenceBlock(2);
    expect(block).toContain("--- CANDIDATE EVIDENCE ---");
    expect(block).toContain("2 semantic, research, A/V, or fallback-directory call(s)");
    expect(block).toContain("rows are candidates, not identity or absence proof");
    expect(block).toContain("discard adjacent matches");
  });

  it("names only catalog-derived recovery candidates", () => {
    const block = evidenceCheckpointBlock({
      sourceOperations: ["scout.getBuilders"],
      candidates: [
        {
          id: "lumenloop.search_content_semantic",
          relation: "broader-semantic",
          reasons: ["empty", "weak"]
        }
      ]
    });
    expect(block).toContain("scout.getBuilders");
    expect(block).toContain("lumenloop.search_content_semantic (broader-semantic; empty/weak)");
    expect(block).toContain("If it exactly answers the request");
  });
});
