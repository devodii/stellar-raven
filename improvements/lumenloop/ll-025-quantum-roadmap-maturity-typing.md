---
id: ll-025
service: lumenloop
status: proposed
discovered: 2026-07-11
intake: unclear
evidence:
  - P4 N2 candidate reads the 2026-06-09 quantum-post-quantum roadmap as stating ML-DSA host functions and native signer support were still missing and staged for 2026/2027; solo://proj/49/scratchpad/super-corpus-rebuild--585
---

## Finding

Lumenloop roadmap summaries do not reliably distinguish planned capabilities
from shipped ones. The June 9 post describes ML-DSA host functions and native
signer support as absent and staged, but untyped summarization can restate the
roadmap as current network functionality.

## Evidence

P4 N2 captured the future-tense and staged timeline in its 2026-07-11 candidate
review. This remains proposed until a live Lumenloop output is preserved with
the source comparison.

## Recommendation

Expose capability state (`shipped`, `testnet`, `planned`, `research`) and
target horizon separately from publication date. Generated summaries must retain
the source's future tense and avoid inferring deployment from a roadmap mention.
