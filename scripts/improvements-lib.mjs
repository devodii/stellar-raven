import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
export const IMPROVEMENTS_DIR = path.join(ROOT, "improvements");
export const ALLOWED_SERVICES = new Set([
  "lumenloop",
  "stellar-light-scout",
  "stellar-docs",
  "skills",
]);
export const ALLOWED_STATUSES = new Set([
  "proposed",
  "verified",
  "reported-upstream",
  "fixed-upstream",
]);

export function listFindingFiles() {
  const files = [];
  for (const service of readdirSync(IMPROVEMENTS_DIR, { withFileTypes: true })) {
    if (!service.isDirectory()) continue;
    const dir = path.join(IMPROVEMENTS_DIR, service.name);
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(path.join(dir, entry.name));
      }
    }
  }
  return files.sort();
}

export function parseFinding(file) {
  const raw = readFileSync(file, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    throw new Error(`${file}: missing frontmatter`);
  }
  const frontmatterRaw = match[1];
  const body = raw.slice(match[0].length);
  return {
    file,
    relPath: path.relative(ROOT, file),
    raw,
    frontmatterRaw,
    frontmatter: parseFrontmatter(frontmatterRaw),
    body,
  };
}

export function parseFrontmatter(text) {
  const out = {};
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const top = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!top) continue;
    const [, key, value = ""] = top;
    if (value.trim() !== "") {
      out[key] = unquote(value.trim());
      continue;
    }

    const block = [];
    let j = i + 1;
    while (j < lines.length && /^  /.test(lines[j])) {
      block.push(lines[j]);
      j++;
    }
    i = j - 1;
    if (key === "evidence") out[key] = parseScalarList(block);
    else if (key === "recurrences") out[key] = parseObjectList(block);
    else if (key === "probe") out[key] = parseIndentedObject(block, 2);
    else out[key] = block.join("\n");
  }
  return out;
}

function parseScalarList(lines) {
  return lines
    .map((line) => line.match(/^  -\s*(.*)$/)?.[1])
    .filter((line) => line !== undefined)
    .map((line) => unquote(line.trim()));
}

function parseObjectList(lines) {
  const items = [];
  let current = null;
  for (const line of lines) {
    const start = line.match(/^  -\s*([A-Za-z0-9_-]+):\s*(.*)$/);
    if (start) {
      current = {};
      items.push(current);
      current[start[1]] = unquote(start[2].trim());
      continue;
    }
    const prop = line.match(/^    ([A-Za-z0-9_-]+):\s*(.*)$/);
    if (prop && current) current[prop[1]] = unquote(prop[2].trim());
  }
  return items;
}

function parseIndentedObject(lines, baseIndent) {
  const out = {};
  let currentKey = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prop = line.match(new RegExp(`^ {${baseIndent}}([A-Za-z0-9_-]+):(?:\\s*(.*))?$`));
    if (!prop) continue;
    const [, key, value = ""] = prop;
    if (value.trim() !== "") {
      out[key] = unquote(value.trim());
      currentKey = key;
      continue;
    }
    currentKey = key;
    const child = [];
    let j = i + 1;
    while (j < lines.length && new RegExp(`^ {${baseIndent + 2}}`).test(lines[j])) {
      child.push(lines[j]);
      j++;
    }
    i = j - 1;
    const hasLists = child.some((childLine) => childLine.match(new RegExp(`^ {${baseIndent + 2}}[A-Za-z0-9_-]+:\\s*$`)));
    if (hasLists) out[key] = parseExpectationObject(child, baseIndent + 2);
    else out[key] = parseScalarList(child.map((childLine) => childLine.slice(baseIndent)));
  }
  void currentKey;
  return out;
}

function parseExpectationObject(lines, indent) {
  const out = {};
  for (let i = 0; i < lines.length; i++) {
    const prop = lines[i].match(new RegExp(`^ {${indent}}([A-Za-z0-9_-]+):(?:\\s*(.*))?$`));
    if (!prop) continue;
    const [, key, value = ""] = prop;
    if (value.trim()) {
      out[key] = parseScalarValue(value.trim());
      continue;
    }
    const list = [];
    let j = i + 1;
    while (j < lines.length && new RegExp(`^ {${indent + 2}}-\\s+`).test(lines[j])) {
      list.push(unquote(lines[j].replace(new RegExp(`^ {${indent + 2}}-\\s+`), "").trim()));
      j++;
    }
    out[key] = list;
    i = j - 1;
  }
  return out;
}

function parseScalarValue(value) {
  if (/^\d+$/.test(value)) return Number(value);
  if (value === "true") return true;
  if (value === "false") return false;
  return unquote(value);
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function section(body, heading) {
  const marker = `## ${heading}`;
  const start = body.indexOf(marker);
  if (start === -1) return "";
  const after = body.slice(start + marker.length).replace(/^\s+/, "");
  const end = after.search(/\n##\s+/);
  return (end === -1 ? after : after.slice(0, end)).trim();
}

export function oneLineTitle(finding) {
  const findingText = section(finding.body, "Finding");
  const first = findingText
    .split(/\n+/)
    .map((line) => line.trim())
    .find(Boolean) ?? "";
  return first
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\.$/, "")
    .slice(0, 140);
}

export function writeFindingFrontmatter(finding, updates) {
  const lines = finding.frontmatterRaw.split("\n");
  const setScalar = (key, value) => {
    const idx = lines.findIndex((line) => line.startsWith(`${key}:`));
    if (idx === -1) lines.push(`${key}: ${value}`);
    else lines[idx] = `${key}: ${value}`;
  };
  if (updates.status) setScalar("status", updates.status);
  if (updates.evidenceAppend) {
    const idx = lines.findIndex((line) => line === "evidence:");
    if (idx === -1) {
      lines.push("evidence:");
      lines.push(`  - ${updates.evidenceAppend}`);
    } else {
      let insertAt = idx + 1;
      while (insertAt < lines.length && /^  - /.test(lines[insertAt])) insertAt++;
      lines.splice(insertAt, 0, `  - ${updates.evidenceAppend}`);
    }
  }
  const next = `---\n${lines.join("\n")}\n---\n${finding.body}`;
  writeFileSync(finding.file, next);
}

export function markdownTable(rows, headers) {
  const escape = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  const widths = headers.map((header, idx) =>
    Math.max(header.length, ...rows.map((row) => escape(row[idx]).length)),
  );
  const line = (cells) => `| ${cells.map((cell, idx) => escape(cell).padEnd(widths[idx])).join(" | ")} |`;
  return [
    line(headers),
    `| ${widths.map((width) => "-".repeat(width)).join(" | ")} |`,
    ...rows.map(line),
  ].join("\n");
}
