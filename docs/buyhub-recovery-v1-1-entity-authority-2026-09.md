# BuyHub Recovery V1.1 — Entity / Authority Recovery

Date: 2026-09-25 (Asia/Bangkok)
Latest finalized GSC date used: 2026-09-22

## GSC reality

Latest 7 days (2026-09-16 → 2026-09-22):
- 0 clicks
- 1 impression
- CTR 0%
- Avg position 10

Latest 28 days (2026-08-26 → 2026-09-22):
- 0 clicks
- 5 impressions
- CTR 0%
- Avg position 22.2

Recovery V1 deployed 2026-09-18 and is live. Production sitemap contains 149 URLs, within the V1 gate of 100–170. Robots, canonical, static HTML, and Vercel deployment are healthy.

## Root cause found in V1.1

BuyHub's LocalBusiness schema still carried a stale/unsupported Khon Kaen storefront identity:
- 99/9 ถนนมิตรภาพ ตำบลในเมือง อำเภอเมืองขอนแก่น
- latitude 16.4322 / longitude 102.8236
- generic Google Maps geo link

This contradicted the verified storefront source used by amphon.co.th:
- บริษัท อำพล เทรดดิ้ง จำกัด
- 740/8 ถนนชยางกูร ตำบลในเมือง อำเภอเมืองอุบลราชธานี อุบลราชธานี 34000
- 15.2664215 / 104.844358
- verified map URL from the Amphon site configuration

BuyHub and amphon.co.th also had no source-level links to each other, so search engines received weak evidence that BuyHub is a service channel operated by the same business.

## V1.1 actions

- align BuyHub LocalBusiness address/geo/map with the Amphon source of truth
- align physical-store schema opening hours to 09:00–21:00
- remove unsupported BuyHub foundingDate
- add BuyHub Organization.parentOrganization = บริษัท อำพล เทรดดิ้ง จำกัด
- add a visible ownership/operator statement on /เกี่ยวกับเรา
- add a branded link from BuyHub to https://amphon.co.th
- add one contextual, branded BuyHub link from the amphon.co.th homepage ecosystem section
- add QA assertions that prevent the stale Khon Kaen storefront identity from returning
- add /buyhub-recovery-v1-1.json production fingerprint

## Guardrails

- no new indexable landing pages
- no additional noindex batch
- no title/H1 rewrites
- no canonical changes to money pages
- no sitemap expansion
- no sitewide cross-domain footer link
- no exact-match cross-domain anchor campaign
- keep Recovery V1 sitemap at 149 URLs

## Next measurement

Do not judge V1.1 from partial data before Google has time to recrawl both sites.
Use finalized GSC through at least 2026-10-02 for the first signal check.
Use 14 finalized days after V1.1 before considering another index reduction.
