# GT-47 storage, SAC, resources, and SDK truth audit — 2026-07-11

GT-47 used a Terra/high primary audit and a pre-read-locked Sol/max blind
review. The blind lane sealed a ten-case matrix before opening the primary,
then reconciled current official Docs, CAP/Core/SDK/RPC/CLI source, live
read-only probes, Stellar Docs/Raven retrieval, Parallel, and Perplexity.
Full evidence is in Solo scratchpad 575 under processes 3327 and 3334.

## Reconciled result

The primary's restore-list precision was confirmed, but seven retain decisions
were overturned and two other repairs were broadened:

- resource limits are enforced across validation/preflight/apply phases, and
  not every transaction resource has a ledger-wide analogue;
- P23 auto-restore requires both the invocation read-write footprint and
  archivedSorobanEntries; restoration footprint names the manual operation;
- native XLM AccountEntry, issued-asset trustline, and C-address SAC contract
  storage are distinct balance paths;
- SAC is the same classic asset's protocol-built API, not a wrapped second
  representation or automatic application-audit guarantee;
- current SDK advisories require dated CVE/GHSA/package/patch mappings;
- contracttype generates Val/spec support rather than direct XDR codecs;
- simulation must cover auth, restorePreamble, inclusion/resource fees,
  supported instruction leeway, and stale-state re-simulation;
- three SDK storage accessors must not be called three XDR durability values.

The review also verified a new Docs/XDR drift captured as sd-024.
