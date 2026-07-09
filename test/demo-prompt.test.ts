/**
 * ADR-0003 emitted-text discipline for the demo SYSTEM PROMPT (design review
 * finding 7): the combined SERVER_INSTRUCTIONS + playground preamble is
 * emitted text and must never reference a non-exposed op or retired skill.
 * src/demo/prompt.ts is a pure module precisely so this test can import it
 * without the worker-only chat/tools graph.
 */
import { describe, expect, it } from "vitest";
import { assertNoNonExposedRefsInText } from "../scripts/emitted-text-guard.mjs";
import { BASE_SERVER_INSTRUCTIONS, SERVER_INSTRUCTIONS } from "../src/mcp/tools";
import { MICRO_MAP } from "../src/mcp/micro-map";
import { DEMO_CAPS } from "../src/demo/budget";
import { DEMO_PREAMBLE, DEMO_SYSTEM_PROMPT } from "../src/demo/prompt";

describe("demo system prompt", () => {
  it("contains the base production instructions plus the preamble, excluding the generated micro-map", () => {
    expect(SERVER_INSTRUCTIONS).toContain(MICRO_MAP);
    expect(DEMO_SYSTEM_PROMPT.startsWith(BASE_SERVER_INSTRUCTIONS)).toBe(true);
    expect(DEMO_SYSTEM_PROMPT).not.toContain(MICRO_MAP);
    expect(DEMO_SYSTEM_PROMPT.endsWith(DEMO_PREAMBLE)).toBe(true);
    // The demo's turn budget is stated to the model (numbers enforced in
    // src/demo/budget.ts; drift here is a lie to the model, not a crash).
    expect(DEMO_PREAMBLE).toContain(`${DEMO_CAPS.maxSteps} steps`);
    expect(DEMO_PREAMBLE).toContain(`${DEMO_CAPS.maxSearchCallsPerTurn} \`search\` calls`);
    expect(DEMO_PREAMBLE).toContain(`${DEMO_CAPS.maxExecuteCallsPerTurn} \`execute\` calls`);
    expect(DEMO_PREAMBLE).toContain("one targeted `search` for the primary source family");
    expect(DEMO_PREAMBLE).toContain("optional second `search`");
    expect(DEMO_PREAMBLE).toContain("truncated, mismatched, need corroboration, or need varied vocabulary");
    expect(DEMO_PREAMBLE).toContain("optional second `execute`");
    expect(DEMO_PREAMBLE).toContain("do not call `codemode.search`, `codemode.catalog`, or `codemode.spec`");
    expect(DEMO_PREAMBLE).toContain('`codemode.describe("<exact id>")` is allowed');
    expect(DEMO_PREAMBLE).toContain("Do not infer per-item detail functions");
    expect(DEMO_PREAMBLE).toContain("`Promise.all` accepts an ARRAY only");
    expect(DEMO_PREAMBLE).toContain("never `Promise.all({ ... })`");
    expect(DEMO_PREAMBLE).toContain("named result objects");
    expect(DEMO_PREAMBLE).toContain("Avoid lossy projection false negatives");
    expect(DEMO_PREAMBLE).toContain("filter against raw row JSON");
    expect(DEMO_PREAMBLE).toContain("nested/common variants");
    expect(DEMO_PREAMBLE).toContain("Return compact selected fields only from `execute`");
    expect(DEMO_PREAMBLE).toContain("broad directory, regional, or aggregate questions");
    expect(DEMO_PREAMBLE).toContain("targeted per-country/per-entity fanout");
    expect(DEMO_PREAMBLE).toContain("counts, top 5-8 named rows, and source/provenance fields");
    expect(DEMO_PREAMBLE).toContain("Aggregate, slice arrays, and project columns inside the sandbox after filtering");
    expect(BASE_SERVER_INSTRUCTIONS).toContain(
      "filter raw rows or nested field variants before projecting compact columns"
    );
  });

  it("references no non-exposed operations or retired skills (ADR-0003)", () => {
    expect(() => assertNoNonExposedRefsInText(DEMO_SYSTEM_PROMPT, "demo system prompt")).not.toThrow();
  });
});
