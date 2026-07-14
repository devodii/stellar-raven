---
id: sd-036
service: stellar-docs
status: reported-upstream
discovered: 2026-07-11
upstreamTitle: Fix CAP-0075 protocol-version and field-selector contradictions
evidence:
  - CAP-0075 at stellar/stellar-protocol commit fbf05c9d3220b711e181577e7dca19844c765c3c
  - shipped host interface at stellar/rs-soroban-env commit 1d0a2c6a522b1e6bfafed23c047372832a7976a7
  - research/audits/2026-07-11-gt31-protocol-caps-reserves.md
  - Solo scratchpad 575 GT-31 primary process 3280, blind process 3282, and queued author process 3403
  - upstream issue filed 2026-07-14: https://github.com/stellar/stellar-protocol/issues/1980
---

## Finding

The current Final CAP-0075 source contains two internally reproducible protocol
and interface contradictions. Its preamble says Protocol 25 and both host-function
descriptors set `min_supported_protocol` to 25, but the Backwards
Incompatibilities section says the functions are available in Protocol 24 and
later. The interface blocks also type the `field` selector as `U32Val` with
numeric values 0 and 1, while the shipped P25+ `rs-soroban-env` interface types
it as `Symbol` and accepts `BLS12_381` or `BN254`.

This is distinct from `sd-021`, which owns Stellar Docs' wrong CAP link and its
permutation-versus-high-level-hash/API explanation. This finding owns the
normative CAP source errata and resolves through `stellar/stellar-protocol`, not
the Docs content repository.

## Evidence

At the pinned current heads on 2026-07-11, the contradictions reproduce with
read-only source checks:

- `core/cap-0075.md` lines around the preamble and host descriptors say Protocol
  25, while its Backwards Incompatibilities sentence says Protocol 24.
- The same CAP's two JSON interface blocks declare `field: U32Val` and document
  0/1.
- `soroban-env-common/env.json` declares `field: Symbol` for
  `poseidon_permutation` and `poseidon2_permutation`, documents
  `BLS12_381`/`BN254`, and gates both at Protocol 25.

The current Mainnet activation and Core release history independently establish
that these functions shipped with Protocol 25. No guessed SDK helper name is
needed to reproduce either defect.

## Recommendation

Update CAP-0075's Backwards Incompatibilities sentence to Protocol 25 and make
its interface blocks match the shipped `Symbol` selector and accepted symbol
values. If the numeric form was a superseded design, label it explicitly as
such rather than leaving two apparent current ABIs. Keep the CAP description
precise that these exports are configurable permutation primitives from which
hash constructions can be built, not turnkey hash helpers.
