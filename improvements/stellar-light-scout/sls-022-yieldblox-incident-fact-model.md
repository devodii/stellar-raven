---
id: sls-022
service: stellar-light-scout
status: reported-upstream
discovered: 2026-07-10
evidence:
  - live searchResearch incident query returned row 6a32d6de60958975da632755
  - row dates the incident to May 2026, calls the completed drain attempted/contained, and renders the XLM quantity as $61 million in XLM
  - primary operator disclosures and on-chain records place the drain on 2026-02-22 with material loss before partial quarantine and later remediation
  - Solo scratchpad 575 GT-09 primary process 3226
  - https://github.com/Stellar-Light/stellarlight/issues/513
---

## Finding

Scout's YieldBlox incident research record conflates event and publication
dates, token quantity and dollar valuation, and distinct incident states. The
live row presents a May 2026 attempted event contained before significant loss
and describes "$61 million in XLM." Primary and on-chain evidence instead
places the completed drain on February 22, 2026, with 61,249,278.3064502 XLM
borrowed plus approximately 1,014,196.7040837 USDC.

May 20/22 are retrospective publication dates. Validator-layer transaction
filtering later quarantined about 48 million XLM, but quarantine is not
recovery. Supplier and backstop remediation completed on separate dates with
documented exclusions; that does not prove attacker-held funds were returned.

## Evidence

The live read-only reproduction was:

    scout.searchResearch({
      q: "YieldBlox Reflector USTRY oracle manipulation incident",
      source: "incident",
      limit: 5
    })

It returned incident row 6a32d6de60958975da632755 with the defects above.
Operator notices/postmortem, remediation records, Reflector disclosures,
independent Blockaid/BlockSec reporting, and on-chain transactions establish
the February event and separate amounts/states.

The affected component was a community-managed YieldBlox Blend V2 pool that
accepted a manipulated market-derived USTRY/USDC value propagated through
Reflector Pulse. The evidence does not establish a Reflector, Blend core, or
Stellar protocol contract exploit.

## Recommendation

Represent incident facts structurally:

- eventDate = 2026-02-22;
- sourcePublishedAt as a separate field for May retrospectives;
- token quantities with asset codes, separate from dated USD valuations;
- completedDrain, quarantine, supplierRemediation, backstopRemediation, and
  attackerRecovery as separate states;
- affected pool, lending contracts, oracle/feed, issuer asset, validators, and
  Stellar protocol as separate entities/roles.

Regression assertions should reject "May incident," "$61M XLM," "attempted,"
"before significant losses," and any equation of quarantined with recovered.
