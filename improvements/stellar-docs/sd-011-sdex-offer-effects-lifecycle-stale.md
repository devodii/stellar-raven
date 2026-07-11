---
id: sd-011
service: stellar-docs
status: verified
discovered: 2026-07-10
evidence:
  - stellar/go protocols/horizon/effects source at aab2ea4 marks offer-created/updated/removed effect types unused
  - live successful manage-buy-offer operation 272376861589106689 returned zero effects while TransactionResult XDR contained the updated OfferEntry
  - removed offer 1848272936 returned 404 while its offer-trades endpoint retained two trades
  - Solo scratchpad 575 GT-17 primary process 3247 and independent blind process 3248
---

## Finding

The current Stellar documentation surface can lead a bot author to rely on
Horizon `offer_created`, `offer_updated`, and `offer_removed` effects for SDEX
offer lifecycle tracking. Current `stellar/go` marks effect types 30/31/32
unused, and a live successful offer update returned no Horizon effects even
though its transaction result carried the updated `OfferEntry`.

The same documentation context does not clearly teach the full current-state
versus history boundary: an immediately filled offer may receive no real Core
offer ID, Horizon trade resources can use a synthetic operation-derived ID, and
a removed offer can 404 while `/offers/{id}/trades` still returns history.
Classic offers do not expire at the protocol level.

## Evidence

On 2026-07-10, manage-buy-offer operation `272376861589106689` successfully
updated offer `1847875879`. Its Horizon effects collection was empty, while
decoded TransactionResult XDR contained the updated offer entry. Separately,
offer `1848272936` returned 404 after fills while its offer-trades endpoint
returned two trades.

Current source corroborates the behavior:

- `stellar/go/protocols/horizon/effects/main.go` comments offer effect types
  30/31/32 as unused while trade effect 33 remains active;
- `stellar/go/toid/synt_offer_id.go` explains synthetic IDs for immediately
  filled offers; and
- stellar-core result XDR records CREATED/UPDATED/DELETED plus claimed offers.

This is a docs-content/behavior gap, not an Algolia ranking issue.

## Recommendation

Update the SDEX offer lifecycle and Horizon effect documentation to:

- explicitly mark offer-created/updated/removed effects unused in current
  Horizon;
- make transaction result XDR/meta the authoritative source for create,
  update, delete, and claimed-offer transitions;
- distinguish current open-offer endpoints from trade history;
- document immediate fills and synthetic trade offer IDs;
- show cursor/reconnect handling and path-payment trade correlation; and
- state that Classic offers do not expire, while client cancellation and
  Horizon retention/indexing are separate concerns.

Add a runnable example that creates or updates an offer, decodes the result,
reconciles current `/offers` state, and follows `/trades` history without
depending on unused effect types.
