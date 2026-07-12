import { describe, expect, it } from "vitest";
import {
  demoInputTelemetry,
  demoFinalTextTelemetry,
  isMeaningfulDemoOutput,
  sumDemoUsage
} from "../src/demo/output";

describe("isMeaningfulDemoOutput", () => {
  it("does not count liveness-only frames as fallback-suppressing output", () => {
    expect(isMeaningfulDemoOutput({ type: "ready" })).toBe(false);
    expect(isMeaningfulDemoOutput({ type: "thinking", text: "reasoning tail" })).toBe(false);
    expect(isMeaningfulDemoOutput({ type: "done", reason: "stop" })).toBe(false);
    expect(isMeaningfulDemoOutput({ type: "error", message: "provider failed" })).toBe(false);
  });

  it("counts visible text and tool trace frames as useful output", () => {
    expect(isMeaningfulDemoOutput({ type: "token", text: "answer" })).toBe(true);
    expect(isMeaningfulDemoOutput({ type: "tool-start", id: "t1", tool: "search", input: { query: "soroban" } })).toBe(
      true
    );
    expect(isMeaningfulDemoOutput({ type: "tool-result", id: "t1", tool: "search", ok: true, output: { hits: [] } })).toBe(
      true
    );
  });

  it("does not count empty text deltas", () => {
    expect(isMeaningfulDemoOutput({ type: "token", text: "" })).toBe(false);
  });
});

describe("sumDemoUsage", () => {
  it("returns undefined when no model attempt reported usage", () => {
    expect(sumDemoUsage([])).toBeUndefined();
  });

  it("sums token usage across model attempts while preserving unknown fields", () => {
    expect(
      sumDemoUsage([
        {
          inputTokens: 10,
          cacheReadTokens: undefined,
          cacheWriteTokens: 2,
          outputTokens: 20,
          reasoningTokens: 18,
          totalTokens: 30
        },
        {
          inputTokens: 11,
          cacheReadTokens: 4,
          cacheWriteTokens: undefined,
          outputTokens: 21,
          reasoningTokens: 0,
          totalTokens: 32
        }
      ])
    ).toEqual({
      inputTokens: 21,
      cacheReadTokens: 4,
      cacheWriteTokens: 2,
      outputTokens: 41,
      reasoningTokens: 18,
      totalTokens: 62
    });
  });
});

describe("demoFinalTextTelemetry", () => {
  it("records compact final text metadata without logging the full answer", () => {
    const text = `Here is the grounded answer.\n${"x".repeat(220)}`;

    expect(demoFinalTextTelemetry(text, "stop")).toEqual({
      hadFinalText: true,
      answerChars: text.length,
      answerPreview: `Here is the grounded answer. ${"x".repeat(151)}…[+69 chars]`,
      finalTextChars: text.length,
      finalPreview: `Here is the grounded answer. ${"x".repeat(151)}…[+69 chars]`,
      endedWithToolCalls: false,
      missingFinalText: false,
      finalNeededButMissing: false,
      budgetExhausted: false,
      stopReasonClass: "complete"
    });
  });

  it("redacts obvious sensitive values from the short preview", () => {
    const telemetry = demoFinalTextTelemetry(
      "Contact ada@example.com from 192.0.2.4 with Authorization: Bearer abcdef1234567890",
      "stop"
    );

    expect(telemetry.finalPreview).toContain("[redacted-email]");
    expect(telemetry.finalPreview).toContain("[redacted-ip]");
    expect(telemetry.finalPreview).toContain("Authorization: Bearer [redacted-secret]");
    expect(telemetry.finalPreview).not.toContain("ada@example.com");
    expect(telemetry.finalPreview).not.toContain("192.0.2.4");
    expect(telemetry.finalPreview).not.toContain("abcdef1234567890");
  });

  it("redacts Stellar secret seeds from the short preview", () => {
    const seed = `S${"A".repeat(55)}`;
    const telemetry = demoFinalTextTelemetry(`Never expose ${seed}`, "stop");

    expect(telemetry.finalPreview).toContain("[redacted-stellar-secret]");
    expect(telemetry.finalPreview).not.toContain(seed);
  });

  it("flags unfinished tool-call stops as budget exhaustion with missing final text", () => {
    expect(demoFinalTextTelemetry("", "tool-calls")).toEqual({
      hadFinalText: false,
      answerChars: 0,
      answerPreview: null,
      finalTextChars: 0,
      finalPreview: null,
      endedWithToolCalls: true,
      missingFinalText: true,
      finalNeededButMissing: true,
      budgetExhausted: true,
      stopReasonClass: "budget-exhausted"
    });
  });

  it("classifies length stops as budget exhaustion even with partial visible text", () => {
    expect(demoFinalTextTelemetry("partial", "length")).toMatchObject({
      hadFinalText: true,
      budgetExhausted: true,
      stopReasonClass: "budget-exhausted"
    });
  });
});

describe("demoInputTelemetry", () => {
  it("records a compact sanitized latest-user preview plus hashes and counts", async () => {
    const fakeStellarSeed = "SA" + "A".repeat(54);
    const latest = `Can you check ada@example.com and this Stellar secret ${fakeStellarSeed}?`;
    const telemetry = await demoInputTelemetry(
      [
        { role: "user", content: "earlier" },
        { role: "assistant", content: "reply" },
        { role: "user", content: latest }
      ],
      "subject-123"
    );

    expect(telemetry).toMatchObject({
      latestUserChars: latest.length,
      historyMessages: 3,
      historyChars: "earlier".length + "reply".length + latest.length,
      userMessages: 2
    });
    expect(telemetry.latestUserHash).toMatch(/^[a-f0-9]{16}$/);
    expect(telemetry.subjectHash).toMatch(/^[a-f0-9]{16}$/);
    expect(telemetry.latestUserPreview).toContain("[redacted-email]");
    expect(telemetry.latestUserPreview).toContain("[redacted-stellar-secret]");
    expect(telemetry.latestUserPreview).not.toContain("ada@example.com");
    expect(telemetry.latestUserPreview).not.toContain(fakeStellarSeed);
  });
});
