import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("Algolia semantic matcher", () => {
  it("rejects substring mutations and accepts boundary-safe AP2/ACP terms", () => {
    const output = execFileSync(
      process.execPath,
      ["scripts/eval-algolia-raven.mjs", "--self-test"],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    expect(output).toContain("Algolia semantic matcher self-test ok (9 controls)");
  });
});
