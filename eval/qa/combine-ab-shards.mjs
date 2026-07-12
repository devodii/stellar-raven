#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const fail = (message) => { throw new Error(message); };
const readJson = (filePath) => {
  const text = readFileSync(filePath, "utf8");
  return { value: JSON.parse(text), sha256: sha256(text) };
};

function parseArgs(argv) {
  let manifestPath;
  let outPath;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--manifest") manifestPath = argv[++i];
    else if (argv[i] === "--out") outPath = argv[++i];
    else fail(`unknown argument ${argv[i]}`);
  }
  if (!manifestPath) fail("--manifest <path> is required");
  return { manifestPath: path.resolve(manifestPath), outPath: outPath ? path.resolve(outPath) : null };
}

const RUN_ORDER = ["opus-1", "opus-2", "fable-1", "fable-2", "control-1", "control-2"];
const EXPECTED_MODELS = {
  "opus-1": "opus", "opus-2": "opus", "fable-1": "fable", "fable-2": "fable",
  "control-1": "claude-sonnet-5", "control-2": "claude-sonnet-5"
};
const EXPECTED = {
  sampleFileSha256: "bdd732870cde369a2439646e2987c9e5629fc2128dc4f80d0974767294ccbf26",
  wholeCasesSha256: "5b46b0dfe31b577f08e72ce6ee92617435630bf0453b7f3795a4204569ed82aa",
  serverRevision: "d35003050024d43abe72d0820eacb8d37a0bf92a",
  surfaceSha256: "50e0f782ca2b743d9d73467e285d83ae2294bab7bd00c82f65da9846ab925ef5",
  judgeModel: "claude-sonnet-5", judgeRubric: "v2.4", packVersion: "p3",
  variant: "A", surface: "search-execute", searchTool: "search"
};

function summarize(rows) {
  const summary = { correct: 0, partial: 0, wrong: 0, error: 0, total: rows.length };
  for (const row of rows) {
    const score = row.verdict?.score;
    if (!(score in summary) || score === "total") fail(`invalid verdict score for ${row.id}: ${score}`);
    summary[score]++;
  }
  return summary;
}

function main() {
  const { manifestPath, outPath } = parseArgs(process.argv.slice(2));
  const manifest = readJson(manifestPath).value;
  if (JSON.stringify(Object.keys(manifest.runs ?? {}).sort()) !== JSON.stringify([...RUN_ORDER].sort())) {
    fail(`manifest must contain exactly: ${RUN_ORDER.join(", ")}`);
  }
  const samplePath = path.resolve(path.dirname(manifestPath), manifest.samplePath ?? "../sample.json");
  const sampleRead = readJson(samplePath);
  const sample = sampleRead.value;
  if (sampleRead.sha256 !== EXPECTED.sampleFileSha256) fail("sample.json byte SHA mismatch");
  if (!Array.isArray(sample.cases) || sample.cases.length !== 30) fail("sample must contain exactly 30 cases");
  if (sha256(JSON.stringify(sample.cases)) !== EXPECTED.wholeCasesSha256) fail("whole sample case SHA mismatch");
  const sampleIds = sample.cases.map((kase) => kase.id);
  const sampleById = new Map(sample.cases.map((kase) => [kase.id, kase]));
  const shardIds = [sampleIds.slice(0, 10), sampleIds.slice(10, 20), sampleIds.slice(20, 30)];
  const allPaths = [];
  const allStamps = [];
  const runs = {};
  let sharedTuple = null;

  for (const runId of RUN_ORDER) {
    const declared = manifest.runs[runId];
    if (declared.model !== EXPECTED_MODELS[runId]) fail(`${runId} declared model mismatch`);
    if (!Array.isArray(declared.shards) || declared.shards.length !== 3) fail(`${runId} must have exactly 3 shards`);
    const combinedRows = [];
    const sources = [];
    let runTuple = null;
    for (let shardIndex = 0; shardIndex < 3; shardIndex++) {
      const resultPath = path.resolve(path.dirname(manifestPath), declared.shards[shardIndex]);
      const source = readJson(resultPath);
      const result = source.value;
      const stamp = path.basename(resultPath, ".json");
      allPaths.push(resultPath); allStamps.push(stamp);
      if (!Array.isArray(result.rows) || result.rows.length !== 10) fail(`${runId}/s${shardIndex + 1}: expected 10 rows`);
      const ids = result.rows.map((row) => row.id);
      if (new Set(ids).size !== 10 || JSON.stringify(ids) !== JSON.stringify(shardIds[shardIndex])) {
        fail(`${runId}/s${shardIndex + 1}: row ids/order mismatch`);
      }
      const selectedCases = ids.map((id) => sampleById.get(id));
      const expectedCasesSha = sha256(JSON.stringify(selectedCases));
      const expectedIdsSha = sha256(JSON.stringify(ids));
      if (result.meta?.inputSnapshot?.casesSha256 !== expectedCasesSha) fail(`${runId}/s${shardIndex + 1}: casesSha mismatch`);
      if (result.meta?.inputSnapshot?.caseIdsSha256 !== expectedIdsSha) fail(`${runId}/s${shardIndex + 1}: caseIdsSha mismatch`);
      const tuple = {
        model: result.meta?.model, judgeModel: result.meta?.judgeModel,
        judgeRubric: result.meta?.judgeRubric, packVersion: result.meta?.packVersion,
        variant: result.meta?.variant, surface: result.meta?.surface, searchTool: result.meta?.searchTool,
        casesPath: result.meta?.casesPath, serverRevision: result.meta?.sourceIdentity?.serverRevision,
        runnerRevision: result.meta?.sourceIdentity?.runnerRevision,
        runnerFileSha256: result.meta?.sourceIdentity?.runnerFileSha256,
        manifestFileSha256: result.meta?.sourceIdentity?.manifestFileSha256,
        toolSurface: result.meta?.toolSurface
      };
      if (tuple.model !== EXPECTED_MODELS[runId]) fail(`${runId}/s${shardIndex + 1}: model mismatch`);
      for (const key of ["judgeModel", "judgeRubric", "packVersion", "variant", "surface", "searchTool"]) {
        if (tuple[key] !== EXPECTED[key]) fail(`${runId}/s${shardIndex + 1}: ${key} mismatch`);
      }
      if (tuple.serverRevision !== EXPECTED.serverRevision) fail(`${runId}/s${shardIndex + 1}: server revision mismatch`);
      if (tuple.toolSurface?.surfaceSha256 !== EXPECTED.surfaceSha256) fail(`${runId}/s${shardIndex + 1}: tool surface mismatch`);
      if (runTuple && JSON.stringify(tuple) !== JSON.stringify(runTuple)) fail(`${runId}: nonuniform shard tuple`);
      runTuple ??= tuple;
      const crossTuple = { ...tuple }; delete crossTuple.model;
      if (sharedTuple && JSON.stringify(crossTuple) !== JSON.stringify(sharedTuple)) fail(`${runId}: cross-run tuple mismatch`);
      sharedTuple ??= crossTuple;
      for (const row of result.rows) {
        if (row.verdict?.rubric !== EXPECTED.judgeRubric || row.verdict?.packVersion !== EXPECTED.packVersion) {
          fail(`${runId}/${row.id}: verdict tuple mismatch`);
        }
        if (row.verdict?.score === "error") fail(`${runId}/${row.id}: error verdict invalidates run`);
      }
      sources.push({
        shard: shardIndex + 1, stamp, path: resultPath, sourceSha256: source.sha256,
        startedAt: result.meta.startedAt, finishedAt: result.meta.finishedAt,
        costUsd: result.meta.totalCostUsd, summary: result.summary,
        casesSha256: expectedCasesSha, caseIdsSha256: expectedIdsSha
      });
      combinedRows.push(...result.rows);
    }
    if (combinedRows.length !== 30 || new Set(combinedRows.map((row) => row.id)).size !== 30 ||
        JSON.stringify(combinedRows.map((row) => row.id)) !== JSON.stringify(sampleIds)) {
      fail(`${runId}: incomplete or duplicate logical run`);
    }
    runs[runId] = {
      model: EXPECTED_MODELS[runId], wholeCasesSha256: EXPECTED.wholeCasesSha256,
      summary: summarize(combinedRows), totalCostUsd: sources.reduce((sum, item) => sum + item.costUsd, 0),
      sources, rows: combinedRows
    };
  }
  if (new Set(allPaths).size !== 18 || new Set(allStamps).size !== 18) fail("source paths/stamps must be 18 distinct artifacts");
  const perId = sampleIds.map((id) => ({
    id,
    scores: Object.fromEntries(RUN_ORDER.map((runId) => [runId, runs[runId].rows.find((row) => row.id === id).verdict.score]))
  }));
  const artifact = {
    meta: {
      tool: "combine-ab-shards/v1", manifestPath,
      guards: "PASS", sourceCount: 18, logicalRunCount: 6, wholeCasesSha256: EXPECTED.wholeCasesSha256,
      sampleFileSha256: EXPECTED.sampleFileSha256, tuple: sharedTuple,
      totalQaCostUsd: RUN_ORDER.reduce((sum, runId) => sum + runs[runId].totalCostUsd, 0)
    },
    sourceStamps: allStamps,
    runOrder: RUN_ORDER,
    runs,
    perId
  };
  const text = JSON.stringify(artifact, null, 2) + "\n";
  if (outPath) writeFileSync(outPath, text);
  else process.stdout.write(text);
  console.error(`combine-ab-shards: PASS · 18 sources · 6 complete logical runs · QA $${artifact.meta.totalQaCostUsd.toFixed(6)}`);
}

try { main(); } catch (error) { console.error(`combine-ab-shards: FAIL: ${error.message}`); process.exitCode = 1; }
