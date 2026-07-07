import { streamText } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { describe, expect, it } from "vitest";
import {
  DEMO_FALLBACK_MODEL,
  DEMO_GATEWAY_ID_FALLBACK,
  DEMO_GROK_CONTROL_MODEL,
  DEMO_KIMI_CONTROL_MODEL,
  DEMO_MODEL,
  DEMO_MODEL_OVERRIDE_VAR,
  DEMO_MODELS,
  DEMO_PRIMARY_MODEL,
  DEMO_REASONING_EFFORT,
  DEMO_TEMPERATURE,
  demoModelsFromOverride,
  demoSessionAffinity
} from "../src/demo/model-config";

describe("demo model config", () => {
  it("uses the gauntlet winner with a fast fallback, conservative sampling, and medium reasoning", () => {
    expect(DEMO_PRIMARY_MODEL).toBe("openai/gpt-5.4");
    expect(DEMO_FALLBACK_MODEL).toBe("openai/gpt-5.4-mini");
    expect(DEMO_GROK_CONTROL_MODEL).toBe("xai/grok-4.3");
    expect(DEMO_KIMI_CONTROL_MODEL).toBe("@cf/moonshotai/kimi-k2.7-code");
    expect(DEMO_MODEL).toBe(DEMO_PRIMARY_MODEL);
    expect(DEMO_MODELS).toEqual([
      { model: DEMO_PRIMARY_MODEL, role: "primary" },
      { model: DEMO_FALLBACK_MODEL, role: "fallback" }
    ]);
    expect(DEMO_TEMPERATURE).toBe(0.1);
    expect(DEMO_REASONING_EFFORT).toBe("medium");
    expect(DEMO_GATEWAY_ID_FALLBACK).toBe("stellar-raven-demo");
    expect(DEMO_MODEL_OVERRIDE_VAR).toBe("DEMO_MODEL_OVERRIDE");
  });

  it("keeps default models unless the server env supplies a gauntlet override", () => {
    expect(demoModelsFromOverride(undefined)).toBe(DEMO_MODELS);
    expect(demoModelsFromOverride("  ")).toBe(DEMO_MODELS);
    expect(demoModelsFromOverride("openai/gpt-5.4-mini")).toEqual([
      { model: "openai/gpt-5.4-mini", role: "primary" }
    ]);
    expect(demoModelsFromOverride("openai/gpt-5.4-mini,anthropic/claude-haiku-4.5")).toEqual([
      { model: "openai/gpt-5.4-mini", role: "primary" },
      { model: "anthropic/claude-haiku-4.5", role: "fallback" }
    ]);
  });

  it("derives stable non-raw session affinity keys", async () => {
    const a = await demoSessionAffinity("subject@example.com");
    const b = await demoSessionAffinity("subject@example.com");
    const c = await demoSessionAffinity("other@example.com");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^demo-[a-f0-9]{32}$/);
    expect(a).not.toContain("subject");
  });

  it("passes reasoning effort, temperature, and session affinity for Workers AI catalog models", async () => {
    const calls: Array<{ model: string; inputs: Record<string, unknown>; options?: { extraHeaders?: Record<string, string> } }> =
      [];
    const binding = {
      async run(model: string, inputs: Record<string, unknown>, options?: { extraHeaders?: Record<string, string> }) {
        calls.push({ model, inputs, options });
        return {
          choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: "ok" } }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
        };
      }
    };

    const workersai = createWorkersAI({ binding: binding as unknown as Ai });
    const result = streamText({
      model: workersai(DEMO_KIMI_CONTROL_MODEL, {
        sessionAffinity: "demo-test-affinity",
        reasoning_effort: DEMO_REASONING_EFFORT
      } as never),
      system: "system",
      messages: [{ role: "user", content: "hi" }],
      maxOutputTokens: 16,
      temperature: DEMO_TEMPERATURE
    });
    for await (const _ of result.fullStream) {
      // Drain stream so the provider call runs.
    }

    expect(calls).toHaveLength(1);
    expect(calls[0]?.model).toBe(DEMO_KIMI_CONTROL_MODEL);
    expect(calls[0]?.inputs.temperature).toBe(DEMO_TEMPERATURE);
    expect(calls[0]?.inputs.reasoning_effort).toBe(DEMO_REASONING_EFFORT);
    expect(calls[0]?.options?.extraHeaders?.["x-session-affinity"]).toBe("demo-test-affinity");
  });
});
