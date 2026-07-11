---
id: sd-017
service: stellar-docs
status: verified
discovered: 2026-07-10
evidence:
  - APIs Overview and Stellar Lab surfaces describe Horizon as considered deprecated
  - Stellar Stack and the 2026 policy correction describe Horizon as nearing EOL/not yet deprecated
  - current Horizon endpoints remain operational and some have no direct RPC equivalent
  - Solo scratchpad 575 GT-32 primary 3281 and independent blind 3284
---

## Finding

Official Docs publish incompatible lifecycle labels for Horizon. Some surfaces
call it deprecated, while newer policy/stack material explicitly says it is not
yet deprecated and remains maintained in a legacy/no-new-features role. This
forces clients and evaluators to choose a polarity that another official page
then marks wrong.

## Recommendation

Publish one canonical Horizon lifecycle sentence and reuse it across the API
overview, stack, migration guide, Lab, and endpoint pages. Separately state the
durable behavior: Horizon remains available for parsed/curated resources and
historical/account-oriented endpoints; Stellar RPC is the forward live/current
state and smart-contract interface but is not a drop-in replacement. Date any
EOL/deprecation milestone and name endpoints without direct equivalents.
