import { describe, expect, it } from "vitest";
import { applyGraderNotesOverride } from "../eval/qa/grader-notes.mjs";

describe("grader-note override replacements", () => {
  it("emits one effective note while preserving inherited/effective history", () => {
    const result = applyGraderNotesOverride(
      "keep\nstale claim\nkeep two",
      {
        graderNotesReplacements: [{ inherited: "stale claim", effective: "dated correction" }],
        graderNotesAppend: "audit append"
      },
      "case-a"
    );
    expect(result.effective).toBe("keep\ndated correction\nkeep two\naudit append");
    expect(result.history).toEqual([
      { action: "replace-inherited", inherited: "stale claim", effective: "dated correction" }
    ]);
  });

  it("fails loudly when an inherited span is absent or ambiguous", () => {
    expect(() =>
      applyGraderNotesOverride(
        "current note",
        { graderNotesReplacements: [{ inherited: "missing", effective: "correction" }] },
        "absent"
      )
    ).toThrow("expected exactly one inherited span, found 0");
    expect(() =>
      applyGraderNotesOverride(
        "same same",
        { graderNotesReplacements: [{ inherited: "same", effective: "correction" }] },
        "duplicate"
      )
    ).toThrow("expected exactly one inherited span, found 2");
  });

  it("matches every replacement against the original inherited notes", () => {
    const result = applyGraderNotesOverride(
      "alpha\nbeta",
      {
        graderNotesReplacements: [
          { inherited: "alpha", effective: "beta from correction" },
          { inherited: "beta", effective: "fixed beta" }
        ]
      },
      "simultaneous"
    );
    expect(result.effective).toBe("beta from correction\nfixed beta");
  });

  it("rejects overlapping inherited spans", () => {
    expect(() =>
      applyGraderNotesOverride(
        "one stale claim",
        {
          graderNotesReplacements: [
            { inherited: "stale claim", effective: "correction" },
            { inherited: "claim", effective: "other correction" }
          ]
        },
        "overlap"
      )
    ).toThrow("overlaps another inherited span");
  });

  it("preserves append-only behavior when no replacement is declared", () => {
    expect(
      applyGraderNotesOverride("original", { graderNotesAppend: "later" }, "append-only")
    ).toEqual({ effective: "original\nlater", history: [] });
  });
});
