export type DemoModelConfig = {
  model: string;
  role: "primary" | "fallback";
};

export const DEMO_PRIMARY_MODEL = "openai/gpt-5.4";
export const DEMO_FALLBACK_MODEL = "openai/gpt-5.4-mini";
export const DEMO_GROK_CONTROL_MODEL = "xai/grok-4.3";
export const DEMO_KIMI_CONTROL_MODEL = "@cf/moonshotai/kimi-k2.7-code";
export const DEMO_MODELS: readonly DemoModelConfig[] = [
  { model: DEMO_PRIMARY_MODEL, role: "primary" },
  { model: DEMO_FALLBACK_MODEL, role: "fallback" }
] as const;
export const DEMO_MODEL_OVERRIDE_VAR = "DEMO_MODEL_OVERRIDE";
export const DEMO_MODEL = DEMO_PRIMARY_MODEL;
export const DEMO_REASONING_EFFORT = "medium" as const;
export const DEMO_TEMPERATURE = 0.1;
export const DEMO_GATEWAY_ID_FALLBACK = "stellar-raven-demo";

export function demoModelsFromOverride(override: string | undefined): readonly DemoModelConfig[] {
  const models = (override ?? "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean)
    .slice(0, 4);
  if (models.length === 0) return DEMO_MODELS;
  return models.map((model, index) => ({ model, role: index === 0 ? "primary" : "fallback" }));
}

export async function demoSessionAffinity(subject: string): Promise<string> {
  const bytes = new TextEncoder().encode(`demo:${subject}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return `demo-${[...new Uint8Array(digest)]
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
}
