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
import {
  BASE_SERVER_INSTRUCTIONS,
  EXECUTE_DESCRIPTION,
  SEARCH_DESCRIPTION,
  SERVER_INSTRUCTIONS,
  searchHitSchema
} from "../src/mcp/tools";

const CLAUDE_CODE_INSTRUCTIONS_CAP = 2048;
// Headroom so ordinary wording edits don't silently creep back over the cap.
const BUDGET = 2000;

describe("server instructions — Claude Code 2KB budget (todo 971)", () => {
  it(`keeps BASE within ${BUDGET} chars (hard client cap ${CLAUDE_CODE_INSTRUCTIONS_CAP})`, () => {
    expect(BASE_SERVER_INSTRUCTIONS.length).toBeLessThanOrEqual(BUDGET);
  });

  it("what survives truncation IS the whole contract — BASE ends on a sentence boundary", () => {
    // Budget + prefix invariants above/below make containment automatic; the
    // check that isn't automatic is that BASE reads complete where the client
    // cuts — it must end mid-nothing, not mid-sentence.
    expect(BASE_SERVER_INSTRUCTIONS.endsWith(".")).toBe(true);
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
      "exact-match — never guess", // id discipline
      "open-world identity, history, or topic",
      "off-target, adjacent, or only semantic candidates",
      "lumenloop.search_content_semantic",
      "scout.searchResearch",
      "exact identity or canonical slug plus source and date"
    ]) {
      expect(survived, phrase).toContain(phrase);
    }
  });

  it("micro-map still rides after BASE for full-injection clients", () => {
    expect(SERVER_INSTRUCTIONS.startsWith(`${BASE_SERVER_INSTRUCTIONS}\n\n`)).toBe(true);
    expect(SERVER_INSTRUCTIONS.length).toBeGreaterThan(CLAUDE_CODE_INSTRUCTIONS_CAP);
  });

  it("makes prior-art discovery a bounded design-stage preflight, not a universal build gate", () => {
    for (const contract of [SEARCH_DESCRIPTION, EXECUTE_DESCRIPTION]) {
      expect(contract).toMatch(/at most two .*discovery calls/i);
      expect(contract).toContain("one focused detail call");
      expect(contract).toContain("three returned candidates");
      expect(contract).toMatch(/scope, pitfalls, and build-vs-integrate/i);
      expect(contract).toMatch(/single-step how-tos and debugging/i);
      expect(contract).toMatch(/license\/audit\/deployment\/compatibility.*unknown unless source-backed/i);
    }
    expect(EXECUTE_DESCRIPTION).toContain("scout.searchRepos");
    expect(EXECUTE_DESCRIPTION).toContain("scout.searchProjects");
    expect(EXECUTE_DESCRIPTION).toMatch(/never API, security, maintenance, or production authority/i);
  });

  it("states one coherent cross-tier score and promotion contract", () => {
    const scoreDescription = searchHitSchema.shape.score.description ?? "";
    const tierDescription = searchHitSchema.shape.tier.description ?? "";
    for (const contract of [SEARCH_DESCRIPTION, scoreDescription, tierDescription]) {
      expect(contract).toContain(">=1.6x");
    }
    expect(SEARCH_DESCRIPTION).toContain("Hit order is authoritative");
    expect(SEARCH_DESCRIPTION).not.toMatch(/always ranked below every gated hit/i);
    expect(SEARCH_DESCRIPTION).not.toMatch(/only among same-tier/i);
  });
});
