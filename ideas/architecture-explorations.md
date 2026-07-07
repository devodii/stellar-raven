# Architecture exploration backlog — from the 2026-07-07 first-principles review

Provenance: the 24h ship review (Solo scratchpad `24h-ship-review-2026--551`, archived) ran a
first-principles evaluation of the codemode architecture against this project's goals, with
mid-2026 external evidence. Verdict: the architecture is right and reasonable — two-tool
search+execute economics are ecosystem-validated (Cloudflare's own 2,500-endpoint Code Mode
gateway, Anthropic's 98.7%-reduction guidance), the dossier-runner retirement proved models
out-compose host orchestration, and the cap/artifact-lane decisions are the best-evidenced in
the repo. But the review named unmeasured assumptions and time-sensitive work. This file is the
ranked backlog so it survives the scratchpad's archival. Each item follows the house rule:
conviction or a winning A/B on golden Q→A accuracy.

## Ranked candidates

1. **Run the null hypothesis: per-op MCP tool server vs search+execute** (~2–4 days; harness
   exists). The foundational two-tool bet was never directly measured — ADR-0001 A/B'd two
   *code-mode* search shapes against each other. Generate a variant server exposing the ~50
   catalog ops as plain MCP tools (manifest already carries ids/descriptions/inputSchemas;
   adapters exist), run the 30-case QA sample + live lane both ways. Evidence: verdicts, turns,
   cost, truncation-driven context bloat per arm. Either retires the strongest standing
   objection to the architecture with data, or redirects the project. The single
   highest-information experiment available.

2. **Hybrid lexical+embedding retrieval A/B** (days; all referee instruments exist). Lexical
   search is a measured treadmill: five structural scorer levers, tokenizer-aware hand-written
   description notes, strict top-1 ~63–67% across instruments, and fresh live exhibits
   ("blend lending pools" → scout.compareHackathons top-1 in production, 2026-07-07).
   Build-time embeddings for the ~271 catalog entries committed as a generated artifact
   (pinned model, determinism preserved), blended or reranked against the vendored scorer;
   referee with the routing gate + extended lane (strict top-1 77/122 is the target) + a QA
   sample. The win is counted as much in *removed mechanism* as in points.

3. **MCP 2026-07-28 spec readiness spike** (1 day; TIME-SENSITIVE — final ships ~3 weeks from
   the review date). The RC removes `initialize` (where SERVER_INSTRUCTIONS — one of the four
   envelope-teaching channels — currently rides), goes fully stateless with server-issued
   handles as tool arguments (which validates the artifact-id design), and adds
   `Mcp-Method`/`Mcp-Name` routing headers plus list/read cache fields (SEP-2549/2575). For a
   forward-only no-back-compat repo this is a cheap early-adoption opportunity and a real risk
   if ignored.

4. **Compact operation-card code-shaped search re-test** — ADR-0001's own named next
   experiment: hybrid ranked/code search over op cards with `codemode.search`/`describe`
   parity in the search sandbox; rerun the 60-case paired A/B. Win = variant-B answer quality
   without the max-turn exhaustion that killed it.

5. **Discovery-only eval instrument** (small) — "did one search turn return the right callable
   set?" Isolates retrieval quality from answer policy; makes candidates 1, 2, and 4 cheaper
   to referee.

6. **Pre-cap evidence sidecar for QA judging** (runner change). Closes the residual
   judge/agent evidence asymmetry at its root: agents read full payloads via
   `codemode.artifact.read`; judges see capped transcript text + claim-anchored packs, so
   live-computed aggregates ("N of M events…") remain unanchorable. `run-qa.mjs` captures
   uncapped execute payloads (or dev-R2 artifact bodies) into a gitignored per-stamp sidecar;
   the pack builder prefers sidecar over capped transcript. Predicted first break without it:
   count/aggregation claims on live digest cases.

7. **Telemetry-mined live cases** — mine real production intents (with the PII-scrub doctrine
   from the 2026-07-03 purge) into live-lane eval candidates; cases nobody authored are the
   best guard against golden-authoring bias.

8. **Adopt upstream's durable approval runtime** only when a side-effecting/paid op actually
   ships — `@cloudflare/codemode` v0.3/0.4 carries the DO-backed approve/reject/rollback
   control plane CLAUDE.md's write-op rule anticipates. No action until then; mirror upstream
   rather than inventing.

## Known deferred hardening leftovers (small, non-blocking)

- Judge-regression replay gate from real adjudicated rows — deferred: conflicts with the
  results-local-only convention; synthetic counter-pressure fixtures shipped instead
  (rubric v2.4, 2026-07-07).
- `extractLossDetail` regex in `src/policy/source-basis.ts` is coupled to the truncate.ts
  footer wording; a wording edit silently empties lossDetail with one indirect test on guard.
- The 10.4MB `public/Gemini_Generated_Image_*.png` is documented as intentionally retained
  (public/README) — revisit if page-weight or repo-size ever matters.
