---
id: sd-003
service: stellar-docs
status: verified
discovered: 2026-07-03
evidence:
  - eval/qa/results/2026-07-03T16-06-45-variantA.json (q-ti-rpc-gettransactions-pagination-xdr)
  - live soft-empty on get_doc_page_sections for the getTransactions method page + WebFetch of the live page (2026-07-03 evening)
  - Solo project 49, todo 807, scratchpad 521
  - 2026-07-03 corrected-golden re-judge (todo 827): the saved agent answer flips partial → wrong under the fixed golden — the agent explicitly denied a getTransactions 200 cap ("did not find RPC-doc confirmation"), a real wrong answer this gap causes that the old golden masked by encoding the same false belief
---

## Finding

The Algolia docs index excludes the auto-generated RPC-method and
Horizon-endpoint API-reference pages, so authoritative per-method limits
are undiscoverable through search. The live
`/docs/data/apis/rpc/api-reference/methods/getTransactions` page states
the limit "can range from 1 to 200 — an upper limit that is hardcoded in
Stellar-RPC for performance reasons... defaults to 50", but no search op
can reach it, and the *indexed* RPC Structure→Pagination page documents
only getEvents limits (1–10000, default 100). The consequence is worse
than a zero-hit: consumers extrapolate from the getEvents numbers or
from Horizon's (1–200, default 10) and get getTransactions wrong. This
round it produced a two-sided failure — the QA agent claimed "default
100" (getEvents-only) and even the eval golden itself encoded the false
belief that a 200 limit "is Horizon's, not RPC's".

## Evidence

Live 2026-07-03: `get_doc_page_sections({path:
"/docs/data/apis/rpc/api-reference/methods/getTransactions"})` →
soft-empty ("auto-generated API-reference pages are not indexed" — the
op description admits the exclusion); `search_docs` /
`search_rpc_horizon_data_docs` for the limit facts → no relevant hits;
WebFetch of the live method page → the 1–200/default-50 text quoted
above. Round record: Solo scratchpad 521 (batch-3 review report).

Impact quantified (2026-07-03 follow-up, todo 827): after correcting the
golden to the live method-page numbers, re-judging the saved agent answer
flips it partial → wrong — the agent's denial of an RPC-side 200 cap is a
genuine consumer-facing wrong answer produced by this indexing gap, not a
grading nuance. Both the QA agent and the original golden author
independently derived the same false belief from the indexed pages.

## Recommendation

Two options, cheapest first: (1) add per-method limits/defaults to the
indexed RPC Structure→Pagination page (a table of method → min/max/
default fixes discoverability without touching the crawler); (2) include
the auto-generated method/endpoint reference pages in the Algolia
crawl — they are the only authoritative source for per-method numbers.
Consumer-side, this gateway cannot work around the gap without shipping
hardcoded limits that would rot.
