#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const qa = import.meta.dirname;
const root = path.resolve(qa, "..", "..");
const read = (name) => JSON.parse(readFileSync(name, "utf8"));
const combined = read(path.join(qa, "results", "lane1-ab-combined.json"));
const packets = read(path.join(qa, "results", "lane1-blind-packets.json"));
const primary = read(path.join(qa, "results", "lane1-blind-adjudication.json"));
const escalationPackets = read(path.join(qa, "results", "lane1-blind-escalation-packets.json"));
const escalation = read(path.join(qa, "results", "lane1-blind-escalation-adjudication.json"));
const mapping = read(path.join(root, ".lane1-blind-mapping.json"));
const fail = (message) => { throw new Error(message); };
const unique = (values) => new Set(values).size === values.length;
const requireSet = (actual, expected, label) => {
  if (!unique(actual) || actual.length !== expected.length || actual.some((id) => !expected.includes(id))) {
    fail(`${label}: packet coverage mismatch`);
  }
};
const validateRows = (artifact, expectedIds, label) => {
  if (!Array.isArray(artifact.rows)) fail(`${label}: rows[] missing`);
  const ids = artifact.rows.map((row) => row.packetId);
  requireSet(ids, expectedIds, label);
  for (const row of artifact.rows) {
    if (!["correct", "partial", "wrong"].includes(row.recommendedScore)) fail(`${label}/${row.packetId}: invalid score`);
  }
};

const packetIds = packets.packets.map((packet) => packet.packetId);
const escalationIds = escalationPackets.packets.map((packet) => packet.packetId);
requireSet(mapping.mapping.map((item) => item.packetId), packetIds, "private mapping");
validateRows(primary, packetIds, "primary adjudication");
validateRows(escalation, escalationIds, "escalation adjudication");
const metaByPacket = new Map(mapping.mapping.map((item) => [item.packetId, item]));
const primaryByPacket = new Map(primary.rows.map((row) => [row.packetId, row]));
const escalationByPacket = new Map(escalation.rows.map((row) => [row.packetId, row]));
const joinedRows = packetIds.map((packetId) => {
  const first = primaryByPacket.get(packetId);
  const second = escalationByPacket.get(packetId) ?? null;
  const agreement = second ? first.recommendedScore === second.recommendedScore : true;
  return {
    ...metaByPacket.get(packetId), packetId,
    primary: { score: first.recommendedScore, confidence: first.confidence, uncertainty: first.uncertainty },
    escalation: second ? { score: second.recommendedScore, confidence: second.confidence, uncertainty: second.uncertainty } : null,
    agreement,
    adjudicatedScore: agreement ? first.recommendedScore : null
  };
});
const joinedByRunId = new Map(joinedRows.map((row) => [`${row.runId}\0${row.id}`, row]));
const anchors = [
  "q-agent-identity-erc8004-stellar", "q-crp-become-an-anchor-licensing",
  "q-crp-remittance-founder-advisory", "q-defi-liquid-staking-whitespace",
  "q-edge-1xlm-activation-fee", "q-hot-sdf-xlm-holdings-sales",
  "q-jutsu-what-is-a-memo", "q-raph-offramp-xlm-usdc",
  "q-scf-current-hackathons-compare-live", "q-sor-build-target-wasm32v1",
  "q-sor-scval-conversion", "q-soroban-no-std-constraints",
  "q-ti-explain-repo-payload-status", "q-ti-stellar-lab-usage-and-new-ui"
];
const score = (runId, id) => joinedByRunId.get(`${runId}\0${id}`)?.adjudicatedScore ?? null;
const recoveries = {};
const regressions = {};
for (const arm of ["opus", "fable"]) {
  recoveries[arm] = anchors.filter((id) =>
    score(`${arm}-1`, id) === "correct" && score(`${arm}-2`, id) === "correct" &&
    ["partial", "wrong"].includes(score("control-1", id)) &&
    ["partial", "wrong"].includes(score("control-2", id))
  );
  regressions[arm] = combined.perId.filter((item) => {
    const id = item.id;
    return score(`${arm}-1`, id) === "wrong" && score(`${arm}-2`, id) === "wrong" &&
      ["correct", "partial"].includes(score("control-1", id)) &&
      ["correct", "partial"].includes(score("control-2", id));
  }).map((item) => item.id);
}
const artifact = {
  protocol: "lane1-adjudication-join/v1",
  guards: "PASS",
  packetCount: packetIds.length,
  escalationPacketCount: escalationIds.length,
  escalationAgreements: joinedRows.filter((row) => row.escalation && row.agreement).length,
  unresolvedDisagreements: joinedRows.filter((row) => row.escalation && !row.agreement).map((row) => ({
    packetId: row.packetId, runId: row.runId, id: row.id,
    primaryScore: row.primary.score, escalationScore: row.escalation.score
  })),
  recoveries,
  regressions,
  rows: joinedRows
};
writeFileSync(path.join(qa, "results", "lane1-adjudication-joined.json"), JSON.stringify(artifact, null, 2) + "\n");
console.log(JSON.stringify({
  guards: artifact.guards, packets: artifact.packetCount, escalationPackets: artifact.escalationPacketCount,
  escalationAgreements: artifact.escalationAgreements,
  unresolvedDisagreements: artifact.unresolvedDisagreements.length,
  recoveries, regressions
}, null, 2));
