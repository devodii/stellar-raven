#!/usr/bin/env node
import { randomBytes, randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "..");
const combinedPath = path.join(import.meta.dirname, "results", "lane1-ab-combined.json");
const samplePath = path.join(import.meta.dirname, "sample.json");
const packetsPath = path.join(import.meta.dirname, "results", "lane1-blind-packets.json");
const mappingPath = path.join(root, ".lane1-blind-mapping.json");
const combined = JSON.parse(readFileSync(combinedPath, "utf8"));
const sample = JSON.parse(readFileSync(samplePath, "utf8"));
const cases = new Map(sample.cases.map((kase) => [kase.id, kase]));
const anchors = new Set([
  "q-agent-identity-erc8004-stellar", "q-crp-become-an-anchor-licensing",
  "q-crp-remittance-founder-advisory", "q-defi-liquid-staking-whitespace",
  "q-edge-1xlm-activation-fee", "q-hot-sdf-xlm-holdings-sales",
  "q-jutsu-what-is-a-memo", "q-raph-offramp-xlm-usdc",
  "q-scf-current-hackathons-compare-live", "q-sor-build-target-wasm32v1",
  "q-sor-scval-conversion", "q-soroban-no-std-constraints",
  "q-ti-explain-repo-payload-status", "q-ti-stellar-lab-usage-and-new-ui"
]);
const selectedIds = new Set(combined.perId
  .filter((item) => new Set(Object.values(item.scores)).size > 1)
  .map((item) => item.id));
for (const id of anchors) selectedIds.add(id);

const packets = [];
const mapping = [];
for (const runId of combined.runOrder) {
  for (const row of combined.runs[runId].rows) {
    if (!selectedIds.has(row.id)) continue;
    const kase = cases.get(row.id);
    const packetId = `pkt-${randomUUID()}`;
    packets.push({
      packetId,
      question: kase.question,
      golden: kase.golden,
      candidateAnswer: row.answer,
      transcriptEvidence: row.transcript
    });
    mapping.push({ packetId, runId, id: row.id, originalScore: row.verdict.score });
  }
}
packets.sort(() => randomBytes(1)[0] - 128);
writeFileSync(packetsPath, JSON.stringify({
  protocol: "lane1-blind-adjudication/v1",
  packetCount: packets.length,
  selectedCaseCount: selectedIds.size,
  instructions: {
    outputFields: ["packetId", "keyFacts", "wrongClaims", "avoidMatches", "recommendedScore", "confidence", "uncertainty"],
    scores: ["correct", "partial", "wrong"]
  },
  packets
}, null, 2) + "\n");
writeFileSync(mappingPath, JSON.stringify({ packetCount: mapping.length, mapping }, null, 2) + "\n", { mode: 0o600 });
console.log(`wrote ${packetsPath}: ${packets.length} randomized packets across ${selectedIds.size} cases`);
console.log(`wrote private mapping ${mappingPath}`);
