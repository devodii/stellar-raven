/**
 * Server-instructions budget guard (todo 971) — Claude Code truncates
 * injected MCP server instructions at exactly 2,048 characters (measured in
 * production 2026-07-13: the pre-fix 2,160-char BASE cut off mid-sentence
 * inside the envelope contract and the micro-map below it never arrived).
 * BASE_SERVER_INSTRUCTIONS must therefore be a complete, self-sufficient
 * workflow/envelope contract inside that budget; everything after it
 * (micro-map) is bonus for full-injection clients only.
 */
import { describe, expect, it } from "vitest";
import { BASE_SERVER_INSTRUCTIONS, SERVER_INSTRUCTIONS } from "../src/mcp/tools";

const CLAUDE_CODE_INSTRUCTIONS_CAP = 2048;
// Headroom so ordinary wording edits don't silently creep back over the cap.
const BUDGET = 2000;

describe("server instructions — Claude Code 2KB budget (todo 971)", () => {
  it(`keeps BASE within ${BUDGET} chars (hard client cap ${CLAUDE_CODE_INSTRUCTIONS_CAP})`, () => {
    expect(BASE_SERVER_INSTRUCTIONS.length).toBeLessThanOrEqual(BUDGET);
  });

  it("what survives truncation IS the whole contract — BASE ends on its final sentence", () => {
    const survived = SERVER_INSTRUCTIONS.slice(0, CLAUDE_CODE_INSTRUCTIONS_CAP);
    expect(survived).toContain(BASE_SERVER_INSTRUCTIONS);
    expect(BASE_SERVER_INSTRUCTIONS.endsWith("mid-script.")).toBe(true);
  });

  it("the surviving prefix carries every load-bearing rule", () => {
    const survived = SERVER_INSTRUCTIONS.slice(0, CLAUDE_CODE_INSTRUCTIONS_CAP);
    for (const phrase of [
      "ok: true, data", // envelope shape
      "soft-empty", // two-way error.kind + inconclusive semantics
      "NOT evidence of absence",
      "codemode.describe(", // detail-on-demand step
      "codemode.skill.read(id, { sections })", // skills read path
      "codemode.skill.run(", // runnable dispatch
      "codemode.artifact.info(id)", // truncation recovery
      "exact-match — never guess" // id discipline
    ]) {
      expect(survived, phrase).toContain(phrase);
    }
  });

  it("micro-map still rides after BASE for full-injection clients", () => {
    expect(SERVER_INSTRUCTIONS.startsWith(`${BASE_SERVER_INSTRUCTIONS}\n\n`)).toBe(true);
    expect(SERVER_INSTRUCTIONS.length).toBeGreaterThan(CLAUDE_CODE_INSTRUCTIONS_CAP);
  });
});
