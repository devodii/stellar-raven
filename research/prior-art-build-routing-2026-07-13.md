# Prior-art discovery on build routes — 2026-07-13

## Question and observed miss

An externally reported Claude Code interaction asked Raven for an escrow contract. The agent read
the smart-contract playbook and official patterns, implemented and tested code, but did not inspect
existing implementations until the user explicitly asked about prior art. The follow-up found useful
requirements and build-vs-integrate evidence. A 24-hour Cloudflare observability query for `escrow`
found no matching event, so the supplied transcript cannot be joined to a Ray ID and remains reported
evidence rather than production-trace proof.

## What the fan-out found

Five independent SOLO lanes reviewed architecture, live operation behavior, UX contract, corpus
coverage, and adversarial failure modes; separate truth lanes checked escrow and non-escrow examples.
The current contract creates the miss: the build archetype and execute instructions pair skills with
Stellar Docs, while prior-art discovery is only obvious when the user explicitly asks for projects or
repositories. Static probes reproduced the gap across escrow, indexer, wallet, oracle, and payment-
channel wording.

The exposed free surfaces are already sufficient:

- `scout.searchProjects` checks whether an existing product/protocol changes the build-vs-integrate
  decision.
- `scout.searchRepos` finds source candidates and exposes activity/archive/code-verification
  metadata, but not license.
- the narrowest `stellarDocs.search_*` operation supplies current official mechanics and examples;
  `stellarDocs.search_docs` is the one bounded retry after a category soft-empty.
- `scout.searchResearch` supplies cited design/spec/history context when that context changes the
  design.
- Lumenloop directory/content operations are useful for exact product context and wider narrative,
  but semantic rows remain candidates rather than implementation proof.

Measured four-domain fan-out completed in roughly 0.46–2.26 seconds per bounded parallel pass on the
local dev service. False positives were common enough that automatic selection or code copying would
be unsafe. Scout repo rows had no license field; semantic directory/content results could be merely
adjacent; and project status or verification labels did not establish audit or production readiness.

## Decision

Prior-art review is a **bounded design-stage preflight**, not a universal build gate:

1. Trigger it while the user is designing a new contract, app, integration, protocol, or
   infrastructure component, or deciding whether to build versus integrate.
2. In the same execute script, make one small repos/projects pass alongside the relevant skill and
   official Docs lookup. Prefer official examples; expand to research/product context only when it
   can change the design.
3. Render at most a compact set of directly relevant candidates. State the applicability axis for
   adjacent patterns; if no close match appears, report the searched scope and continue from the
   skill/docs path.
4. Skip the ecosystem pass for a single already-scoped how-to, compile/deploy error, or debugging
   request.
5. Treat prior art as requirements, pitfalls, build-vs-integrate, and precedent input only. Verify
   the repository directly before reuse; never infer APIs, correctness, security, license, audit,
   maintenance, deployment, or production readiness from rank, stars, funding, or directory status.

This is deliberately separate from evidence-poor retrieval recovery. Recovery reacts to an
insufficient result; prior-art preflight proactively adds a complementary source class before a
material design is committed.

One architecture lane proposed a new manifest-backed `buildReview` search response containing
domain profiles, exact operation IDs, and hard call/candidate caps. That is a coherent escalation,
but it is not justified as the first change: it adds a caller intent and domain-classification API
before measuring whether the existing exposed operations plus an explicit workflow contract are
insufficient. Reopen that structured surface only if agentic evaluation shows the always-visible
contract still skips prior art on at least two unrelated substantial design cases, or repeatedly
expands beyond the bounded pass. Do not encode the phase as evidence-poor recovery or relevance-
scorer weight in either version.

## Implementation and evaluation contract

The current worktree contract, implemented but pending release and deployment as of 2026-07-13, is
carried by three mutually reinforcing surfaces: search guidance, execute guidance (the path used in
the reported interaction), and the generated workflow micro-map. The
micro-map distinguishes contract, dapp/wallet, SDK, protocol, and infrastructure design from
known-step implementation/debug. Scout's repo description also warns that discovery metadata is not
authority.

Evaluation uses paired cases rather than an escrow-only keyword test:

- proactive, substantial design asks must consult both implementation authority (skills/docs) and a
  bounded prior-art family before committing architecture;
- at least one non-escrow holdout verifies the same behavior for infrastructure or dapp design;
- a narrow build/debug control must answer directly without an ecosystem landscape detour;
- answers must preserve source roles and license/security/production caveats.

Exact current project rosters are illustrative and freshness-dated, never timeless grading gates.
The durable gate is the behavior: seek relevant prior art before material greenfield design, verify
what is found, and do not confuse precedent with authority.

## Targeted QA result and hardening

After independent pre-spend review signed off, the exact three-case Claude Sonnet 5 probe ran once
against the existing local service (`2026-07-13T20-07-14-variantA.json`; $3.1944026 total). No second
answering arm ran. The raw judge result was 0 correct, 3 partial, 0 wrong:

- both unrelated substantial-design cases (escrow contract and indexer infrastructure) proactively
  consulted Scout prior art alongside implementation sources, fixing the original skip class;
- the narrow WASM-target control stayed on official documentation and did not detour into ecosystem
  discovery;
- both substantial cases nevertheless mishandled the answer contract: one overstated candidate
  evidence and both omitted required license/audit/deployment/compatibility unknowns; the indexer
  answer also expanded to too many candidates. The control's only judge deduction was its missing
  answer-time as-of date, not routing.

That is a qualified trigger win and a guardrail failure, not an unqualified pass. Pending release,
the post-probe
hardening therefore makes the limits exact in search/execute guidance (two discovery calls, one
focused detail call, three returned candidates) and adds a host-owned reminder when the exact Scout
prior-art operation set succeeds in an execute that reads an exact manifest-declared build-authority
skill role (`contract`, `dapp`, `sdk-integration`, `protocol`, or `infrastructure`). Any other skill
read is inert for this cue. That composition guard keeps build-stage caps off ordinary project-list and landscape questions. The
reminder requires URL, applicability, provenance/
freshness, limitations, and claim-by-claim unknowns; it explicitly rejects rank, stars, funding, and
directory status as reuse clearance. This does not inspect payloads, select candidates, auto-run a
search, or block implementation. The hardening is covered offline; it was not used to justify a
second paid arm.
