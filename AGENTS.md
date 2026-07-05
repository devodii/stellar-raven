# AGENTS.md — stellar-raven-codemode

Entry point for Codex and any non-Claude CLI agent working in this repo.

## Source of truth: read `CLAUDE.md` first

`CLAUDE.md` is the single source of truth for what this project is, the architecture docs to
start from (`PLAN.md`, `ARCHITECTURE.md`), the research docs, the hard rules (manifest-is-the-
exposed-surface / ADR-0003, secrets host-side only, generated artifacts never hand-edited,
forward-only), the deployment/CI bindings, and the neighboring repos. This file does not
duplicate it — it points Codex at it and lists the shared skills. When guidance here and
`CLAUDE.md` could diverge, `CLAUDE.md` wins; keep this file thin.

## Skills — shared, agent-agnostic runbooks

The runbooks in `.claude/skills/<name>/SKILL.md` are plain markdown and **not Claude-specific**.
Claude Code auto-discovers them as skills; you can read the same `SKILL.md` directly. Each skill
also carries an OpenAI/Codex-facing manifest at `.claude/skills/<name>/agents/openai.yaml`
(display name, default prompt, MCP tool dependencies) so it can be surfaced in Codex's own
structure. To alias a new skill, add both the `SKILL.md` and its `agents/openai.yaml` sidecar.

Current skills:

- **live-drift-resolution** — resolve a "Live service drift detected" issue: regenerate the
  catalog, classify the drift (provenance/data vs operation-surface vs routing-text), decide
  policy/routing-baseline vs clean bump, dual-verify, commit and close.
- **run-evals** — run a full eval round: pick instruments, let the runner spawn the answering and
  judge agents, review every verdict, triage to root cause, file upstream findings in
  `improvements/`. The scores are the instrument; the findings are the product.
- **golden-truth** — change the golden Q→A corpus without codifying lies: classify the truth
  domain, triangulate across independent source classes, encode disputed/unverifiable facts
  honestly, land as a provenance-bearing override.
- **cloudflare-observability-review** — investigate live Cloudflare Workers logs, traces, and Ray
  IDs for production request/eval/agent-run forensics.

## Working norms (from `CLAUDE.md`)

- **Independent adversarial review is a quality gate, not a speed bump.** Reviewer ≠ author; let
  it run to completion; reconcile every finding before finalizing. Coordinate multi-agent work,
  todos, and scratchpads through the Solo MCP project bound in `CLAUDE.md`.
- **The manifest IS the exposed surface (ADR-0003).** Never tell a consumer what the gateway
  cannot do; never emit text referencing a non-exposed op or retired skill — the build guard
  (`assertNoNonExposedRefs`) enforces it.
- **Secrets host-side only**, never printed or committed; `npm run secrets:scan -- --tree` before
  committing regenerated artifacts.
- **Generated artifacts are rebuilt by `scripts/`, never hand-edited.**
- Prior-art repos `../stellar-raven-next` / `../stellar-raven` are read-only reference — learn,
  don't clone.
