const EVIDENCE_PACK_MAX_CHARS = 12000;
const MAX_CANONICAL_URLS = 8;
const INITIAL_MAX_ITEMS = 18;
const INITIAL_MAX_FACTS = 28;
const INITIAL_SUMMARY_CHARS = 520;
const MIN_SUMMARY_CHARS = 180;

function stripAnsi(value) {
  return String(value ?? "").replace(/\u001b\[[0-9;]*m/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value, maxChars) {
  const text = cleanText(value);
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 3))}...`;
}

function sanitizeUrl(raw) {
  if (!raw) return "";
  try {
    const url = new URL(String(raw));
    if (url.protocol !== "https:") return "";
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.href;
  } catch {
    return "";
  }
}

export function extractEvidenceTerms({ candidateAnswer = "", golden, graderNotes = "" }) {
  const text = `${candidateAnswer}\n${golden?.answer ?? ""}\n${(golden?.keyFacts ?? []).join("\n")}\n${(golden?.avoid ?? []).join("\n")}\n${graderNotes}`;
  const terms = [];

  for (const match of text.matchAll(/`([^`\n]{3,80})`/g)) terms.push(match[1]);
  for (const match of text.matchAll(/\b[a-z]+[A-Z][A-Za-z0-9_]{2,}\b/g)) terms.push(match[0]);
  for (const match of text.matchAll(/\b[A-Z][A-Za-z0-9]+(?:[- ][A-Z0-9][A-Za-z0-9]+){0,5}\b/g)) {
    const term = cleanText(match[0]);
    if (
      term.length >= 4 &&
      !/^(The|This|That|When|Where|Which|What|With|Source|Sources|Grade|Golden|Question|Candidate|Answer)$/i.test(term)
    ) {
      terms.push(term);
    }
  }
  for (const match of text.matchAll(/\b(?:status|asOf|source|url|amount|round|date|version|limit|summary|title|rank|count|window)\b/gi)) {
    terms.push(match[0]);
  }

  return unique(terms)
    .sort((a, b) => b.length - a.length || a.localeCompare(b))
    .slice(0, 90);
}

function shouldIncludeTranscriptEvidence(tags = {}) {
  return Boolean(tags.liveData || tags.freshness || tags.transcriptEvidence);
}

function executeEntries(transcript) {
  return (Array.isArray(transcript) ? transcript : []).filter(
    (entry) => String(entry.tool ?? "").endsWith("execute") && typeof entry.result === "string"
  );
}

function tryParseJsonPrefix(result) {
  const stripped = stripAnsi(result);
  const footerIndex = stripped.indexOf("\n--- TRUNCATED ---");
  const jsonText = footerIndex >= 0 ? stripped.slice(0, footerIndex) : stripped;
  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

function sourceTitle(value) {
  return cleanText(value?.title ?? value?.name ?? value?.label ?? value?.slug ?? "");
}

function sourceDate(value) {
  return cleanText(value?.date ?? value?.publishing_date ?? value?.created_at ?? value?.updated_at ?? value?.asOf ?? "");
}

function sourceSummary(value) {
  return cleanText(
    value?.summary ??
      value?.description ??
      value?.excerpt ??
      value?.snippet ??
      value?.contentSummary ??
      value?.text ??
      ""
  );
}

function maybeSourceItem(value, path, entryIndex) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const title = sourceTitle(value);
  const url = sanitizeUrl(value.url ?? value.sourceUrl ?? value.source ?? value.href);
  const summary = sourceSummary(value);
  const date = sourceDate(value);
  if (!title && !url && !summary) return null;
  if (!title && summary.length < 24) return null;
  return {
    title,
    url,
    date,
    summary,
    type: cleanText(value.type ?? value.kind ?? value.domain ?? value.channel ?? ""),
    fields: scalarFactsForObject(value),
    path,
    entryIndex
  };
}

function scalarFactsForObject(value) {
  const skip = new Set([
    "title",
    "name",
    "label",
    "slug",
    "url",
    "sourceUrl",
    "source",
    "href",
    "externalUrl",
    "githubUrl",
    "demoUrl",
    "videoUrl",
    "summary",
    "description",
    "excerpt",
    "snippet",
    "contentSummary",
    "text"
  ]);
  const facts = [];
  for (const [key, raw] of Object.entries(value)) {
    if (skip.has(key) || raw === null || raw === undefined || typeof raw === "object") continue;
    const rendered = cleanText(raw);
    if (!rendered || rendered.length > 100) continue;
    facts.push({ key, value: rendered, priority: scalarFieldPriority(key) });
  }
  return facts
    .sort((a, b) => b.priority - a.priority || a.key.localeCompare(b.key))
    .slice(0, 8)
    .map((fact) => `${fact.key}=${JSON.stringify(fact.value)}`);
}

function scalarFieldPriority(key) {
  return /rank|placement|winner|count|date|status|round|amount|total|source|award|prize/i.test(key) ? 2 : 1;
}

function walkSourceItems(value, path, entryIndex, out) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkSourceItems(item, `${path}[${index}]`, entryIndex, out));
    return;
  }
  const item = maybeSourceItem(value, path, entryIndex);
  if (item) out.push(item);
  for (const [key, child] of Object.entries(value)) {
    if (child && typeof child === "object") walkSourceItems(child, path ? `${path}.${key}` : key, entryIndex, out);
  }
}

function scanBalancedObjectAt(text, start) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === "\"") inString = false;
      continue;
    }
    if (ch === "\"") inString = true;
    else if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return "";
}

function scanSourceItemsFromText(result, entryIndex) {
  const text = stripAnsi(result);
  const out = [];
  const seenStarts = new Set();
  for (const marker of ["\"title\"", "\"name\""]) {
    let index = 0;
    while ((index = text.indexOf(marker, index)) >= 0) {
      const start = text.lastIndexOf("{", index);
      index += marker.length;
      if (start < 0 || seenStarts.has(start)) continue;
      seenStarts.add(start);
      const objectText = scanBalancedObjectAt(text, start);
      if (!objectText) continue;
      try {
        const parsed = JSON.parse(objectText);
        const item = maybeSourceItem(parsed, "visible-json-fragment", entryIndex);
        if (item) out.push(item);
      } catch {
        // Ignore partial/truncated fragments.
      }
    }
  }
  return out;
}

function dedupeItems(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = `${item.url || item.title}|${item.date}|${item.summary.slice(0, 80)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function termHits(text, terms) {
  const haystack = text.toLowerCase();
  const hits = [];
  for (const term of terms) {
    if (term.length < 3) continue;
    if (haystack.includes(term.toLowerCase())) hits.push(term);
  }
  return unique(hits);
}

function scoreItem(item, terms) {
  const titleHits = termHits(item.title, terms);
  const summaryHits = termHits(item.summary, terms);
  const metaHits = termHits(`${item.date} ${item.url} ${item.type}`, terms);
  return titleHits.length * 6 + summaryHits.length * 4 + metaHits.length + Math.min(2, Math.floor(item.summary.length / 240));
}

function rankedItems(items, terms) {
  return items
    .map((item, originalIndex) => ({
      ...item,
      originalIndex,
      score: scoreItem(item, terms),
      hits: termHits(`${item.title} ${item.summary} ${item.date} ${item.url}`, terms).slice(0, 8)
    }))
    .sort((a, b) => b.score - a.score || a.entryIndex - b.entryIndex || a.originalIndex - b.originalIndex);
}

function collectSourceItems(entries) {
  const items = [];
  entries.forEach((entry, entryIndex) => {
    const parsed = tryParseJsonPrefix(entry.result);
    if (parsed) walkSourceItems(parsed, "", entryIndex, items);
    for (const item of scanSourceItemsFromText(entry.result, entryIndex)) items.push(item);
  });
  return dedupeItems(items);
}

function collectRelevantFactsFromParsed(value, terms, path = "", out = []) {
  if (!value || typeof value !== "object") return out;
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectRelevantFactsFromParsed(item, terms, `${path}[${index}]`, out));
    return out;
  }
  for (const [key, raw] of Object.entries(value)) {
    const nextPath = path ? `${path}.${key}` : key;
    if (raw && typeof raw === "object") {
      collectRelevantFactsFromParsed(raw, terms, nextPath, out);
      continue;
    }
    if (raw === undefined) continue;
    const rendered = cleanText(raw);
    if (!rendered || rendered.length > 120) continue;
    const score = termHits(`${key} ${rendered}`, terms).length + (scalarFieldPriority(key) > 1 ? 1 : 0);
    if (score > 0) out.push({ path: nextPath, value: rendered, score });
  }
  return out;
}

function collectRelevantFacts(entries, terms) {
  const facts = [];
  entries.forEach((entry, entryIndex) => {
    const parsed = tryParseJsonPrefix(entry.result);
    if (!parsed) return;
    for (const fact of collectRelevantFactsFromParsed(parsed, terms)) facts.push({ ...fact, entryIndex });
  });
  const seen = new Set();
  return facts
    .sort((a, b) => b.score - a.score || a.entryIndex - b.entryIndex || a.path.localeCompare(b.path))
    .filter((fact) => {
      const key = `${fact.path}=${fact.value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function shapeLine(entries, sourceCount) {
  const totalChars = entries.reduce((sum, entry) => sum + (entry.resultChars ?? String(entry.result ?? "").length), 0);
  const truncated = entries.filter((entry) => String(entry.result ?? "").includes("--- TRUNCATED ---")).length;
  const errored = entries.filter((entry) => entry.isError || /^Execution failed:/i.test(String(entry.result ?? ""))).length;
  return `executeResults=${entries.length}; resultChars=${totalChars}; truncated=${truncated}; errors=${errored}; sourceItems=${sourceCount}`;
}

function callsLine(entries) {
  if (!entries.length) return "none";
  return entries
    .map((entry, index) => {
      const chars = entry.resultChars ?? String(entry.result ?? "").length;
      const outcome = entry.isError || /^Execution failed:/i.test(String(entry.result ?? "")) ? "error" : "ok";
      return `execute#${index + 1}=${outcome}/${chars} chars`;
    })
    .join("; ");
}

function canonicalUrlsLine(items, limit) {
  const urls = unique(items.map((item) => item.url)).slice(0, limit);
  if (!urls.length) return "none (data-derived/untrusted; https-only after sanitization)";
  return `data-derived/untrusted; ${urls.join("; ")}${items.filter((item) => item.url).length > urls.length ? ` (+${items.filter((item) => item.url).length - urls.length} more)` : ""}`;
}

function truncationLine(entries) {
  const footers = [];
  for (const [index, entry] of entries.entries()) {
    const result = stripAnsi(entry.result);
    const footerIndex = result.indexOf("--- TRUNCATED ---");
    if (footerIndex >= 0) footers.push(`execute#${index + 1}: ${truncate(result.slice(footerIndex), 360)}`);
  }
  return footers.join(" | ");
}

function serializePack({ entries, ranked, facts, itemLimit, factLimit, summaryChars, urlLimit }) {
  const shown = ranked.slice(0, itemLimit);
  const shownFacts = facts.slice(0, factLimit);
  const lines = [
    "--- TRANSCRIPT SOURCE BASIS ---",
    `shape: ${shapeLine(entries, ranked.length)}`,
    `calls: ${callsLine(entries)}`,
    `canonicalUrls: ${canonicalUrlsLine(ranked, urlLimit)}`,
    `fields: ${shownFacts.length ? shownFacts.map((fact) => `${truncate(fact.path, 90)}=${JSON.stringify(truncate(fact.value, 80))}`).join("; ") : "none"}`,
    "sourceItems: data-derived/untrusted; ranked by overlap with candidate/golden terms; omitted fields are not proof of absence"
  ];
  if (!shown.length) {
    lines.push("- none extracted");
  } else {
    shown.forEach((item, index) => {
      const meta = [
        `title="${truncate(item.title || "(untitled)", 140)}"`,
        item.date ? `date="${truncate(item.date, 40)}"` : "",
        item.url ? `url="${truncate(item.url, 180)}"` : "",
        item.type ? `type="${truncate(item.type, 40)}"` : "",
        item.fields.length ? `fields="${truncate(item.fields.join(", "), 180)}"` : "",
        item.hits.length ? `matched="${truncate(item.hits.join(", "), 180)}"` : ""
      ]
        .filter(Boolean)
        .join(" ");
      lines.push(`${index + 1}. ${meta}`);
      if (item.summary) lines.push(`   summary: ${truncate(item.summary, summaryChars)}`);
    });
  }
  const truncation = truncationLine(entries);
  if (truncation) lines.push(`truncation: ${truncation}`);
  return lines.join("\n");
}

export function buildTranscriptEvidencePack({
  transcript = [],
  candidateAnswer = "",
  golden,
  tags,
  graderNotes = "",
  maxChars = EVIDENCE_PACK_MAX_CHARS
}) {
  if (!shouldIncludeTranscriptEvidence(tags)) return "";
  const entries = executeEntries(transcript);
  if (!entries.length) return "";

  const terms = extractEvidenceTerms({ candidateAnswer, golden, graderNotes });
  const items = collectSourceItems(entries);
  const ranked = rankedItems(items, terms);
  const facts = collectRelevantFacts(entries, terms);

  let itemLimit = Math.min(ranked.length, INITIAL_MAX_ITEMS);
  let factLimit = Math.min(facts.length, INITIAL_MAX_FACTS);
  let summaryChars = INITIAL_SUMMARY_CHARS;
  let urlLimit = MAX_CANONICAL_URLS;
  for (;;) {
    const text = serializePack({ entries, ranked, facts, itemLimit, factLimit, summaryChars, urlLimit });
    if (text.length <= maxChars) return text;
    if (itemLimit > 4) {
      itemLimit -= 1;
      continue;
    }
    if (factLimit > 0) {
      factLimit -= 1;
      continue;
    }
    if (summaryChars > MIN_SUMMARY_CHARS) {
      summaryChars = Math.max(MIN_SUMMARY_CHARS, summaryChars - 80);
      continue;
    }
    if (urlLimit > 0) {
      urlLimit -= 1;
      continue;
    }
    return text.length <= maxChars ? text : `${text.slice(0, Math.max(0, maxChars - 3))}...`;
  }
}

export { EVIDENCE_PACK_MAX_CHARS };
