#!/usr/bin/env node
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const qa = import.meta.dirname;
const root = path.resolve(qa, "..", "..");
const packetsFile = path.join(qa, "results", "lane1-blind-packets.json");
const adjudicationFile = path.join(qa, "results", "lane1-blind-adjudication.json");
const mappingFile = path.join(root, ".lane1-blind-mapping.json");
const outFile = path.join(qa, "results", "lane1-blind-escalation-packets.json");
const privateFile = path.join(root, ".lane1-escalation-mapping.json");
const packets = JSON.parse(readFileSync(packetsFile, "utf8"));
const adjudication = JSON.parse(readFileSync(adjudicationFile, "utf8"));
const mapping = JSON.parse(readFileSync(mappingFile, "utf8"));
const packetById = new Map(packets.packets.map((packet) => [packet.packetId, packet]));
const mappingById = new Map(mapping.mapping.map((item) => [item.packetId, item]));
const anchors = new Set([
  "q-agent-identity-erc8004-stellar", "q-crp-become-an-anchor-licensing",
  "q-crp-remittance-founder-advisory", "q-defi-liquid-staking-whitespace",
  "q-edge-1xlm-activation-fee", "q-hot-sdf-xlm-holdings-sales",
  "q-jutsu-what-is-a-memo", "q-raph-offramp-xlm-usdc",
  "q-scf-current-hackathons-compare-live", "q-sor-build-target-wasm32v1",
  "q-sor-scval-conversion", "q-soroban-no-std-constraints",
  "q-ti-explain-repo-payload-status", "q-ti-stellar-lab-usage-and-new-ui"
]);
const reasons = new Map();
for (const row of adjudication.rows) {
  const meta = mappingById.get(row.packetId);
  const why = [];
  if (row.uncertainty) why.push("material-uncertainty");
  if (anchors.has(meta.id) && row.recommendedScore !== meta.originalScore) why.push("conclusion-driving-disagreement");
  if (row.recommendedScore === "correct" && (
    row.wrongClaims?.length || row.avoidMatches?.length || row.keyFacts?.some((fact) => fact.status === "contradicted")
  )) why.push("internal-structural-contradiction");
  if (why.length) reasons.set(row.packetId, why);
}
const selected = [...reasons.keys()].map((id) => packetById.get(id));
selected.sort(() => randomBytes(1)[0] - 128);
writeFileSync(outFile, JSON.stringify({
  protocol: "lane1-blind-escalation/v1", packetCount: selected.length,
  instructions: packets.instructions, packets: selected
}, null, 2) + "\n");
writeFileSync(privateFile, JSON.stringify({
  packetCount: selected.length,
  mapping: selected.map((packet) => ({ ...mappingById.get(packet.packetId), reasons: reasons.get(packet.packetId) }))
}, null, 2) + "\n", { mode: 0o600 });
console.log(`wrote ${outFile}: ${selected.length} blinded escalation packets`);
