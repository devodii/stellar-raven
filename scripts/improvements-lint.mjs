#!/usr/bin/env node
import path from "node:path";
import {
  ALLOWED_SERVICES,
  ALLOWED_STATUSES,
  listFindingFiles,
  parseFinding,
} from "./improvements-lib.mjs";

const statusRank = {
  proposed: 0,
  verified: 1,
  "reported-upstream": 2,
  "fixed-upstream": 3,
};

const errors = [];
const githubRefRe = /https:\/\/github\.com\/[^/\s)]+\/[^/\s)]+\/(?:issues|pull)\/\d+/i;
const dateRe = /^\d{4}-\d{2}-\d{2}$/;

for (const file of listFindingFiles()) {
  let finding;
  try {
    finding = parseFinding(file);
  } catch (err) {
    errors.push(String(err.message ?? err));
    continue;
  }
  const fm = finding.frontmatter;
  const label = path.relative(process.cwd(), file);

  for (const key of ["id", "service", "status", "discovered", "evidence"]) {
    if (fm[key] === undefined) errors.push(`${label}: missing frontmatter field '${key}'`);
  }
  if (fm.service && !ALLOWED_SERVICES.has(fm.service)) {
    errors.push(`${label}: invalid service '${fm.service}'`);
  }
  if (fm.status && !ALLOWED_STATUSES.has(fm.status)) {
    errors.push(`${label}: invalid status '${fm.status}'`);
  }
  if (fm.discovered && !dateRe.test(fm.discovered)) {
    errors.push(`${label}: discovered must be YYYY-MM-DD`);
  }
  if (!Array.isArray(fm.evidence) || fm.evidence.length === 0) {
    errors.push(`${label}: evidence must be a non-empty list`);
  }
  if (fm.service && fm.id && !fm.id.startsWith(prefixForService(fm.service))) {
    errors.push(`${label}: id '${fm.id}' does not match service '${fm.service}'`);
  }
  if (fm.evidence?.some((entry) => githubRefRe.test(entry)) && statusRank[fm.status] < statusRank["reported-upstream"]) {
    errors.push(`${label}: evidence contains a GitHub issue/PR URL but status is '${fm.status}'`);
  }
  if (fm.recurrences !== undefined && !Array.isArray(fm.recurrences)) {
    errors.push(`${label}: recurrences must be a list when present`);
  }
  for (const [idx, recurrence] of (fm.recurrences ?? []).entries()) {
    if (!dateRe.test(recurrence.date ?? "")) {
      errors.push(`${label}: recurrences[${idx}].date must be YYYY-MM-DD`);
    }
    if (!recurrence.evidence) {
      errors.push(`${label}: recurrences[${idx}].evidence is required`);
    }
  }
  if (fm.probe !== undefined) validateProbe(label, fm.probe);
}

if (errors.length) {
  console.error(`improvements lint failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`improvements lint ok (${listFindingFiles().length} findings)`);

function prefixForService(service) {
  return {
    lumenloop: "ll-",
    "stellar-light-scout": "sls-",
    "stellar-docs": "sd-",
    skills: "sk-",
  }[service];
}

function validateProbe(label, probe) {
  if (!probe.type) errors.push(`${label}: probe.type is required`);
  if (probe.type !== "http-text") {
    errors.push(`${label}: unsupported probe.type '${probe.type}'`);
  }
  if (!probe.url || !/^https?:\/\//.test(probe.url)) {
    errors.push(`${label}: probe.url must be an http(s) URL`);
  }
  const expect = probe.expect;
  if (!expect || typeof expect !== "object") {
    errors.push(`${label}: probe.expect is required`);
    return;
  }
  if (expect.status !== undefined && !Number.isInteger(expect.status)) {
    errors.push(`${label}: probe.expect.status must be an integer`);
  }
  for (const key of ["contains", "excludes"]) {
    if (expect[key] !== undefined && !Array.isArray(expect[key])) {
      errors.push(`${label}: probe.expect.${key} must be a list`);
    }
  }
}
