# codemode.skill.run — full design (2026-07-06, Solo todo 806)

**Supersedes the 2026-07-03 design round** that lived at this path (decision then: *do not
build now*, with reopen triggers). This document is the build-ready design: every contract,
schema, and file touch is settled below; an implementer should never have to guess. Two
independent adversarial reviews (2026-07-06) are incorporated inline — this doc is the
post-review final, not a draft plus caveats (§15 records the review disposition). The build
itself remains gated on the eval instrument in §10 — "ship only with an eval" is the todo's
own rule and it stands.

What changed since 2026-07-03, honestly stated:

- **Current status (2026-07-08):** the dossier runner described in the original v1 design was
  retired after the §10 adoption follow-up. The digest runner is the sole runnable skill today;
  the dossier material below is kept as the historical design and retirement record.
- **The 07-03 Q1 finding stands and is kept**: no mirrored skill body is a program. Zero of
  the 43 bundled files contain a parameterized `async (input) => {...}` over the service
  globals. v1 runners are therefore **not** compiled from prose — they are repo-authored
  TypeScript modules that mechanize the *data-gathering core* of two playbooks whose
  judgment steps stay with the model (via `skill.read`, unchanged).
- **Trigger 1 evidence accumulated**: the eval corpus repeatedly asks the same two
  composition shapes. Dossier-shaped (project + SCF history + coverage): at least 8 QA
  cases (`q-defi-blend-scf-funding`, `q-scf-history-blend`, `q-defi-soroswap-scf`,
  `q-scf-history-soroswap`, `q-defi-phoenix-scf`, `q-eco-hana-wallet-scf`, plus the
  fabrication trap `q-edge-noinfo-fake-project-quasarswap`); digest-shaped:
  `q-edge-fresh-most-recent-news` and the live-data lane's freshness questions. The
  dossier/digest skills themselves define exact pipelines over already-exposed free ops —
  the composition is being re-derived per run instead of promoted once.
- **The "grown, not authored" objection is answered by our own upstream research**:
  research/codemode.md §9 item 4 — "Unlike Cloudflare's grown-not-authored snippets, ours
  are authored — that's fine; the runtime mechanism is identical." Upstream's
  `codemode.run(name)` executes runtime-saved snippets from a DO; our server is stateless,
  so the equivalent is build-time repo artifacts. Mirrors upstream's mechanism
  (`node_modules/@cloudflare/codemode/docs/runtime.md`: run appears beside search/describe;
  snippets appear in search results; describe targets them), deviates on storage with
  conviction (statelessness is a settled architecture decision, PLAN §8).
- **The Q3 policy question gained a codified prerequisite** (CLAUDE.md, todo 845 item 3):
  request-context plumbing before ANY side-effecting or paid op ships. §7 shows v1 never
  reaches it for manifest reasons, and binds any future runner that would.

Decision summary:

| Question | Decision |
|---|---|
| Runner form | Build-time TS modules `src/skills/runners/<name>.ts`, host-executed, adapter-tier trusted code fed only an ops facade narrowed to declared ops (§2, §7) |
| v1 allowlist | Historical design: 2 runners. Current surface: `skills.lumenloop.stellar-ecosystem-digest` only (§10 postscript) |
| Catalog exposure | `runnable: true` flag + real `inputSchema`/`outputSchema` on the EXISTING skill entry — a deliberate contract broadening, not a new kind (§5) |
| Dispatch | `codemode.skill.run(name, input)` → provider `skill_run` fn → host `runSkill` (§6) |
| Envelope | The service-call envelope `{ ok, data } \| { ok, error }`; the `calls` audit trail is host-recorded, never runner-authored (§6) |
| Policy | Manifest-only ops are structural (facade built from emitted entries, narrowed per runner); no-fetch is review + drift belts, stated honestly (§7) |
| Eval | 6-case `--ids` before/after QA A/B + 2 live-lane digest cases + routing rank/membership identity (ranked-id diff + banded gate backstop) + a small committed composition/adoption analyzer (§10) |

---

## 1. What ships (v1 surface)

Inside `execute`, next to `codemode.skill.read`:

```js
const r = await codemode.skill.run("skills.lumenloop.stellar-ecosystem-digest", { since: "2026-07-01" });
// r = { ok: true, data: StellarEcosystemDigestOutput } | { ok: false, error: { kind, message, hint? } }
```

- `name` is an exact catalog id of a skill entry carrying `runnable: true`. Exact-match
  discipline end to end: unknown names fail with an error that names the valid runnable ids
  (a tiny set — list them all) plus the store's nearest-id *suggestion* (never a
  resolution).
- `input` is validated host-side against the entry's `inputSchema` via the same
  `guard`/`validateArgs` path operations use — model code never owns the contract. Note:
  schema `default` values are documentation only — `validateArgs` deliberately ignores
  annotation keywords and `guard()` never injects defaults; each runner materializes its
  own defaults at the top of `run()` (unit-tested per runner, §12).
- The result rides the **service-call envelope**, not `skill.read`'s top-level shape, and
  passes through `__guardEnvelope` in the prelude so `.data`-level misuse traps behave
  identically to every operation call.
- Search hits and `codemode.describe` for a runnable skill render a **callable signature**
  (input/output TS types + the exact `codemode.skill.run(...)` line), exactly as operation
  hits do. `skill.read` on the same id is unchanged — the prose playbook (judgment steps,
  templates, citation rules) remains readable; run mechanizes only the fetch-and-project
  core.

Not in v1 (each with the reopen condition):

- **No runner may call skill.read or other runners** — runners get the ops facade only.
  Revisit only with a concrete runner that needs it; nesting adds a recursion/audit surface
  for zero current demand.
- **No metered/paid or side-effecting composition** — impossible today at the manifest
  level (§7); any future one requires the CLAUDE.md request-context plumbing first.
- **No runtime-saved snippets** (upstream's `saveSnippet`) — requires a DO; contradicts the
  stateless architecture. Revisit only if the server ever adopts `McpAgent`.

## 2. Runner architecture — host-side, facade-fed, honestly trusted

**Where runners execute: host-side, in the Worker, not in an isolate.** The isolate exists
to contain *model-authored* code. Runners are first-party, reviewed, repo-committed
TypeScript — **the same trust tier as `src/adapters/*`**, and the design says so plainly
rather than claiming a sandbox that isn't there (see the confinement statement below).
Executing them host-side avoids a second billable Dynamic Worker per run and any
source-injection machinery. This deviates from upstream (snippets run in the sandbox) with
conviction: upstream snippets are model-promoted strings and *need* the isolate; ours are
compiled into the Worker bundle.

**Timeout**: `runSkill` wraps `runner.run` in a `Promise.race` against a host-side
deadline (`RUNNER_DEADLINE_MS = 30_000`) that returns a timeout error envelope on expiry —
generous for ≤ 6 statically bounded free calls, and it removes any dependence on whether
the outer executor's 60 s wall clock covers host dispatch time in `@cloudflare/codemode`
0.4.2 (unverified; the outer timeout remains the hard stop either way). On a deadline loss
the runner's in-flight facade calls continue detached until the request context ends —
harmless (free read-only ops, each still logging its own `op` event) but stated so nobody
mistakes the race for cancellation.

**What the confinement is — and is not.** Three properties, each with its real
enforcement, not conflated:

1. **Manifest-only ops — structural.** The facade is built FROM the manifest: one fn per
   emitted operation entry, each the guard → `callService` → `logEvent` → `redactSecrets`
   closure `buildProviders` uses (built once by the shared `buildOpsFns`, §11). A paid or
   excluded op has no entry, therefore no facade fn, therefore cannot be called — same
   ADR-0003 property, same choke point. Further narrowed per runner: `runSkill` hands each
   runner a **sub-facade containing only its declared `ops`** (below), so even an exposed
   op a runner never declared fails loudly in tests.
2. **No env/secrets — structural.** Module Workers have no ambient global `env`; env
   reaches code only as a parameter, and `runSkill` never passes it. Runners receive
   exactly `(input, ops)`.
3. **No network besides the facade — NOT structural.** Runners execute host-side where
   `globalThis.fetch` is live; `globalOutbound: null` confines the *isolate* only
   (src/executor/run.ts). The rule "runners use only the facade" is enforced by
   first-party review at the adapter trust tier, backed by two **drift belts** (belts, not
   boundaries): (a) the §12 token lint — import specifiers ⊆ `{"./types.ts"}` (a stated
   consequence: **no helper modules**; each runner is self-contained) and no `fetch(`,
   `env.`, `process.`, `import(`, `globalThis`, `self.`, `Reflect` tokens; (b) a
   **behavioral CI test** that invokes every runner with `globalThis.fetch` stubbed to
   throw and a stub facade, so a smuggled network call fails CI at runtime, not just
   lexically.

```
sandbox: codemode.skill.run(name, input)
  │ provider RPC (the skill_read mechanism, research/codemode.md §"platform global")
  ▼
host: skill_run fn (providers.ts)
  ├─ exact-match resolve name → runnable skill entry   (fail-loud, names valid runnables)
  ├─ guard(entry, input)                               (validateArgs, same as ops)
  ├─ registry[name].run(input, recordingSubFacade)     (declared ops only; host ledger
  │     └─ each ops.* call = the SAME wrapped fn        records { op, ok, errorKind, ms })
  ├─ Promise.race vs RUNNER_DEADLINE_MS                (timeout → error envelope)
  ├─ outputSchema warn-belt → attach `calls` (ledger)  (§6)
  ├─ redactSecrets(aggregate)                          (belt; constituents already redacted)
  └─ logEvent("skill_run", …counts from ledger) → envelope back across the RPC
```

**Runner module contract** (`src/skills/runners/types.ts`):

```ts
export type OpsFacade = Record<string, Record<string, (args?: unknown) => Promise<AdapterResult>>>;
export type SkillRunner = {
  /** Exact catalog operation ids this runner may call — allowlist-as-data for the
   *  sub-facade, the build-time drift guard (§5), the plan grader, and the live-drift
   *  classifier. A call to an undeclared op has no facade fn and fails loudly. */
  ops: string[];
  /** JSON Schema (the bounded validate.ts dialect — §4 note) for skill.run input. */
  inputSchema: Record<string, unknown>;
  /** JSON Schema for the `data` payload; contract + test oracle + signature source.
   *  Declares `calls`, but runners never author it — runSkill attaches it (§6). */
  outputSchema: Record<string, unknown>;
  run(input: Record<string, unknown>, ops: OpsFacade): Promise<unknown>;
};
```

`src/skills/runners/index.ts` exports `RUNNERS: Record<string, SkillRunner>` keyed by exact
catalog skill id. **That registry is the allowlist-as-data** the todo asks for: build-time,
exact-match, one source consumed by the emitters (§5), the runtime dispatch (§6), and the
eval instruments (§10), with fail-loud drift guards pinning it to the manifest in both
directions — including each runner's declared `ops`. It lives beside the runners rather
than in `scripts/exposure.mjs` because exposure.mjs holds *exclusions* (things never
emitted); runnability is an inclusion feature whose source of truth must sit with the
schemas and code it describes. Runner modules must stay importable under plain `node` type
stripping (no `cloudflare:workers`, `.ts`-suffixed relative imports) — the builder and the
eval analyzer import them the same way build-catalog.mjs already imports
`src/catalog/extract-keywords.ts`.

**Runners never throw toward the dispatcher for expected conditions** — ambiguity,
soft-empty anchors, constituent errors are all data (§6). A thrown exception is a runner
bug: `skill_run` catches it and returns `{ ok: false, error: { service: "skills", kind:
"error", message } }` (mirroring `caughtResult`), never a sandbox exception.

## 3. Why these two runners

Selection rule: strongest evidence of repeated agent demand + composition entirely over
already-exposed free ops + output that compacts well. Both hold:

- **Dossier** — 8+ QA cases are literally "profile project X / its SCF history" (§ header
  list). The playbook (`skills.lumenloop.stellar-project-dossier`) declares a 7-step
  pipeline; steps 1–4 + 6 are mechanical fetch-and-project; steps 5 (pull-quote selection)
  and 7 (optional connections) are judgment/optional and stay with the model.
- **Digest** — "what's new in X" questions recur in the main battery and the live lane, and
  the digest playbook's passes 1–2/3/5 are mechanical (window math, mode routing, dedup,
  projection); passes 4 and 6 (quotes, expansion) stay with the model.

Every op either runner touches is free and exposed today (all 50 manifest ops are — the
paid lane is never emitted). This is not asserted in prose per-runner: each runner's
declared `ops` list is verified against the emitted manifest at build time (§5), so an
upstream retirement of a constituent op **breaks the build**, never surfaces as a runtime
TypeError dressed up as a runner bug.

## 4. The two v1 runners — exact contracts

Schema authoring constraint: `src/policy/validate.ts` implements a **bounded dialect**
(type/properties/required/additionalProperties/enum/min-max/minLength-maxLength/
minItems-maxItems/pattern/items). Runner inputSchemas MUST stay inside it — no `oneOf`,
no `$ref`. Both schemas below do. All input schemas set `additionalProperties: false`
(unknown keys refused, never ignored — the skill.read options lesson). **Defaults**: the
`default` keyword below is documentation for the model; `validateArgs` ignores it and the
pipeline never injects it — each `run()` applies its defaults in its first lines, and §12
tests assert exactly that per runner.

### 4.1 `skills.lumenloop.stellar-project-dossier`

**Declared ops**: `lumenloop.get_project`, `lumenloop.search_directory`,
`lumenloop.get_scf_submissions`, `lumenloop.find_content_about_project`,
`lumenloop.find_similar_projects_semantic`.

**inputSchema**

```jsonc
{
  "type": "object",
  "additionalProperties": false,
  "required": ["project"],
  "properties": {
    "project":      { "type": "string", "minLength": 1,
                      "description": "Project name or directory slug (e.g. \"blend\", \"LOBSTR\")." },
    "contentLimit": { "type": "integer", "minimum": 1, "maximum": 20, "default": 8,
                      "description": "Max coverage items per content type." },
    "similarLimit": { "type": "integer", "minimum": 1, "maximum": 10, "default": 5 }
  }
}
```

**Pipeline** (≤ 6 constituent calls):

1. **Slug resolution — exact-match, never fuzzy.** If `project` matches
   `/^[a-z0-9][a-z0-9-]*$/`, try `lumenloop.get_project({ slug: project, compact: true })`
   first; success ⇒ `resolvedBy: "input-slug"`. Otherwise (or on failure)
   `lumenloop.search_directory({ query: project, limit: 5 })`, then: a hit whose `slug`
   equals the input (case-insensitive) ⇒ `"exact-slug"`; else a hit whose `title` equals
   the input case-insensitively ⇒ `"exact-title"`; else exactly one hit ⇒ `"single-hit"`;
   else **multiple hits** ⇒ the run fails as data:
   `{ ok: false, error: { service: "skills", kind: "error", message: 'ambiguous project
   "<input>" — pass the exact slug', hint: 'candidates (none matches "<input>" exactly):
   <slug — title; …>. If none of these IS the project, do not substitute a
   similar-sounding one — absence from the LumenLoop directory is not evidence the
   project does not exist.' } }` (fail-with-list, same style as store.ts's
   unknown-section error). **Zero hits** ⇒
   `{ ok: false, error: { kind: "soft-empty", message: 'no directory project matched
   "<input>"', hint: 'absence from the LumenLoop directory is not evidence the project
   does not exist — try alternate names via lumenloop.search_directory' } }`.
   **Fabrication-trap reality (2026-07-06 live verification)**: live
   `lumenloop.search_directory` fuzzy-matches almost any string, so a nonexistent
   project name (`q-edge-noinfo-fake-project-quasarswap`) usually takes the AMBIGUITY
   branch, not the zero-hit rung — the zero-hit rung fires when upstream itself
   soft-empties. Both branches are therefore honesty paths: the ambiguity hint carries
   the same absence-is-not-evidence framing (no candidate is exact by construction —
   the exact rungs run first) and explicitly forbids resolving to a similar-sounding
   candidate, so the trap case never gets an invitation to build a wrong-project
   dossier one retry away.
2. **Parallel fan-out** (`Promise.all`; no replay machinery exists, so this is safe):
   - `lumenloop.get_project({ slug })` (skipped if step 1 already fetched it full — the
     slug-direct probe uses `compact: true`, so a full fetch still runs; one extra call,
     simpler than dual-shape handling)
   - `lumenloop.get_scf_submissions({ slug })`
   - `lumenloop.find_content_about_project({ slug, limit: contentLimit, types:
     ["articles","av","events","research"], response_format: "concise" })`
   - `lumenloop.find_similar_projects_semantic({ slug, limit: similarLimit })`

**outputSchema** (the `data` payload; prose form — the JSON Schema in the module spells it
out field-for-field):

```ts
type StellarProjectDossierOutput = {
  slug: string;
  resolvedBy: "input-slug" | "exact-slug" | "exact-title" | "single-hit";
  // Each section: null ⇔ its constituent call ERRORED (see calls);
  // softEmpty: true ⇔ the call answered with nothing (a finding, not a failure).
  profile: {
    title: string; category: string; tags: string[];
    basedIn: string | null; operatingRegion: string | null;
    links: Record<string, string>;           // website/twitter/… as the row carries them
    description: string;                     // truncated ≤ 400 chars
  } | null;
  scf: { count: number; softEmpty: boolean;
         submissions: { round: string; awardType: string | null; title: string;
                        status: string | null }[] } | null;   // ≤ 10 rows
  content: { softEmpty: boolean;
             items: { type: "articles" | "av" | "events" | "research";
                      title: string; url: string; date: string | null;
                      summary: string }[] } | null;           // summary ≤ 200 chars
  similar: { softEmpty: boolean;
             items: { slug: string; title: string; category: string }[] } | null;
  calls: { op: string; ok: boolean; errorKind?: "error" | "soft-empty"; ms: number }[];
  //   ^ attached by runSkill from the host call ledger (§6) — the runner never authors it.
};
```

`ok: true` iff slug resolution succeeded AND `get_project` succeeded (the anchor). All
other constituent failures degrade per-section. Upstream `text` convenience fields and
`long_summary` are always dropped — projection is counts + selected fields, never payload
concatenation. Worst-case size ≈ 1.5–2.5k tokens at default limits, comfortably under the
~6k model boundary.

### 4.2 `skills.lumenloop.stellar-ecosystem-digest`

**Declared ops**: `lumenloop.search_content_semantic`, `lumenloop.list_documents`,
`lumenloop.find_content_by_entity`.

**inputSchema**

```jsonc
{
  "type": "object",
  "additionalProperties": false,
  "required": ["subject"],
  "properties": {
    "subject":      { "type": "string", "minLength": 1,
                      "description": "Theme phrase (\"RWA tokenization\") or entity name (\"Soroswap\")." },
    "subjectType":  { "type": "string", "enum": ["theme", "entity"], "default": "theme",
                      "description": "theme = semantic search over content; entity = entity-mention lookup." },
    "days":         { "type": "integer", "minimum": 1, "maximum": 90, "default": 30 },
    "perTypeLimit": { "type": "integer", "minimum": 1, "maximum": 10, "default": 5 }
  }
}
```

**Pipeline** (≤ 2 constituent calls). `dateEnd` = host `new Date()` (UTC, `YYYY-MM-DD`),
`dateStart` = dateEnd − days; both go into the output so answers carry as-of framing (the
live-lane grading expectation).

- theme: `lumenloop.search_content_semantic({ query: subject, date_start, date_end,
  types: ["articles","av","events","research"], limit: perTypeLimit,
  response_format: "concise" })` **plus** `lumenloop.list_documents({ collection: "events",
  period: "upcoming", limit: 5 })`.
- entity: `lumenloop.find_content_by_entity({ entity: subject, date_start, date_end,
  limit: perTypeLimit })` only (a generic upcoming-events list is off-subject noise for an
  entity digest).

**outputSchema** (prose form):

```ts
type StellarEcosystemDigestOutput = {
  subject: string; subjectType: "theme" | "entity";
  window: { dateStart: string; dateEnd: string };   // as-of framing, always present
  // Flat, url/id-deduped, date-desc; shape-stable across both modes.
  items: { type: "articles" | "av" | "events" | "research";
           title: string; url: string; date: string | null;
           summary: string }[] | null;              // summary ≤ 200 chars; null ⇔ call errored
  counts: { articles: number; av: number; events: number; research: number };
  softEmpty: boolean;                                // true ⇔ window matched nothing
  upcomingEvents: { title: string; url: string; startAt: string | null }[] | null;
  //   theme mode: null ⇔ that call errored; entity mode: always null (not attempted)
  calls: { op: string; ok: boolean; errorKind?: "error" | "soft-empty"; ms: number }[];
  //   ^ attached by runSkill from the host call ledger (§6) — the runner never authors it.
};
```

`ok: true` iff the primary content call succeeded or soft-emptied (soft-empty digest is a
legitimate "quiet window" answer with `softEmpty: true`, `items: []`); `ok: false` only
when it errored. An unexpected upstream payload shape (defensive projection finds none of
the expected keys) is treated as that call erroring: section null + ledger entry — the
runner never guesses fields. Because self-authored schemas only prove the projection
matches itself, upstream shape drift is covered separately: live smoke (§12) exercises both
runners against production, projection fixtures are captured from live responses, and the
live-drift skill re-verifies runner projections whenever drift touches a declared op (§11
item 17).

## 5. Catalog exposure — flag on the skill entry, not a new kind

Decision: **`runnable: true` + populated `inputSchema`/`outputSchema` on the existing
`kind: "skill"` entry.** The alternative (a new `CATALOG_KINDS` member, upstream's
`"snippet"` or `"runnable-skill"`, as a *separate entry*) is rejected because catalog ids
are globally unique — a second entry would need a second id for the same skill, recreating
exactly the twin-identity problem ADR-0002/0003 killed (`lumenloop.skill.*`). One skill,
one id, two affordances (read + run).

**This is a contract broadening, stated as such.** Today the catalog contract says skill
entries carry `inputSchema: null` (the `src/catalog/types.ts` doc comment calls schemas
operations-only, and `buildSkills` always emits null). Making two skills callable changes
that sentence and the mental model — "skills are prose" becomes "skills are prose; a
declared few are also callable" — and touches `renderSignature`, `describe`,
`catalogEntryView`, the super-spec, the type docs, and their tests (§11 rows 6, 8–11).
The framing "additive optional field" is true at the zod level only; the design owns the
full blast radius. Weighing the orchestration levers explicitly:

- **Search filters**: `kind: "skill"` keeps matching; no new filter value to teach; the
  frozen `searchCatalog` contract is untouched (`SearchHit.signature` is already optional
  and typed loosely — populating it for runnable skills is additive, same precedent as
  `tier`; its doc comment drops "operation entries only").
- **Kind weighting (scoring lever 2)**: a runnable skill ranks exactly as its skill entry
  does today — full weight (only `skill-section` is damped 0.75). The scorer reads
  id/name/service/kind/description/keywords; **none of those change**, so **ranking and
  membership are unchanged by construction**. Hit *bytes* are NOT identical: runnable-skill
  hits gain `signature`, deliberately — the callable line in search hits is the adoption
  surface §10 depends on. The precise invariant, which §10 proves directly: per-case
  rank/membership identity, plus byte-identity of every pre-existing field; the added
  `signature` on the two runnable entries is the only permitted delta.
- **renderSignature**: gains one branch — `entry.inputSchema && (kind === "operation" ||
  entry.runnable)`; for runnable skills the callable line is
  `codemode.skill.run("<id>", input: <T>Input): Promise<{ ok: true, data: <T>Output } |
  { ok: false, error: … }>` (type base from `toPascalCase(sanitizeToolName(lastIdSegment))`
  as ever). Search hits use compact mode; describe renders full — same split as operations.
- **providers.ts**: `catalogEntryView` adds `runnable` (so `codemode.catalog()` greps see
  it); `describe` on a runnable skill returns the full signature + both schemas + a `usage`
  line naming BOTH calls ("run it via codemode.skill.run(id, input); read the playbook via
  codemode.skill.read(id, { sections })") + `availableSections` as before.
- **Super-spec emitter**: one new path `/skills/run_skill` (POST), operationId
  `skills.run_skill`, requestBody `{ name: enum [the runnable ids], input: object }`,
  `x-execute: await codemode.skill.run(name, input)`, and `x-runnable-index:
  [{ id, description, inputSchema, outputSchema }]` — same self-contained-index pattern as
  `/skills/list_skills`' `x-skill-index`. Emitted from the same `RUNNERS` registry the
  catalog build consumes, so the two surfaces cannot drift.

**Schema change** (`src/catalog/types.ts`): `runnable: z.literal(true).optional()` on
`catalogEntrySchema`, plus the doc-comment update above. Load-time refinements added to
`refinedCatalogSchema`: a `runnable` entry must have `kind === "skill"` and non-null
`inputSchema` AND `outputSchema`. Manifest `version` stays 1 (additive at the parser
level; forward-only consumers are our own).

**Build attachment** (`scripts/build-catalog.mjs`): import `RUNNERS` from
`src/skills/runners/index.ts`; after `buildSkills`, for each registry key find the emitted
skill entry and attach `runnable: true, inputSchema, outputSchema`. Drift guards, fail-loud
in every direction:

- a registry key with no emitted skill entry (renamed/retired skill) **throws** — mirrors
  `assertRetirementNamesResolve`;
- **every id in every runner's `ops` must resolve to an emitted operation entry** —
  **throws** otherwise (mirrors `assertLumenloopExclusionsResolve`). This is the guard
  that turns an upstream constituent-op retirement (e.g. the daily live-drift refresh
  dropping `lumenloop.find_similar_projects_semantic`) into a build failure instead of a
  runtime `TypeError` disguised as a generic runner-bug envelope;
- `assertNoNonExposedRefs` extends its guarded text to include
  `JSON.stringify(inputSchema) + JSON.stringify(outputSchema)` for runnable entries —
  schema `description` strings are emitted text and must not name non-exposed ops either.
  The declared `ops` lists give it (and the live-drift classifier) a machine-checkable op
  set rather than schema-description prose alone;
- runtime side (§6): `assertRunnersWired` at provider build checks registry⊆manifest AND
  manifest-runnable⊆registry AND **deep schema equality per id** (`JSON.stringify`
  comparison of both schemas — generated data, so string equality suffices) AND declared
  `ops` ⊆ manifest operation ids. The schema equality check is the point: id-set equality
  alone would let a stale `catalog/manifest.json` validate input against a DIFFERENT
  schema than the bundled runner expects (widened registry field + stale manifest =
  spurious refusals; narrowed = unvalidated shapes reaching `run()`). Any mismatch fails
  the first execute loudly, not silently.

`scripts/bundle-skills.mjs` is untouched (runner code is Worker source, not skill body).

## 6. Dispatch, naming, envelope, partial failure

**Sandbox side** — SKILL_PRELUDE grows one sibling of `read`:

```js
codemode.skill.run = async (name, input) => {
  const raw = await codemode.skill_run(name, input);
  return typeof __guardEnvelope === "function" ? __guardEnvelope(raw, "codemode.skill.run") : raw;
};
```

No `.data`-trap inversion here — unlike `skill.read`, run RETURNS the service envelope, so
`__guardEnvelope` plants exactly the right traps (ok:true payload-key traps; ok:false
warn-once `.data`). Same `typeof` fallback for operation-less test catalogs.

**Host side** — `skill_run` fn on the codemode provider delegates to
`runSkill(catalog, registry, facade, name, input)` in a new `src/skills/run.ts` (store.ts
stays read-only concerns; its private `nearestSkillId` is exported for reuse here — §11
row 9). Resolution ladder, every rung an envelope, nothing throws:

1. `name` not a non-empty string → error (mirror readSkill's message shape).
2. Exact id lookup. Miss → error: `unknown runnable skill "<name>" — runnable ids
   (exact-match): <id1>, <id2>` + the nearest-id *suggestion* computed over runnable
   entries only (the exported store helper, filtered to `entry.runnable`). Listing the
   full runnable set is ADR-0003-clean — every listed id is exposed.
3. Entry exists but not runnable (a prose skill, an operation, a section id) → error:
   `"<id>" is not runnable — runnable skills: <list>; to read a skill use
   codemode.skill.read`.
4. `guard(entry, input)` — invalid input returns the standard invalid-arguments envelope
   with `validateArgs` issues (identical UX to operation misuse).
5. Registry lookup by the same exact id. Missing despite `runnable: true` = build bug →
   error naming the rebuild (mirror of readSkill's missing-bundle message); unreachable
   once the §5 startup assertion is in, kept as belt.
6. **Build the per-run recording sub-facade**: for each id in `runner.ops`, wrap the
   shared facade closure so every invocation appends `{ op, ok, errorKind?, ms }` to a
   host-owned ledger before returning the untouched envelope. Then
   `await Promise.race([runner.run(input, subFacade), deadline(RUNNER_DEADLINE_MS)])`
   inside try/catch (runner throw → `caughtResult`-style error envelope; deadline →
   timeout error envelope, in-flight work orphaned per §2). On a data result:
   `validateArgs(runner.outputSchema, data)` as a **warn-only belt** — a mismatch logs and
   sets `outputSchemaOk: false` on the `skill_run` event but does not fail the run (the
   defensive projection half-handling an upstream shape change must surface in telemetry,
   not ship silently under the advertised type) — then **attach `calls` from the ledger**
   (overwriting any runner-set key unconditionally), `redactSecrets(…)` belt,
   `{ ok: true, data }`.

**The audit trail is host-owned** — the house principle extended: model code never owns
endpoints; runner code never owns the audit trail. Because `calls`, the `skill_run` event
counts (§8), and the error-path attribution all come from the runSkill ledger, a buggy
runner that swallows a constituent error can still project a section wrongly
(test-covered, §12), but it can never make a failed call disappear from the report or the
telemetry, and it cannot corroborate its own lie.

**Envelope decision, stated once**: `skill.run` is a *call* (it returns composed data), so
it uses the call envelope. `skill.read` is *content retrieval* and keeps its top-level
shape. The rendered signature, the envelope guard, and the describe `usage` line all say
the same thing, so there is no third shape to teach.

**Partial-failure semantics** (the "2 of 4 fail" contract, uniform across runners):

- Constituent calls NEVER fail the run by themselves. Each output carries `calls:
  [{ op, ok, errorKind?, ms }]` — host-recorded (above); op is the exact catalog id;
  errorKind is the two-way `error | soft-empty`; message/hint/details are deliberately
  dropped from the aggregate (compactness; the constituent already logged its own `op`
  event with the outcome).
- A section whose call returned `kind: "error"` is `null`. A section whose call
  soft-emptied is **present** with `softEmpty: true` and empty items — the run preserves
  the repo's three-way data ≠ soft-empty ≠ error distinction in aggregate form.
- Only the runner's declared **anchor** failing makes the run `ok: false` (dossier:
  resolution/get_project; digest: the primary content call erroring). The anchor error's
  kind propagates (`soft-empty` for zero-hit resolution — see §4.1), `error.service` is
  `"skills"`, and `error.details` carries the ledger's `calls` array so the failure is
  still fully attributed.

## 7. Policy inheritance (Q3) — what is structural, what is trust

- **Structural (manifest exposure)**: the facade is built FROM the manifest — one fn per
  emitted operation entry, each the guard → adapter → redact closure, narrowed per runner
  to its declared `ops` (§2). Exposure is build-time (ADR-0003) — the paid research lane,
  account mutations, and scout writes have no entries, hence no facade fns. There is no
  runtime paid gate because there is nothing callable to gate.
- **Structural (env)**: runners receive no env parameter and module Workers have no
  global env — secrets stay host-side in the adapters, as ever.
- **Trust, honestly**: no-network-besides-the-facade is NOT structural. `globalOutbound:
  null` confines the isolate; runners execute host-side where `globalThis.fetch` is live.
  The boundary for runner code is the same as for `src/adapters/*`: first-party review at
  the adapter trust tier. The token lint and the behavioral fetch-stub test (§2, §12) are
  drift belts that catch accidents and careless diffs — they are not a sandbox, and this
  design does not claim one.
- The fail-closed skill-section posture (62fa42d) has no run-path analog to inherit
  because runners cannot read skills at all in v1 (§1 non-goals).
- **Forward bind**: any future runner touching a metered or side-effecting op is subject to
  the CLAUDE.md request-context precondition (todo 845 item 3) — the outer MCP request
  context must reach the host adapter for approval/elicitation/budget BEFORE such an op is
  exposed, and only then could a runner compose it. The facade design is compatible (the
  context would thread through `buildSandbox` → facade construction), but building that is
  explicitly out of scope here.

## 8. Observability

One aggregate event per run, flat and small, consistent with `op`/`search`:

```
logEvent("skill_run", {
  id,                      // exact catalog id
  outcome,                 // "ok" | error.kind  (invalid-input refusals log like op refusals)
  ms,                      // wall time of the whole runSkill
  calls, callsOk, callsError, callsSoftEmpty,  // derived from the HOST ledger (§6),
                                               // never from runner output
  outputSchemaOk           // false ⇔ the §6 warn-belt found a contract mismatch
})
```

Constituent calls need nothing new: the facade fns are the existing wrapped closures, so
each already emits its own `op` event — the platform's per-invocation grouping correlates
them with the `skill_run` line. Trace side: run.ts gains `hooks.onSkillRun` (the
`onSkillRead` pattern) and stamps `sandbox.skillRun` (count) on the `codemode.execute`
span. No payloads, no secrets, as ever.

## 9. Truncation & output budget

Runner outputs cross the model boundary via the script's return value → the existing
`truncateForModel` ~6k-token cap. The defense is the output schema itself: bounded item
counts (input `limit` caps ≤ 20/10), per-field truncation inside the runner (description
≤ 400, summaries ≤ 200 chars), counts instead of bodies, and upstream `text`/`long_summary`
always dropped. Measured worst case at max limits stays ≈ 3.5k tokens (dossier) / ≈ 2k
(digest) — headroom for the model to return the dossier PLUS its own synthesis in one
script. No `notice` field: unlike skill bodies, run outputs are sized to be returnable
whole, and the truncation footer already covers the pathological case.

## 10. Eval instrument (Q4) — the ship gate

A targeted before/after QA A/B on cases the runners aim at, with the routing check proving
the catalog change is retrieval-neutral. The 07-03 hope of "no new eval code" did not
survive review: the existing harness cannot measure adoption or composition (run-qa.mjs
transcripts keep execute *inputs* whole but store only `resultChars`/`isError` for
results; grade-plan.mjs's extractor recognizes `codemode.skill.read` but would score
`codemode.skill.run` off-plan). So the gate ships with **four small committed instrument
changes**, landed BEFORE the baseline run so both sides of the A/B are captured with
identical tooling (§13):

- `eval/run-routing.mjs` gains `--dump-ranked <file>`: per-case ordered hit-id lists
  (`{ caseId: [id, …] }`), for the direct main-vs-feature diff below.
- `eval/qa/run-qa.mjs`: execute tool **results** are kept whole in transcripts (mirror of
  the existing execute-inputs-whole precedent; execute results are already capped ~6k
  tokens by `truncateForModel`, so whole capture is bounded). This makes `calls` reports
  and truncation footers readable post-hoc.
- `eval/qa/analyze-composition.mjs` (new, small): per case, from transcripts — execute
  script count; **adoption** (regex `codemode.skill(?:\.run|_run)\s*\(` over execute
  inputs); op counts extracted grade-plan-style, with each skill.run call expanded through
  the registry's declared `ops` (imports `RUNNERS` — node-clean per §2) so before/after
  constituent work is comparable; truncation-footer detection and `calls` ok/error/
  softEmpty tallies from the now-whole execute results; plus `turns`/`costUsd` per case.
- `eval/plan/grade-plan.mjs`: `OP_RE` gains `codemode.skill(?:\.run|_run)` → service
  `"skills"`, expanded to declared ops for coverage purposes — so the plan regrade credits
  a dossier run with the services it actually touched instead of flagging it off-plan.

The gate, in order:

1. **Routing (free, first)** — two parts. (a) **Rank/membership identity, proven
   directly**: `--dump-ranked` on current main and on the feature build, diff — must be
   empty. This, not byte identity, is the true invariant: the scorer reads no field this
   change touches (§5), but runnable-skill hits gain `signature` by design, so hit bytes
   for queries surfacing those two entries legitimately change (unit tests pin
   "pre-existing fields byte-identical, `signature` the only delta" — §12). (b) `npm run
   eval:routing -- --gate` stays as the banded regression backstop — it alone cannot prove
   the invariant (±band aggregates pass under real drift), which is why (a) exists.
2. **QA targeted lane** — `node eval/qa/run-qa.mjs --variant A --port 8788 --ids
   q-defi-blend-scf-funding,q-scf-history-soroswap,q-defi-phoenix-scf,q-eco-hana-wallet-scf,q-edge-noinfo-fake-project-quasarswap,q-edge-fresh-most-recent-news`
   (5 dossier-shaped incl. the fabrication trap + 1 digest-shaped; all existing cases with
   audited goldens — **no new goldens needed for the main lane**, sidestepping golden-truth
   authoring risk entirely). Run BEFORE on current main + the instrument commits (baseline
   transcripts + verdicts, rubric v2.1) and AFTER on the feature build, same judge, same
   day.
3. **Live-lane digest supplement** — the main battery is thin on digest shape (1 case), so
   add **2 hand-authored live-digest cases** (originally appended to `eval/qa/live-cases.json`;
   todo 913 restored that file's frozen denominator and moved them to the distinct opt-in
   `eval/qa/live-digest-supplement-cases.json` contract): e.g. "what's new around RWA on
   Stellar in the last month" and "recent coverage of <directory entity>" — goldens are **behavioral**
   per that lane's charter (dated citations present, window/as-of framing stated, honest
   soft-empty handling; never snapshot values), authored through
   `.claude/skills/golden-truth/SKILL.md` discipline. Run the lane before/after too;
   report it separately, never merged (EVALS.md rule 2).
4. **What is read, in order**:
   - verdicts on the same goldens must not regress (wrong-count is the stable signal);
   - composition deltas from `analyze-composition.mjs`: execute-script count per case,
     expanded constituent-op work, turns, cost, truncation flags;
   - **adoption** (same analyzer): did the agent actually call `skill.run`? Zero adoption
     with neutral verdicts = do not ship as-is; fix surfacing (descriptions, signature)
     and re-run — an unused affordance is catalog noise.
   - `eval/plan/grade-plan.mjs` regrade on the after-transcripts (with the updated
     extractor) as the coverage diagnostic.
5. **Ship rule**: ranked-id diff empty AND routing gate green AND verdict non-regression
   AND (a real composition delta — fewer scripts/expanded calls/turns — OR a verdict
   improvement). Failing that, the change does not deploy; the 2026-07-03 parking
   discipline resumes and this doc records the negative result.
6. Per the evals charter, the round files any upstream findings it surfaces in
   `improvements/` (e.g. lumenloop shape drift the defensive projection catches).

**Outcome (2026-07-06): SHIP-APPROVED under the §10.5 rule.** Feature commit `f99be10`;
full record with stamps and honest reading notes in `eval/README.md` ("Round 806"). The
gate, as read: ranked-id diff EMPTY vs the settled-main baseline
(`eval/results/ranked-baseline-806.json`) and routing gate PASS (no re-baseline); ids
battery 4C/1P/1W → **6C/0P/0W** (`2026-07-06T20-41-52` → `2026-07-07T00-38-53`); live lane
11C/0P/1W → 11C/0P/1W, same pre-existing unrelated wrong (`2026-07-06T20-51-40` →
`2026-07-07T00-47-30`); composition delta real on the targeted battery (mean turns
4.83→4.5, op calls 24→21, scripts 8→7). Adoption split honestly: **digest 2/3**
digest-shaped cases (both single-script, both correct); **dossier 0/5** — those five were
answered correctly by manual composition, so the verdict flips are NOT attributed to the
feature. The §10.4 zero-adoption rule was cleared by digest adoption; the dossier
surfacing gap is the named follow-up round. Deploy was held at decision time for an
unrelated merge-train window — approval and deploy timing are separate facts.

## 11. File-by-file implementation plan

| # | File | Change |
|---|---|---|
| 1 | `src/skills/runners/types.ts` (new) | `SkillRunner` (incl. `ops: string[]`), `OpsFacade` types (§2). Node-clean (types only). |
| 2 | `src/skills/runners/stellar-project-dossier.ts` (new) | §4.1: declared ops + schemas + `run` (defaults applied first, resolution ladder, fan-out, projection — no `calls` authoring). |
| 3 | `src/skills/runners/stellar-ecosystem-digest.ts` (new) | §4.2: declared ops + schemas + `run` (defaults, window math, mode routing, dedup, projection). |
| 4 | `src/skills/runners/index.ts` (new) | `RUNNERS` registry keyed by exact catalog ids — the allowlist-as-data. |
| 5 | `src/skills/run.ts` (new) | `runSkill(catalog, registry, facade, name, input)`: resolution ladder → guard → recording sub-facade (declared ops only, host ledger) → `Promise.race` vs `RUNNER_DEADLINE_MS` → outputSchema warn-belt → attach `calls` → redact belt → envelope; `logEvent("skill_run", …)` from the ledger; `assertRunnersWired(catalog, registry)` (id sets both ways + `JSON.stringify` schema equality per id + declared ops ⊆ manifest ops, throws). |
| 6 | `src/executor/providers.ts` | Extract `buildOpsFns(catalog, env, deps)` from `buildProviders` (the per-op wrapped-closure builder) and reuse it for both the sandbox namespaces and the facade; extend `SKILL_PRELUDE` with `run`; add `skill_run` fn to the codemode provider (needs the facade — thread it via `buildSandbox`, which now builds ops once and passes them to both); add `hooks.onSkillRun`; `catalogEntryView` gains `runnable`; `describe` runnable-skill branch (signature + schemas + dual usage line). |
| 7 | `src/executor/run.ts` | Wire `onSkillRun`; span attr `sandbox.skillRun`. |
| 8 | `src/catalog/types.ts` | `runnable: z.literal(true).optional()` on the entry schema; update the `inputSchema`/`signature` doc comments that currently say operations-only (§5 contract broadening). |
| 9 | `src/skills/store.ts` | Export the nearest-id helper (currently private `nearestSkillId`) for run.ts reuse; no behavior change. |
| 10 | `src/catalog/search.ts` | `refinedCatalogSchema` runnable refinements (kind skill, both schemas non-null); `renderSignature` runnable branch (skill.run callable line; compact mode honors `COMPACT_OUTPUT_THRESHOLD` as for ops); search-hit assembly calls renderSignature for runnable skills (hit keeps `availableSections` too); `SearchHit.signature` doc comment updated. Frozen contract untouched — additive fields only. |
| 11 | `scripts/build-catalog.mjs` | Import `RUNNERS`; attach `runnable` + schemas to matching skill entries; fail-loud guards: registry→manifest skill entries AND every declared op resolves to an emitted operation entry; extend `assertNoNonExposedRefs` to runnable entries' schema JSON; console summary line naming the runnable ids. Rebuild `catalog/manifest.json`. |
| 12 | `scripts/build-super-spec.mjs` | `/skills/run_skill` path + `x-runnable-index` from the same registry (§5). Rebuild `specs/super-spec.json`. |
| 13 | `src/mcp/tools.ts` | One added sentence each in `SEARCH_DESCRIPTION` (runnable-skill hits carry a callable signature), `EXECUTE_DESCRIPTION` (skill.run contract: envelope, exact ids, calls report, read-vs-run split), `SERVER_INSTRUCTIONS`, and the search follow-up text. Rule: if the runnable set ever returns to zero, these sentences leave in the same change (ADR-0003 spirit — never advertise what doesn't exist). |
| 14 | `eval/run-routing.mjs` | `--dump-ranked <file>` flag: per-case ordered hit-id lists (§10.1a). |
| 15 | `eval/qa/run-qa.mjs` | Keep execute tool RESULTS whole in transcripts (bounded by `truncateForModel`; mirrors the inputs-whole precedent). |
| 16 | `eval/qa/analyze-composition.mjs` (new) | The §10 adoption/composition analyzer: skill.run adoption, script counts, declared-ops-expanded op work, truncation + calls tallies, turns/cost. |
| 17 | `eval/plan/grade-plan.mjs` | `OP_RE` + extraction recognize `codemode.skill.run`/`skill_run` as service "skills", expanded via declared ops for coverage. |
| 18 | `.claude/skills/live-drift-resolution/SKILL.md` | New classification step: drift touching any op in a runner's declared `ops` (machine-checkable from the registry) = runner-affecting — re-run the runner live smoke and re-verify projections against observed shapes before closing (pattern only; no run-stamps — skills stay timeless). |
| 19 | Docs | PLAN §3 "Executable skills" + §7 deferred-note updated to point here as *built*; ARCHITECTURE.md sandbox-surface section gains skill.run (incl. the §7 trust framing); README connection guide untouched. Todo 806 closure comment. |

## 12. Test plan

**Unit (vitest, offline)**

- `test/skill-runners.test.ts` (new): each runner against a stub facade with fixture
  responses — happy path; **default application** (omit every optional input; assert the
  runner used 8/5, 30/"theme"/5 — the pipeline never injects schema defaults, §4); slug-
  direct vs search resolution (all four `resolvedBy` values); ambiguous-multi-hit error
  (message lists candidates); zero-hit soft-empty; each constituent-error → section-null
  mapping; soft-empty → `softEmpty: true` mapping; entity vs theme mode; window math
  (assert format + span); dedup; per-field truncation; **outputs (with host-attached
  `calls`) validate against their own outputSchema** (reusing `validateArgs` as the
  oracle); shape-drift fixture → section null + ledger entry. Fixtures are projections of
  **live-captured** responses, refreshed via the §11 row-18 live-drift checklist — the
  self-authored-schema oracle alone cannot see upstream drift.
- Import-discipline test (drift belt, §2): read each runner module source; assert its
  import specifiers ⊆ `{"./types.ts"}` (consequence: no helper modules) and the source
  contains none of the tokens `fetch(`, `env.`, `process.`, `import(`, `globalThis`,
  `self.`, `Reflect`, `eval(`, `Function(`, `constructor` (the last three added
  post-review: dynamic-eval spellings that could reconstitute egress past the lexical
  belt — still a belt, not a boundary; the behavioral fetch-stub test and first-party
  review remain the enforcement).
- **Behavioral confinement test** (the belt the lint can't be): stub `globalThis.fetch`
  to throw (`vi.stubGlobal`), run every runner end-to-end against the stub facade — a
  smuggled network call fails CI at runtime regardless of how it was spelled.
- `test/skill-run.test.ts` (new): `runSkill` resolution ladder — unknown id (error names
  both runnable ids + nearest suggestion), non-runnable skill id, section id, non-string
  name, invalid input (validateArgs issues surface), registry-miss belt error, runner-throw
  → caught envelope, **deadline race → timeout envelope**, redaction belt (plant a fake
  secret in a stub result), **ledger integrity**: a runner that swallows a constituent
  error and/or returns its own `calls` key still yields host-recorded `calls` (overwritten
  unconditionally) and matching `skill_run` counts; a call to an undeclared op fails
  loudly (absent from the sub-facade); **outputSchema warn-belt** sets `outputSchemaOk:
  false` without failing the run; `assertRunnersWired` failures in every direction incl.
  **schema-inequality** (mutated manifest schema vs registry) and undeclared-op drift;
  `logEvent` field shape.
- `test/executor-providers.test.ts` additions: `skill_run` wired on the codemode provider;
  SKILL_PRELUDE contains the run wrapper; `catalogEntryView.runnable`; describe runnable
  branch (signature + usage naming both calls).
- `test/catalog.test.ts` / `test/search.test.ts` additions: schema accepts/refines
  `runnable`; loadManifest rejects runnable-without-schemas; renderSignature runnable
  branch renders the exact `codemode.skill.run("<id>", …)` line; search hit for a runnable
  skill carries both `signature` and `availableSections`; **byte-stability**: every
  pre-existing field of every hit byte-identical to a non-runnable build, `signature` on
  the two runnable entries the only delta (the §10.1 invariant, pinned offline).
- `test/super-spec.test.ts` additions: `/skills/run_skill` present, enum = runnable ids,
  x-runnable-index schemas match the manifest entries.
- Builder guard tests (the existing pattern for drift guards): registry key with no skill
  entry throws; **declared op absent from the manifest throws**; schema-text leak (a
  planted `scout.submitFeedback` in a description string inside a runner schema) trips
  `assertNoNonExposedRefs`.
- Analyzer smoke: `analyze-composition.mjs` against a fixture transcript (one skill.run
  case, one plain-ops case) — adoption flag, expansion counts, truncation flag.

**Smoke — two lanes, honestly split (as built)**

- `test/smoke` addition (offline workerd lane — that lane is offline-ENFORCED by its
  miniflare `outboundService`, a todo-833 property this design does not override): one
  `execute` calling
  `codemode.skill.run("skills.lumenloop.stellar-project-dossier", { project: "blend" })`
  and one digest run, with the host-side lumenloop adapter routed to the live-captured
  runner fixtures — assert envelope shape, `calls[].ok` all true, sections non-null,
  the envelope-guard traps, and the unknown-name error path. This pins the FULL
  dispatch chain (prelude → provider RPC → runSkill → sub-facade → adapter) at the
  real worker boundary.
- The standing behavioral guard against LIVE upstream payload drift (§4.2 note) is the
  live verification lane: rollout step 6 runs both runners against wrangler dev
  (`--host localhost`), and the §11 row 18 live-drift checklist re-verifies projections
  (and refreshes the fixtures the offline lanes share) whenever drift touches a
  declared op.

**Eval** — §10 verbatim: ranked-id diff + routing `--gate`, the 6-case `--ids`
before/after, the 2 new live-lane digest cases, plan regrade + composition analyzer,
adoption reading.

## 13. Rollout order

1. **Instruments first**: land §11 rows 14–17 (routing dump flag, whole execute results,
   composition analyzer, plan-grader recognition) — the A of the A/B must be captured with
   the same tooling as the B.
2. **Baseline**: run the §10 BEFORE lanes against current main + instruments (local
   wrangler dev) and store the result stamps, including the `--dump-ranked` baseline.
3. Land files 1–5 + 9 (§11) with their unit tests — pure, offline, no wiring yet.
4. Land files 8, 10–12: schema + builders; rebuild `catalog/manifest.json` +
   `specs/super-spec.json`; run the ranked-id diff (must be empty) + `eval:routing --
   --gate` + `eval:selftest` + full vitest.
5. Land files 6–7 + 13: dispatch, prelude, observability, descriptions; providers/spec
   tests green.
6. Live smoke against wrangler dev (`--host localhost`, per the dev-auth gotcha).
7. §10 AFTER lanes; agentic review of any verdict deltas (verdict-review discipline from
   the run-evals skill); ship decision per the §10.5 rule.
8. On ship: deploy; docs + PLAN/ARCHITECTURE + live-drift skill updates (rows 18–19);
   todo 806 closure comment with the before/after evidence stamps; file any upstream
   findings in `improvements/`.
9. On no-ship: revert the deploy-facing pieces or hold the branch; record the negative
   result here (this doc stays the decision record either way).

## 14. Open questions

None. Every decision above is settled with rationale; an implementer who needs to deviate
(e.g. an upstream schema makes a §4 projection field unavailable, or the eval forces a
surfacing change) updates this document in the same change.

### 14.1 As-built deviations (2026-07-06 build)

The shipped code deviates from the section sketches above in the following acknowledged
ways (each carries its rationale in-file too). Where a §4/§12 contract changed
materially — the fabrication-trap path, the ambiguity hint, the token lint, the smoke
split — the section itself was updated; the rest are recorded here so later
re-verification (the step-8 docs pass, the live-drift projection re-checks) diffs
against the real contracts:

- **Fixtures are `.ts` modules, not `.json`** (`test/fixtures/skill-runners/*.ts`):
  typed default exports import cleanly in both vitest lanes without resolveJsonModule.
- **`runSkill` takes a 6th `deps` param** (`{ secrets?: string[] }`) feeding the
  aggregate redaction belt — the §6 sketch's 5-arg signature had no channel for it.
- **outputSchema warn-belt runs AFTER the `calls` attach** (§6 sketch listed it
  before): the belt then validates the exact bytes the model receives, including the
  host-attached `calls` the schema declares.
- **`asErrorEnvelope` has a malformed-error rung**: a runner result shaped
  `{ ok: false }` with a missing/non-object `error` becomes a runner-bug ERROR
  envelope instead of slipping through as `{ ok: true, data: { ok: false, … } }`.
- **Output `url` fields are `string | null`** (§4.1/§4.2 sketches said `string`):
  live research rows carry no url; projected as null, never guessed.
- **`links` / `based_in` / `operating_region` project array→joined-string**: live
  directory rows carry these as string arrays; joined ", " into the declared strings.
- **SCF `status` can be null** (live award rows omit it); **entity-mode item
  `summary` projects to `""`** (live entity rows carry none).
- **Anchor shape-drift fails the run** (an unexpected `get_project`/primary-content
  payload shape is treated as that call erroring, and the anchor erroring fails the
  run) — the §4.2 drift rule applied to the anchor consistently.
- **`skill_run` is logged for resolution misses too** (unknown/non-runnable/invalid
  input) — refusals are outcomes, mirroring op-refusal logging (§8's intent).
- **`assertRunnersWired` compares canonical key-sorted JSON**, not raw
  `JSON.stringify`: the manifest emitter sorts keys for byte-determinism, so raw
  equality would false-alarm on every real build; semantic drift still throws.
- **Super-spec `run_skill` requestBody requires `input`** (the §5 sketch left it
  loose): every runner input schema has required fields, so an inputless call can
  never validate anyway — fail at the schema, not the dispatch.
- **Section `softEmpty: true` also covers OK-with-zero-rows**: an upstream OK payload
  with zero rows and an upstream soft-empty envelope project identically (both are
  "answered with nothing").
- **§12 smoke lives in the offline-enforced workerd lane against live-captured
  fixtures** (full dispatch-chain coverage); live upstream-drift smoke is the rollout
  step 6 wrangler-dev/live lane plus the §11 row 18 checklist (see §12).

## 15. Review notes (2026-07-06)

Two independent adversarial reviews ran against the 2026-07-06 draft; every blocker and
major is incorporated above as first-class design (confinement honesty + belts §2/§7;
declared-ops drift guards §3/§5; host-owned call ledger §6/§8; rank/membership routing
invariant §5/§10; eval instrument gap closed §10; contract-broadening framing §5; upstream
drift coverage §4.2/§11-18/§12). Applied minors: runner-applied defaults (§1/§4/§12),
outputSchema warn-belt (§6), schema equality in `assertRunnersWired` (§5), host deadline
replacing the unverified executor-timeout claim (§2), exported nearest-id helper (§6/§11-9).

Rejected, with reasons:

- **"Try strengthening the playbooks + describe examples instead"** — that is precisely
  the 2026-07-03 parked state, whose reopen triggers have since fired (header); the §10
  BEFORE lane *is* that alternative measured head-to-head, and the no-ship path reverts
  to it. Building the comparison is the only way to settle it.
- **"Keep runnable signatures out of search, expose only via describe"** (offered as an
  alternative remedy inside the routing-gate major) — rejected in favor of restating the
  invariant: the callable line in search hits is the adoption surface the §10.4 ship
  criterion depends on; hiding it would manufacture the zero-adoption failure mode.

### §10 outcome postscript — dossier runner retired (2026-07-07, todo 849)

The adoption follow-up the ship note named ran its course within a day. Replaying the A/B
transcripts' real agent queries showed the dossier runnable ABSENT from 6 of 7 result pages
(entity-shaped queries a generic playbook cannot lexically match). Three surfacing levers were
implemented and measured: an enumerated description note (4 graded routing regressions, 0
improvements), a trimmed cue-only note (bisected — the note alone lifts the digest skill from
gated-out to rank 3 on an unrelated oracle query), and schema-derived distinctive keywords at
the 0.4 blend (zero surfacing effect; sub-gate). All reverted. Per this document's own
standard — an unused affordance is catalog noise — the dossier runner was retired (commit
962a71c): registry, module, tests, and fixtures removed; the mirrored skill stays readable;
ranked-id diff vs baseline EMPTY; zero dossier touches in any battery transcript, so the
removal is behaviorally invisible. The digest runner remains the sole v1 runnable, with
adoption reproduced in three consecutive battery runs on its unmodified description.
