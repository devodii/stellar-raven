import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { classifyRegister } from "../eval/discovery/mine-agent-queries.mjs";
import { classifyMiss } from "../eval/discovery/classify-misses.mjs";
import { gradeVisibleSearches } from "../eval/discovery/lib.mjs";
import { MODEL, buildCatalogCards, cardSetHash } from "../eval/vectorize/frontier-config.mjs";
import { loadFrontierArtifact } from "../eval/vectorize/retrieval.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("discovery measurement extensions", () => {
  it("classifies one-shot misses from paired <=3-search evidence", () => {
    expect(classifyMiss({ familyHitAt3: true, usableOpAt5: true }, null)).toBe("downstream");
    expect(
      classifyMiss(
        { familyHitAt3: false, usableOpAt5: false },
        { familyHitAt3: true, usableOpAt5: true }
      )
    ).toBe("agent-behavior");
    expect(
      classifyMiss(
        { familyHitAt3: false, usableOpAt5: false },
        { familyHitAt3: true, usableOpAt5: false }
      )
    ).toBe("retrieval");
  });

  it("grades visibility across multiple searches without crediting final prose", () => {
    const c = { expectedFamilies: ["lumenloop"], acceptableOps: ["lumenloop.search_directory"] };
    const grade = gradeVisibleSearches(c, [
      { hits: [{ id: "scout.searchProjects", service: "scout" }] },
      { hits: [{ id: "lumenloop.search_directory", service: "lumenloop" }] }
    ]);
    expect(grade).toEqual({ familyHitAt3: true, usableOpAt5: true });
  });

  it("classifies the mined register with an explicit, deterministic rule", () => {
    expect(classifyRegister("Soroswap DEX project profile", "q-defi-soroswap-what-is")).toBe("mixed");
    expect(classifyRegister("Soroswap DEX Stellar", "q-defi-soroswap-what-is")).toBe("entity-only");
    expect(classifyRegister("weighted AMM research articles", "q-defi-comet-content")).toBe("capability");
  });

  it("keeps the committed replay lane PII-safe and provenance-bearing", () => {
    const lane = JSON.parse(readFileSync(path.join(ROOT, "eval/discovery/mined-lumenloop-queries.json"), "utf8"));
    expect(lane.summary.occurrenceCount).toBe(lane.occurrences.length);
    expect(lane.summary.caseCount).toBe(8);
    expect(lane.provenance).toHaveLength(3);
    for (const row of lane.occurrences) {
      expect(row.query).not.toMatch(/[A-Z2-7]{56}/);
      expect(row.query).not.toMatch(/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/);
    }
  });
});

describe("pinned Vectorize frontier artifact", () => {
  it("matches every exposed catalog card and decodes fixed-width vectors", () => {
    const loaded = loadFrontierArtifact();
    const cards = buildCatalogCards();
    expect(loaded.cards).toHaveLength(272);
    expect(loaded.artifact.cardSetSha256).toBe(cardSetHash(cards));
    expect(loaded.vectors).toHaveLength(cards.length);
    expect(loaded.vectors.every((vector) => vector.length === MODEL.dimensions)).toBe(true);
    expect(loaded.artifact.model.revision).toBe("c25a394dd583836952667c12f008335071b3f43d");
    expect(loaded.artifact.model.runtime).toBe("@huggingface/transformers@4.2.0");
  });
});
