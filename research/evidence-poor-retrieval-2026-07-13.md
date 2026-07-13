# Evidence-poor retrieval recovery — 2026-07-13

## Observed failure

The shared Justin Rice interaction was not a service outage. Production requests were healthy and
returned HTTP 200, but the first directory/project/docs operations produced empty or adjacent
data-shaped results. A later `lumenloop.search_content_semantic` call found exact-name, dated
historical Stellar event records. The miss was therefore routing and answer-level stopping: the
broad capability existed but was not selected when narrow evidence proved insufficient.

A negative-control localhost probe for `Strupey` returned large semantic result sets while compact
exact-token projections found no matching row in LumenLoop semantic content, Scout research,
projects/builders, or Stellar Docs. This proves that “search more broadly” cannot mean “trust the
nearest semantic neighbor.”

## Reviewed design

Five SOLO lanes (Sol, Terra, Luna, Fable, and Grok) reviewed architecture, operation priority,
corpus coverage, contract language, and adversarial failure modes. Two constraints survived every
lane:

1. A closed-world question (“is this exact identity in this directory?”) may stop with a result
   scoped to that source. An open-world identity, project, history, or obscure-topic question may
   not turn empty, weak, adjacent, ambiguous, or partial rows into a universal negative.
2. Broad semantic results are candidate discovery. Attribution requires an exact identity or
   canonical slug tied to a source and date; otherwise the answer remains scoped and unverified or
   asks for disambiguating context.

## Implemented mechanism

Selected manifest operations now carry query-independent `retrievalProfile` metadata. Every edge
names an exact exposed operation, a relation (for example wider semantic, cited research,
different medium, or corpus-wide), and the insufficiency reasons it handles. Catalog generation
fails on an orphaned, non-operation, self, duplicate, or empty-trigger edge.

Public `search` and in-script `codemode.search` accept exact attempted operation IDs in
`recoverFrom` plus an optional `reason`. They return at most three `recovery` candidates separately
from ranked `hits` only when `recoverFrom` is non-empty; an omitted list or a reason without IDs
returns no recovery. The graph does not add query rewrites, alter scoring, auto-execute calls, expose
paid operations, or ask the host to infer semantic relevance from arbitrary payloads.

Model-facing instructions, operation notes, adapter hints, and a conditional zero-data execute
footer carry the closed/open-world stopping rule and source/date provenance gate. Because healthy
semantic/research calls can still yield adjacent or incomplete evidence, the host also counts a
small exact-ID set of candidate-bearing operation classes and appends a provenance reminder; it
does not inspect their payloads or decide whether their rows are relevant. The recommended
broad family remains claim-shaped:

- ecosystem content/events: `lumenloop.search_content_semantic`
- cited history/research: `scout.searchResearch`
- spoken material: `lumenloop.find_av_passages`
- official technical wording: `stellarDocs.search_docs`

## Evaluation contract

The QA battery includes four complementary controls:

- a general behavioral case proving narrow emptiness is insufficient for an open-world negative;
- a positive named case in which broad research should recover dated Justin Rice history without
  converting it into a current-role claim;
- a negative/ambiguous `Strupey` case in which broad searching must end in scoped non-verification
  and a clarification request, not semantic-neighbor attribution.
- a paired closed-world `Strupey` directory-membership case which must stop at Scout's scope and
  must not trigger the open-world sweep.

Existing empty-person and semantic-directory cases are corrected to distinguish an `ok` empty
payload from a `soft-empty` error and to preserve `match_mode` as candidate—not identity—evidence.
The normal routing gate remains independent because retrieval profiles are not scorer input.

The first seven-case Sonnet diagnostic produced two correct, four partial, and one wrong answer.
The two most important controls passed: the closed-world case stopped at Scout, and the open-world
Strupey case searched broadly but abstained. The wrong Tyler answer made an unsupported completeness
claim after finding real material; three behavioral partials likewise omitted the provenance rule.
That shared failure motivated the operation-class candidate-evidence reminder. The planned second
model arm was canceled at the preregistered inter-arm stop instead of spending through a known
mechanism failure.

After an independent Grok delta review signed off, a bounded three-case same-model probe measured
the candidate-evidence reminder (`eval/qa/results/2026-07-13T19-09-10-variantA.json`). It produced
two partial and one wrong verdict. Transcript review—not the scores alone—showed a mixed result:

- the Tyler answer improved from an unsupported completeness claim to a bounded exact-name,
  source-cited roster, but failed to put an observation date on mutable role/directory claims;
- the person-entity case performed the broad semantic pass, but the catalog note's old “lane
  behavior” wording still led the model to call a normal `ok` empty payload a defect and to omit
  the valid source-scoped closed-world conclusion;
- the semantic-directory answer correctly explained `match_mode` and candidate status, but the
  case question did not ask for the open-world branch that its expanded golden required.

The reconciliation stays general: the candidate footer now asks for observation dates on mutable
claims; the person-entity note explicitly distinguishes data-shaped empty from transport and
soft-empty failure and states both closed- and open-world conclusions; and the semantic-directory
question now explicitly asks for its conditional open-world branch. No second vendor/model arm was
authorized after this failed checkpoint.

Evidence and model-lane reports are retained in
`solo://proj/49/scratchpad/evidence-poor-retrie--611`.
