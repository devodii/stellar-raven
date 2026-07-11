---
id: sd-026
service: stellar-docs
status: verified
discovered: 2026-07-11
evidence:
  - current documentation still demonstrates standalone stellar contract optimize
  - Stellar CLI 27 marks the standalone command deprecated
  - contract build optimization is enabled by default; --optimize is redundant and --optimize=false disables it
  - Solo scratchpad 575 GT-48 primary 3333 and blind 3342
---

## Finding

Current contract-build documentation still presents the standalone optimize
command as an active workflow even though CLI 27 deprecates it and performs
optimization during contract build by default.

## Recommendation

Teach default-on build optimization, document the explicit disable flag, and
remove or clearly label standalone contract optimize as deprecated. Keep code
size guidance tied to the target network's live contract_max_size_bytes rather
than a static stale value.
