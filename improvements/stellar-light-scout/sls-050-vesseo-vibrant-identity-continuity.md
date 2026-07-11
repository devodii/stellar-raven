---
id: sls-050
service: stellar-light-scout
status: proposed
discovered: 2026-07-11
evidence:
  - P4 H3 primary-source extraction cites current Stellar material as "the Vesseo app" while older directory/eval references use Vibrant; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - P4 H3's wallet/recovery review treated the naming transition as a factual identity boundary requiring current-source verification
---

## Finding

Scout directory identity handling does not make the Vibrant-to-Vesseo naming
continuity explicit. A consumer looking up one name can miss current recovery
material under the other, or merge them without a date/provenance basis.

## Evidence

P4 H3's 2026-07-11 primary-source extraction of Stellar key-management content
uses the Vesseo name, while prior directory-facing material uses Vibrant. The
candidate is proposed pending a captured Scout record pair that shows the alias
miss or stale label directly.

## Recommendation

Expose `currentName`, `aliases`, `renamedAt` when known, and a source URL on
wallet project records. Search both names to one canonical entity while
preserving the historical label and date in returned evidence.
