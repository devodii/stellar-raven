import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { lintLiveContract } from "../eval/qa/lint-corpus.mjs";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "qa-live-contract");
const load = (name) => JSON.parse(readFileSync(join(FIXTURES, name), "utf8"));
const hydrateDigest = (contract) => {
  const copy = structuredClone(contract);
  if (copy.contractProvenance) {
    const digest = createHash("sha256").update(JSON.stringify(copy.cases)).digest("hex");
    copy.contractProvenance.caseContentDigest = `sha256(JSON.stringify(cases))=${digest}`;
  }
  return copy;
};
const errors = (current, previous) => lintLiveContract(current, previous).filter((item) => item.level === "error");

describe("live-contract lint mode", () => {
  it("accepts a new case only with a version bump, provenance note, and verification", () => {
    const previous = hydrateDigest(load("base-v1.json"));
    const current = hydrateDigest(load("new-case-v2.json"));
    expect(errors(current, previous)).toEqual([]);

    const withoutBump = structuredClone(current);
    withoutBump.contract = previous.contract;
    withoutBump.contractProvenance.content = previous.contractProvenance.content;
    expect(errors(withoutBump, previous).map((item) => item.message).join("\n")).toMatch(/contract-version bump/);
    expect(errors(withoutBump, previous).map((item) => item.message).join("\n")).toMatch(/contractProvenance\.content/);
  });

  it("accepts a carried byte-identical case but rejects an unversioned judge-facing edit", () => {
    const previous = hydrateDigest(load("base-v1.json"));
    expect(errors(previous, previous)).toEqual([]);

    const changed = structuredClone(previous);
    changed.cases[0].question = "What does the changed live fixture service report right now?";
    const changedWithDigest = hydrateDigest(changed);
    const messages = errors(changedWithDigest, previous).map((item) => item.message).join("\n");
    expect(messages).toMatch(/contract-version bump/);
    expect(messages).toMatch(/judge-facing gospel changed/);
  });

  it("rejects a contract digest that no longer agrees with the content pin", () => {
    const previous = hydrateDigest(load("base-v1.json"));
    const changed = hydrateDigest(load("new-case-v2.json"));
    changed.contractProvenance.caseContentDigest = previous.contractProvenance.caseContentDigest;
    expect(errors(changed, previous)).toEqual(expect.arrayContaining([
      expect.objectContaining({ lane: "live-contract", message: expect.stringContaining("does not match case content") })
    ]));
  });

  it("rejects missing contract provenance and live-case truth blocks", () => {
    const malformed = hydrateDigest(load("base-v1.json"));
    delete malformed.contractProvenance;
    delete malformed.cases[0].truth;
    const messages = errors(malformed).map((item) => item.message).join("\n");
    expect(messages).toMatch(/contractProvenance/);
    expect(messages).toMatch(/truth\./);
  });

  it("rejects an unqualified volatile numeric target in a behavioral golden", () => {
    const malformed = hydrateDigest(load("base-v1.json"));
    malformed.cases[0].golden.answer = "The current fixture price is 42 XLM.";
    const messages = errors(hydrateDigest(malformed)).map((item) => item.message).join("\n");
    expect(messages).toMatch(/pins a volatile numeric/);
  });
});
