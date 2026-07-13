---
id: sls-028
service: stellar-light-scout
status: reported-upstream
discovered: 2026-07-10
evidence:
  - live Scout NFT project discovery returned rows whose linked domains were rechecked on 2026-07-10
  - octoplace.io and thebluemarble.io resolved to unrelated gambling content
  - SNNAC returned 503 and IRL's current operator page did not substantiate the directory NFT description
  - Solo scratchpad 575 GT-16 blind process 3245
  - https://github.com/Stellar-Light/stellarlight/issues/515
---

## Finding

Scout can retain a Live/project discovery row after its linked domain becomes
dead, unrelated, or no longer substantiates the recorded Stellar product.
During the NFT audit, `octoplace.io` and `thebluemarble.io` resolved to
unrelated gambling content, SNNAC returned 503, and IRL's current operator
page did not substantiate the NFT description in the directory.

This is more severe than ordinary lifecycle drift. A repurposed domain can
turn a legitimate historical ecosystem row into misleading or unsafe current
navigation while the directory status still implies a live Stellar product.

## Evidence

The blind GT-16 lane first retrieved current NFT-tagged rows through live
Scout/Lumenloop, then fetched their operator domains independently on
2026-07-10. Other examples such as Stellar Quest, Stellar Passport, Wadzzo,
Cyberbrawl, Token Tails, and Phoenix NFT Marketplace still had current
operator/code evidence, proving the sweep could distinguish corroborated rows
from stale links.

## Recommendation

Add periodic link and identity verification:

- HTTP health and redirect target;
- page-title/content fingerprint for the expected project identity;
- last verified timestamp and source;
- quarantine or warning state for repurposed domains;
- lifecycle downgrade when no current operator/code evidence remains.

Add regression fixtures for the four affected NFT rows. A repurposed domain
must never be presented as a current verified Stellar project link.
