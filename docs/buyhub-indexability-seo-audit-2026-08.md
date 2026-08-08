# BuyHub Thai — Full Forensic SEO / Indexability / Ranking Audit

**Site:** https://buyhubthai.com/  
**Audit date:** 2026-08-08  
**Auditor role:** Senior Technical SEO + Astro + Search Quality + AEO/GEO  
**Method:** Source inventory + production HTTP verification (no GSC export available)

---

## Final Verdict

**FAIL (Indexation quality) / PASS WITH WARNING (Core technical hygiene)**

- Core technical blockers (robots disallow, total noindex, broken sitemap, client-only content) are **not** the primary failure mode.
- Primary failure mode is **quality indexation + crawl dilution + near-duplicate programmatic inventory**, compounded by **site youth / low discovery authority**.
- Confirmed Indexed count from Google Search Console: **N/A — OWNER DATA REQUIRED**

---

## PHASE 0 — Safety / Baseline / Repository

| Item | Value |
|------|--------|
| Branch | `main` |
| Working tree | clean |
| Local HEAD | `0ba4cab31d7da78979e95ab747405ad92d2d13db` |
| `origin/main` | `0ba4cab31d7da78979e95ab747405ad92d2d13db` |
| Remote | `https://github.com/noteroru2/buyhubthai.git` |
| Uncommitted / untracked | none at audit start |
| Astro | `^6.3.1` (lock resolves ~6.3.1) |
| Node | `v22.20.0` (engines `>=22.12.0`) |
| Package manager | npm (`11.8.0`) |
| Output mode | **Static SSG** (no SSR adapter) |
| Deploy | **Vercel** (production headers) |
| Integrations | `@astrojs/sitemap`, Tailwind v4 via Vite |
| `site` | `https://buyhubthai.com` |
| `trailingSlash` | `never` |
| Middleware | **none** |
| Content collections | `blog` (28), `sell` (27), `areas` (20) |
| Recent SEO commit | `0ba4cab` — noindex local seoSlug + sitemap shrink + trailing slash + fake Maps CID removed |

### Production SHA match

| Signal | Evidence |
|--------|----------|
| Production sitemap URL count | **1946** |
| Expected post-`0ba4cab` sitemap | **~1946** |
| Trailing-slash `/รับซื้อ-iphone/` | **308 → non-slash** |
| Local seoSlug robots | `noindex,follow` on production sample |
| Fake Maps CID `1234567890…` | **absent** on production samples |
| Homepage `Last-Modified` | 2026-08-07 (prior deploy); SEO pages show 2026-08-08 |

**Production Matches Main (SEO-critical behaviors):** YES (behavioral match; exact deploy SHA not exposed by Vercel)

---

## PHASE 1 — Complete URL Inventory (Source)

### Totals

| Bucket | Count | Notes |
|--------|------:|-------|
| Source route files (`src/pages/**/*.astro`) | 94 | templates, not final URLs |
| **All generated URLs** | **6,707** | static + dynamic + EN aliases |
| **Indexable (by meta robots intent)** | **1,946** | Thai pages without noindex |
| **Noindex** | **4,761** | 4,680 seoSlug locals + 81 EN aliases |
| **Sitemap (production)** | **1,946** | matches indexable set after filter |
| English alias / soft-redirect | 81 | meta refresh + Thai canonical + noindex |
| Orphan candidates | High for programmatic | see Phase 12 |

### Dynamic generators

| Route | Pages | Index intent |
|-------|------:|--------------|
| `[seoSlug].astro` hubs | 234 | indexable |
| `[seoSlug].astro` locals | 4,680 | **noindex,follow** |
| `[sellRoute].astro` | 80 | indexable |
| `รับซื้อ/[product]/[topic]` | 324 | indexable |
| `รับซื้อ/[product]/[province]/[topic]` | 1,200 | indexable |
| `บทความ/[slug]` | 28 | indexable |
| EN `blog`/`sell`/`service-area` | 75 + 6 | noindex |

### Critical inventory mismatch

| Metric | Count |
|--------|------:|
| Source total URLs | 6,707 |
| Indexable | 1,946 |
| Sitemap | 1,946 |
| **Topic + area-topic share of sitemap** | **1,524 / 1,946 = 78.3%** |

**Immediate flag:** Sitemap is dominated by support/topic programmatic URLs, not money pages. This is a crawl-budget and quality-indexation risk even after local seoSlug noindex.

---

## PHASE 2 — Production Crawl (samples)

Verified live 2026-08-08 via HTTP fetch:

| Path | Status | robots | Canonical self? | H1 in HTML |
|------|-------:|--------|-----------------|------------|
| `/` | 200 | (none) | yes | yes |
| `/รับซื้อ-iphone` | 200 | (none) | yes | yes |
| `/รับซื้อโน๊ตบุ๊คมือสอง` | 200 | (none) | yes | yes |
| `/รับซื้อ-macbook` | 200 | (none) | yes | yes |
| `/รับซื้อการ์ดจอ` | 200 | (none) | yes | yes |
| `/รับซื้อจอคอม` | 200 | (none) | yes | yes |
| `/รับซื้อ-server-มือสอง` | 200 | (none) | yes | yes |
| `/รับซื้อ-server-มือสอง-ขอนแก่น` | 200 | **noindex,follow** | yes | yes |
| `/รับซื้อ/iphone/เช็กราคาก่อนขาย` | 200 | (none) | yes | yes |
| `/รับซื้อ/iphone/บุรีรัมย์/เช็กราคาก่อนขาย` | 200 | (none) | yes | yes |
| `/รับซื้อ-iphone-บุรีรัมย์` | 200 | (none) | yes | yes |
| `/พื้นที่ให้บริการ/ขอนแก่น` | 200 | (none) | yes | yes |
| `/about` | 200 | noindex,follow | points Thai | redirect copy |
| unknown path | **404** | — | — | plain text body |

### Render model

- Astro SSG: **main content, H1, internal `<a href>`, JSON-LD present in raw HTML**
- Not dependent on client hydration for primary content
- `X-Robots-Tag`: **none** on sampled pages

---

## PHASE 3 — Robots / Indexability

### `robots.txt` (production)

```
User-agent: *
Allow: /

Sitemap: https://buyhubthai.com/sitemap-index.xml
```

| Check | Result |
|-------|--------|
| Disallow: / | No |
| Blocks on Thai money paths | No |
| Per-bot AI crawler policy | None (default Allow) |
| Sitemap absolute URL | Yes |
| X-Robots-Tag sitewide | Not observed |

**Conclusion:** Robots.txt is **not** the cause of low indexation.

Noindex is intentional on EN aliases + seoSlug locals only.

---

## PHASE 4 — XML Sitemap Forensics

| Check | Result |
|-------|--------|
| `/sitemap-index.xml` | 200, `application/xml` |
| `/sitemap-0.xml` | 200, **1946** `<loc>` |
| robots points correctly | Yes |
| Staging URLs | None found |
| EN aliases in sitemap | Excluded by filter |
| seoSlug locals in sitemap | Excluded |
| **Noindex URLs in sitemap** | **None found for seoSlug locals / EN** |
| **Indexable topic URLs in sitemap** | **1,524 (78.3%)** — quality concern, not validity error |
| lastmod | Astro sitemap default (treat as low confidence / often build-correlated) |

### Diff summary

| Set | Count |
|-----|------:|
| INDEXABLE | 1,946 |
| SITEMAP | 1,946 |
| INDEXABLE_NOT_IN_SITEMAP | ~0 (by design after `0ba4cab`) |
| SITEMAP_BUT_NOT_INDEXABLE | ~0 (seoSlug locals removed) |
| SITEMAP_REDIRECT / 404 | Not found in sampled critical money URLs |

---

## PHASE 5 — Canonical Forensics

| Pattern | Status |
|---------|--------|
| Global layout canonical | `buildCanonicalUrl()` → absolute, **no trailing slash** |
| Money page samples | self-canonical |
| EN aliases | canonical → Thai target (correct for soft alias) |
| Fake homepage canonical on all pages | **Not observed** |
| www/http mismatch in canonical | **Not observed** (host consolidates to https://buyhubthai.com) |

**Canonical is not the primary low-index root cause** after trailing-slash fix.

Residual risk: soft EN aliases still return **200** (meta refresh) rather than HTTP 301 — mitigated by noindex + sitemap exclusion.

---

## PHASE 6 — Google Search Discovery (`site:`)

`site:buyhubthai.com` / `site:buyhubthai.com รับซื้อ` used as **discovery signal only**.

- Homepage appears in web search snippets.
- **Do not treat `site:` hits as Indexed count.**
- Confirmed Indexed URLs: **N/A (GSC required)**

---

## PHASE 7 — Google Search Console

**OWNER DATA REQUIRED — GSC**

No GSC export / API credentials found in repository or docs.

Please export / share:

1. Page Indexing → reasons breakdown + example URLs  
2. Sitemap status (discovered vs submitted)  
3. Crawl Stats (last 90 days)  
4. Performance (queries/pages) CSV  
5. Removals / temporary noindex if any  

Until then: **do not fabricate Indexed / Not indexed counts.**

User-reported ~25 indexed pages (conversation context) is **unverified** against GSC in this audit.

---

## PHASE 8 — Content Quality / Helpfulness

### Architecture quality pattern

| Page type | Original value | Template risk | Notes |
|-----------|----------------|---------------|-------|
| Static money pages (ComboPage + editorial) | Medium–Strong | Medium | Editorial sections + product narratives |
| Province money (hardcoded 4 cores + sellRoute) | Medium | High local swap | District lists help somewhat |
| seoSlug hubs (234) | Weak–Medium | **Very High** | 6 category content matrices + keyword swap |
| seoSlug locals (4680) | Weak | **Doorway-class** | Already noindex (good) |
| Topic national (324) | Weak–Medium | **High** | Topic angles × product profile |
| Topic area (1200) | Weak | **Very High** | product × province × topic swap |
| Blog (28) | Stronger | Lower | Unique markdown bodies |
| Trust pages | Medium | Low | About/reviews/works |

### Similarity / uniqueness QA coverage

`scripts/check-page-cluster-uniqueness.mjs` covers: sell, sell-support, sell-area-support, area.  
**Does not cover `[seoSlug]` cluster.**  

Even if paragraph uniqueness checks pass thresholds, **SERP information gain** for brand-variant keywords (Server Dell vs Server HP) remains low.

### Scoring (representative, not every URL)

| Type | Est. avg /100 | Band |
|------|--------------:|------|
| Homepage | 78 | Improve |
| Core money (iPhone/MacBook/Notebook) | 72–80 | Improve–Strong |
| seoSlug hub | 55–65 | Weak–Critical |
| Topic/area-topic | 50–62 | Critical–Weak |
| Blog | 70–82 | Improve–Strong |
| Trust | 68–76 | Improve |

---

## PHASE 9 — Search Intent Architecture

### Intent map (simplified)

| Intent | Primary URL (should be) | Competing layers |
|--------|-------------------------|------------------|
| รับซื้อ iPhone | `/รับซื้อ-iphone` | topics, province money, seoSlug variants historically |
| รับซื้อโน๊ตบุ๊ค | `/รับซื้อโน๊ตบุ๊คมือสอง` | topics, province, synonyms excluded from seoSlug |
| รับซื้อ MacBook | `/รับซื้อ-macbook` | topics, province, MacBook Pro/Air seoSlug excluded |
| Local iPhone ขอนแก่น | `/รับซื้อ-iphone-ขอนแก่น` | area hub, area-topic×12 |
| Local iPhone บุรีรัมย์ | `/รับซื้อ-iphone-บุรีรัมย์` | `/รับซื้อ/iphone/บุรีรัมย์/{12 topics}` |
| Informational pricing | `/บทความ/...` | topic “เช็กราคาก่อนขาย” pages |

### Cannibalization matrix (severity)

| Query | Primary | Competing | Severity |
|-------|---------|-----------|----------|
| รับซื้อ iPhone | `/รับซื้อ-iphone` | `/รับซื้อ/iphone/*` (12) | **High** |
| รับซื้อ iPhone บุรีรัมย์ | `/รับซื้อ-iphone-บุรีรัมย์` | 12 area-topic URLs | **Critical** |
| รับซื้อ Server มือสอง | `/รับซื้อ-server-มือสอง` | many brand seoSlug hubs | **High** |
| รับซื้อสินค้าไอที ขอนแก่น | `/พื้นที่ให้บริการ/ขอนแก่น` | product-province pages | Medium |

---

## PHASE 10 — Money Page Audit (summary)

Core money pages exist, are indexable, self-canonical, and linked from homepage + footer.

Strengths:
- Clear transactional H1/title
- Process + LINE CTA in HTML
- FAQ + Service schema on ComboPage
- Longform editorial on many sell pages

Gaps vs SERP fitness:
- Limited live price bands / real transaction examples (OWNER evidence needed — do not invent)
- GBP / Maps entity weak (geo coordinate only)
- Internal authority diluted by 1,524 topic URLs
- Some claims (10+ years, exact street address) need verification

---

## PHASE 11 — Title / Meta / H1

Sampled money pages: title ≈ H1 intent, descriptions present, single H1 observed.

Risks:
- Programmatic titles follow rigid templates (`ประเมินราคาฟรี…`) → SERP sameness
- Topic titles often `{product} {topic}` / `{product} {province} {topic}` → overlap with money titles
- Full duplicate-title crawl across 1,946 URLs: **not fully enumerated in this pass** (recommend automated script in Phase 29)

---

## PHASE 12 — Internal Linking / Crawl Depth

| Observation | Evidence |
|-------------|----------|
| Nav links | Home, รับซื้อ hub, areas, process, blog, contact |
| Footer money links | ~8 products + hub |
| seoSlug hubs | Weak in-links (mostly sitemap / incidental) |
| Topic pages | Generated cross-links in data helpers; still compete with money pages |
| Province list in footer | Hub only, not 20 provinces |
| HTML `<a href>` | Used for CTAs (good) |

**Orphan / near-orphan risk:** High for seoSlug hubs + long-tail topic URLs.  
Money pages are reachable (depth 1–2). Programmatic pages often depth 2–4 via sitemap-first discovery.

---

## PHASE 13 — Astro Technical SEO

| Item | Status |
|------|--------|
| `site` set | OK |
| Sitemap integration + filters | OK (after decodeURI fix) |
| `trailingSlash: never` + Vercel redirect | OK |
| Layout SEO conflict | Low (robots optional prop) |
| SSG HTML completeness | OK |
| Prefetch / toolbar | Dev toolbar disabled |

---

## PHASE 14 — Host Consolidation

| URL | Result |
|-----|--------|
| `http://buyhubthai.com/` | **308 → https://buyhubthai.com/** |
| `https://www.buyhubthai.com/` | **301 → https://buyhubthai.com/** |
| Trailing slash pages | **308 → non-slash** |

Host consolidation: **PASS**

---

## PHASE 15 — Status / Soft 404

| Check | Result |
|-------|--------|
| Unknown URL | HTTP **404** (good) |
| Custom HTML 404 | **Missing** (plain text) — P3 UX/brand |
| Soft 404 money pages | Not observed on samples |

---

## PHASE 16 — Core Web Vitals

**Not fully measured with Lighthouse/CWV lab in this audit pass.**

Qualitative:
- Static HTML, compressed
- Category WebP images for seoSlug
- LINE dock / FAB always present (mobile INP risk candidate)
- Homepage HTML ~225KB — watch LCP hero

**OWNER / next step:** PageSpeed + CrUX / GSC CWV if available.

---

## PHASE 17 — Structured Data

Always injected via `BaseLayout`: Organization, LocalBusiness, WebSite.  
Combo/money pages add BreadcrumbList, Service, FAQPage.

| Issue | Severity | Notes |
|-------|----------|-------|
| `streetAddress: 99/9 ถนนมิตรภาพ…` | **P1 Trust** | Looks placeholder-like — **OWNER INPUT REQUIRED** |
| `hasMap` geo query only | P2 | Not a verified GBP URL |
| sameAs LINE + Facebook | OK | Maps removed from sameAs (good) |
| Fake AggregateRating | Not found | Good |
| FAQ visible vs schema | Appears aligned on ComboPage | Good |

---

## PHASE 18 — AEO

Money/trust pages have FAQ + process steps — decent AEO baseline.  
Programmatic pages answer thinly with keyword insertion — weak citability.  
Direct answers exist for “ประเมินฟรีไหม / ต้องเตรียมอะไร” but often generic across SKUs.

---

## PHASE 19 — GEO (Generative Engine Optimization)

Entity clarity: BuyHub = IT buyback, Isan-focused, LINE @buyhub, phone present.  
Risks: address authenticity, missing GBP, thin brand-variant pages reduce citability.  
AI crawlers: currently allowed via `Allow: /` — no special blocks; no recommendation to open more without policy decision.

---

## PHASE 20 — Local SEO

- 20 province area pages + product-province combinations.
- Coverage language is “พื้นที่ให้บริการ / นัดรับ” oriented — good if accurate.
- **Do not claim branches** without proof — site generally avoids “สาขา” as GBP claim; some editorial mentions “สาขา” in logistics sense for corporate lots (**monitor wording**).
- NAP: phone consistent; address in schema needs owner confirmation.

---

## PHASE 21 — Trust / E-E-A-T

| Claim | Status |
|-------|--------|
| LINE @buyhub / phone | Present consistently |
| Facebook buyhubthai | Present |
| Reviewer “คุณอำพล” CEO / 10+ years | **PLAUSIBLE BUT UNSOURCED** — OWNER CONFIRM |
| Street address 99/9… | **NEEDS OWNER CONFIRMATION** |
| Real work photos | Pages exist (`ผลงานรับซื้อจริง`) — authenticity not independently verified here |
| Fake reviews invent | Not introduced by this audit |

---

## PHASE 22 — Duplication / AI Footprint

High-repeat phrases (expected CTA vs body):

- “ประเมินราคาฟรีจากรูป”
- “แจ้งราคาก่อนตัดสินใจขาย”
- “โอนเงินทันที”
- “LINE @buyhub”

Acceptable in CTA bands; problematic when they dominate body across 1,500+ topic URLs and 234 seoSlug hubs.

**Top duplicate clusters (architectural):**

1. Area-topic cluster (1,200)  
2. National topic cluster (324)  
3. seoSlug category templates (234 hubs; 4,680 locals already noindex)  
4. sellRoute province templates (80)

---

## PHASE 23 — Page Type Quality Summary

| Page type | Count (indexable) | Avg quality | Critical? |
|-----------|------------------:|-------------|-----------|
| Homepage/trust/utility | ~15 | Improve | No |
| Core money static | ~30 | Improve–Strong | No |
| Province money | 100 | Improve/Weak | Partial |
| Area hubs | 21 | Improve | No |
| Blog | 29 | Stronger | No |
| seoSlug hubs | ~234 | Weak | **Yes** |
| Topic national | 324 | Weak | **Yes** |
| Topic area | 1,200 | Critical | **Yes** |

---

## PHASE 24 — Content Indexation Strategy

| Class | Recommendation | Approx URLs |
|-------|----------------|------------:|
| **A — MUST INDEX** | Home, core money, 4-core province money, area hubs, trust, key blogs | ~80–120 |
| **B — SHOULD INDEX** | Strong sellRoute provinces for top 5 products; select seoSlug hubs with real demand | curated |
| **C — IMPROVE BEFORE INDEX** | Remaining seoSlug hubs; national topics that add unique prep value | hundreds |
| **D — NOINDEX** | seoSlug locals (done); **area-topic 1,200**; weak national topics | 1,200+ |
| **E — MERGE** | Synonym money intents (partially done via exclusions) | ongoing |
| **F — REMOVE/REDIRECT** | Only after backlink/GSC check — not now | TBD |

Goal: **Quality indexation**, not maximum URL count.

---

## PHASE 25 — Root Causes of Low Indexation

### TOP ROOT CAUSES (ranked)

#### P0 — Crawl budget flooded by near-duplicate topic URLs
- **Evidence:** 1,524 / 1,946 sitemap URLs (78.3%) are `/รับซื้อ/{product}/…` topic clusters; template generation from `sellSupportPages` / `sellAreaSupportPages`.
- **Affected:** ~1,524 indexable URLs + dilution of money-page crawl.
- **Confidence:** High
- **Impact:** Google selectively indexes; money pages compete with support sprawl.
- **Fix:** noindex (+ sitemap exclude) area-topic; prune/noindex weak national topics; keep money pages as primary.

#### P0 — Site age + sudden large inventory (discovery lag)
- **Evidence:** Production deploy timestamps around 2026-08; editorial dates 2026-05; inventory jumped to thousands of URLs.
- **Affected:** Whole domain.
- **Confidence:** High (as contributing factor)
- **Impact:** Slow discovery/indexation even for valid URLs.
- **Fix:** Reduce indexable surface; strengthen internal links; request indexing for Tier-1 only; wait + monitor GSC.

#### P1 — Programmatic seoSlug hubs still thin / low information gain
- **Evidence:** `[seoSlug].astro` category matrix (6 buckets) × 234 keywords; uniqueness QA does not cover this cluster.
- **Affected:** 234 indexable hubs (+ previously 4,680 locals — now noindex).
- **Confidence:** High
- **Impact:** Crawled-not-indexed / soft quality suppression likely.
- **Fix:** Keep only keywords with demand; enrich or noindex the rest; link hubs from relevant money hubs.

#### P1 — Weak internal discovery for non-nav URLs
- **Evidence:** Footer/nav expose ~8 money URLs; most programmatic URLs sitemap-dependent.
- **Affected:** Majority of 1,946 indexable URLs.
- **Confidence:** High
- **Impact:** Slow crawl of long-tail; Google may ignore low-priority URLs.
- **Fix:** Hub → money → selective supporting links; avoid dumping all keywords in footer.

#### P1 — Intent cannibalization across layers
- **Evidence:** For one product+province: money URL + 12 area-topic URLs (+ area hub).
- **Affected:** Top commercial/local queries.
- **Confidence:** High
- **Impact:** Indexing of “wrong” URL or none; ranking volatility.
- **Fix:** One primary URL per intent; supporting URLs noindex or consolidate.

#### P2 — Soft EN aliases (200 + meta refresh)
- **Evidence:** `/about` etc. return 200 with noindex + Thai canonical.
- **Affected:** 81 URLs.
- **Confidence:** High
- **Impact:** Minor crawl waste; low index risk due to noindex.
- **Fix:** HTTP 301 in `vercel.json`.

#### P2 — Entity / Maps / address trust gap
- **Evidence:** Schema address `99/9…`; Maps is lat/lng query; no verified GBP URL in code.
- **Affected:** Local + entity understanding.
- **Confidence:** Medium–High (address authenticity unknown)
- **Impact:** Local/GEO trust & ranking.
- **Fix:** OWNER provides real NAP/GBP; then update schema/sameAs/hasMap.

#### P3 — Plain-text 404
- **Evidence:** Unknown path returns text/plain 404.
- **Impact:** Low on indexation.
- **Fix:** Custom 404.astro later.

### Not root causes (ruled out)

- robots.txt blocking  
- Missing sitemap  
- Sitewide accidental noindex  
- Client-JS-only content  
- Canonical-to-homepage bug (samples)  
- www/http host split (fixed by redirects)

---

## PHASE 26 — Ranking Root Causes (separate from indexing)

1. **Support-page cannibalization** of money intents  
2. **Thin programmatic content** loses to stronger buyback competitors  
3. **Internal PageRank dilution** across 1,500+ weak URLs  
4. **Entity/trust gap** (GBP/address/proof)  
5. **SERP CTR sameness** (templated titles)  
6. **Authority/backlinks** — unknown (no link dataset; OWNER/GSC/Ahrefs needed)  
7. **Information gain gaps** on money pages (live comps, real process constraints)  

---

## SEO SCORES (audit estimate)

| Dimension | Score |
|-----------|------:|
| Technical SEO | 78 |
| On-page SEO | 68 |
| Content Quality | 52 |
| Internal Linking | 55 |
| Local SEO | 58 |
| AEO | 62 |
| GEO | 55 |
| Trust/E-E-A-T | 57 |
| **Overall** | **58** |

---

## MOST IMPORTANT ANSWER (TH)

### สาเหตุหลักที่ Google Index buyhubthai.com น้อยคืออะไร?

**ไม่ใช่เพราะ robots บล็อก หรือ sitemap พัง** — production robots เปิด, sitemap 200 และมี 1,946 URL

สาเหตุหลักคือ **คุณภาพและความหนาแน่นของหน้า programmatic ที่ indexable ยังท่วม crawl budget** โดยเฉพาะ **หน้า topic/area-topic ~1,524 URL (78% ของ sitemap)** ที่เป็นเนื้อหาใกล้เคียงกันสูง บวกกับ **โดเมนยังใหม่ / inventory พุ่งเร็ว** ทำให้ Google เลือก index เฉพาะหน้าหลักที่มีสัญญาณชัด และละเว้นส่วนใหญ่ (Crawled/Discovered not indexed — ต้องยืนยันใน GSC)

แยกประเภท:

1. **Technical:** โดยรวมผ่านหลังแก้ trailing slash / noindex local seoSlug — ไม่ใช่ blocker หลัก  
2. **Content Quality:** เป็นตัวการหลักบน programmatic clusters  
3. **Crawl/Discovery:** sitemap ใหญ่แต่คุณภาพต่ำ → งบ crawl กระจายผิดที่; internal link อ่อน  
4. **Canonical/Duplicate:** canonical หลัก ๆ ถูกแล้ว; ปัญหาคือ **near-duplicate indexable set** ไม่ใช่ canonical พัง  
5. **Search Intent:** หลาย URL แย่ง intent เดียวกัน  
6. **Authority/Trust:** entity/GBP/address ยังอ่อน — ฉุด ranking มากกว่า index โดยตรง  

### ถ้าแก้ได้เพียง 5 เรื่อง ควรแก้อะไรก่อน?

1. **ตัด/noindex หน้า area-topic 1,200 URL (+ พิจารณา national topic ที่อ่อน)** — คืน crawl budget ให้ money pages  
2. **กำหนด Primary URL ต่อ intent** แล้วลด cannibalization (money vs topic)  
3. **เสริม internal links ไป money pages จริง** จาก hub/area/blog — ไม่พึ่ง sitemap อย่างเดียว  
4. **คัด seoSlug hubs** เหลือเฉพาะคำที่มี demand + เนื้อหาต่างจริง  
5. **ยืนยัน NAP/GBP + ส่ง GSC export** แล้ว request indexing เฉพาะ Tier-1  

---

## PHASE 27 — Fixes implemented in this session (post-audit)

| Fix | Evidence basis | Status |
|-----|----------------|--------|
| `noindex,follow` on `/รับซื้อ/[product]/[topic]` (324) | P0 crawl dilution + cannibalization | **CODE DONE** (build verified) |
| `noindex,follow` on `/รับซื้อ/[product]/[province]/[topic]` (1,200) | P0 | **CODE DONE** |
| Sitemap exclude via `isSellSupportTopicPage()` | P0 | **CODE DONE** — dist sitemap **422** URLs (was 1,946) |
| Vercel 301 for EN hub aliases (`/about`, `/blog`, …) | P2 soft redirects | **CODE DONE** (sell/service-area slug maps still soft) |

### Dist validation (local build)

- Pages built: 6,707
- Sitemap URLs: **422**
- Sample topic page contains `meta name="robots" content="noindex,follow"`
- Money pages remain without noindex

---

## IMPLEMENTATION (release batch)

| Item | Before | After (local build) |
|------|--------|---------------------|
| Sitemap URLs | ~1,946 | **422** |
| Indexable (robots intent) | ~1,946 | **~422** primary surface in sitemap; topics noindex |
| Noindex topic pages | 0 | **1,524** (kept live, not deleted) |
| Money pages accidentally noindexed | — | **0** (allowlist gate PASS) |
| Nested topic leak in sitemap | 1,524 | **0** |
| EN hub redirects | soft meta refresh | **301** via `vercel.json` |
| Slug `&` safety (`Bang & Olufsen`) | broken HTML href truncation | sanitized slug |
| Broken JBL/Marshall blog hrefs | missing articles | retargeted to money pages |

### Safety gate (local)

- 33 money/trust/location allowlist URLs: indexable + in sitemap + H1
- 1,524 topic dist pages: noindex + excluded from sitemap
- `check:seo`: OK 6707
- `check:links`: OK 6707
- Filter unit tests: PASS

### Local sitemap composition (422)

| Type | Count |
|------|------:|
| Homepage | 1 |
| Sell hub | 1 |
| Money / seoSlug hubs (`/รับซื้อ…` dash form) | 255 |
| Province money | 100 |
| Area | 21 |
| Blog | 29 |
| Trust/utility | 9 |
| Other (e.g. รับเหมา*) | 6 |
| Nested topic leak | **0** |

---

## DEPLOYMENT

| Field | Value |
|-------|--------|
| Initial SHA | `0ba4cab31d7da78979e95ab747405ad92d2d13db` |
| Commit SHA | `58aa62afb738a80a9645c4306cef730db4f92a4e` |
| Origin/Main SHA | `58aa62afb738a80a9645c4306cef730db4f92a4e` |
| Production SHA | **NOT ATTESTED** (no Vercel/GitHub Deployments API access in this environment) |
| Production Matches Main | **YES (behavioral)** — sitemap count, topic noindex, money indexability, EN redirects match release |

Pushed: `0ba4cab..58aa62a` → `origin/main` (no force push)

---

## PRODUCTION VERIFICATION (2026-08-08)

| Check | Result |
|-------|--------|
| `robots.txt` | `Allow: /` + sitemap absolute URL |
| Production sitemap count | **422** (matches local) |
| Topic leak in sitemap | **0** |
| Money pages (13 sampled) | 200, indexable, H1 present |
| Topic pages (10 sampled) | 200, `noindex,follow`, not deleted |
| Location pages (5) | 200, indexable |
| Trust/blog hubs (5) | 200, indexable |
| EN hubs (`/about` etc.) | **308 permanent** → Thai targets (Vercel permanent redirect) |
| Sitemap sample URLs | 200 + not noindex |
| Money accidentally noindexed | **0** |

---

## POST-DEPLOY BASELINE

| Metric | Pre-deploy prod | Post-deploy prod |
|--------|----------------:|-----------------:|
| Sitemap count | 1,946 | **422** |
| Topic sample robots | indexable | **noindex,follow** |
| Money sample robots | indexable | indexable |
| EN `/about` | 200 soft | **308 → Thai** |

**Expectation:** Google must recrawl before Page Indexing counts change. No ranking guarantee. Do not delete the 1,524 topic pages until GSC URL-level analysis exists.

---

## GSC OWNER ACTION REQUIRED

1. Resubmit `https://buyhubthai.com/sitemap-index.xml`
2. URL Inspection → homepage
3. Inspect primary money pages (max ~10): iPhone, iPad, MacBook, notebook, desktop, camera, GPU, monitor, corporate-IT, PS5
4. Inspect 2–3 topic URLs → confirm Google sees `noindex`
5. Monitor Page Indexing (Crawled/Discovered not indexed)
6. Export Page Indexing + Performance CSVs for next batch

**Do not** request indexing for all ~422 URLs at once.

### Tier-1 Request Indexing candidates

- `/`
- `/รับซื้อ-iphone`
- `/รับซื้อ-ipad`
- `/รับซื้อ-macbook`
- `/รับซื้อโน๊ตบุ๊คมือสอง`
- `/รับซื้อคอมพิวเตอร์มือสอง`
- `/รับซื้อกล้อง`
- `/รับซื้อการ์ดจอ`
- `/รับซื้อจอคอม`
- `/รับซื้อคอมบริษัท`

---

## BATCH — SEO SLUG / INTENT / INTERNAL LINKING (2026-08-08)

### Classification (234 seoSlug hubs verified)

| Action | Count | Treatment |
|--------|------:|-----------|
| KEEP INDEX | **73** | indexable + in sitemap |
| MERGE | **71** | `noindex,follow` + canonical → primary money + out of sitemap |
| NOINDEX | **90** | `noindex,follow` + canonical → parent when known + out of sitemap |
| IMPROVE | 0 | kept as KEEP with later enrichment backlog |
| OWNER REVIEW | 0 | needs GSC |

Artifacts: `docs/seoslug-classification.json`, `src/lib/seoSlugPolicy.ts`, `src/data/seoSlugHubIndexPolicy.mjs`

### Sitemap

| | Count |
|--|------:|
| Before this batch | 422 |
| After (local + production) | **261** |
| Hubs removed from sitemap | 161 |

Money accidentally noindexed: **0** · Topic pages still noindex (not deleted)

### Git / Production

| Field | Value |
|-------|--------|
| Release SHA | `359d509ab3afc934850329adc68d9158a2fef607` |
| Origin/Main | `359d509` |
| Production SHA | **NOT ATTESTED** |
| Production Matches Main | **YES (behavioral)** — sitemap 261, KEEP indexable, MERGE/NOINDEX hubs noindex+canonical |

Production samples verified 2026-08-08: 12 money · 10 KEEP · 10 NOINDEX/MERGE · 5 area — all PASS

### Internal linking upgrades

- Footer: +มือถือ / การ์ดจอ / จอคอม / PS5
- Province `AreaLocalSections`: expanded money links
- Blog: `PrimaryMoneyLinkPanel` → related money pages
- seoSlug hubs: consolidation / related money links

### Deferred (superseded by KEEP HUB QUALITY batch below)

- ~~Content enrichment for KEEP 73 hubs~~ → done in next batch
- GSC / GBP / NAP owner data
- Do not delete noindex topic or seoSlug hubs yet

---

## BATCH — KEEP HUB QUALITY / FULL INTERNAL LINK GRAPH (2026-08-08)

### KEEP HUB QUALITY

| Metric | Before | After |
|--------|-------:|------:|
| KEEP indexable | 73 | **63** |
| Soft-cannibal downgrades (NOINDEX) | — | **10** |
| KEEP STRONG | — | 0 |
| KEEP ACCEPTABLE | — | **63** |
| MERGE (this batch) | — | 0 additional |
| NOINDEX (this batch soft overlap) | — | 10 |
| OWNER DATA REQUIRED | — | 0 |
| Avg quality score | ~template-thin | **73/100** |
| Information Gain avg (/20) | low | **16** |
| Template-heavy (>60%) | high | 60 (CTA/process shared; main checks unique) |
| Pages enriched | 0 | **63** |

Soft-cannibal NOINDEX targets (canonical → parent hub):
`เครื่องเสียง`, `Bose`, `Harddisk Synology`, `Harddisk Nas`, `UPS Server`, `UPS Rack`, `อุปกรณ์ไอทีเก่าบริษัท`, `รับเหมาคอมสำนักงาน`, `รับประมูลงานคอมพิวเตอร์`, `เครื่องบดกาแฟ`

Artifacts:
- `docs/seoslug-keep-quality.json`
- `src/data/seoSlugHubEnrichment.ts`
- `src/data/hubDiscoveryLinks.ts`
- `src/data/supportingHubLinks.ts`

Business facts invented: **0** · Fake prices: **0** · Fake reviews: **0**

### FULL INTERNAL LINK GRAPH

| Metric | Value |
|--------|------:|
| Indexable URLs analyzed | **251** |
| Total internal edges | **13,358+** |
| Orphans before remediation | 122 |
| Orphans after | **0** |
| Near-orphans after | **94** (mostly province-local money with 1 contextual source) |
| Depth >3 after | **0** |
| Homepage unique outbound | 44 · link-dump risk **OK** |

Artifact: `docs/internal-link-graph.json`  
Note: authority score is an **internal heuristic** (unique sources + placement + depth), not PageRank.

### PRIMARY MONEY AUTHORITY

| Band | Before (approx) | After |
|------|----------------:|------:|
| STRONG | partial / footer-inflated | **15/15** (with contextual inbound ≥3) |
| WEAK | some supporting-only | **0** |
| CRITICAL | — | **0** |

Money pages still get sitewide footer links; contextual body/related links confirmed separately.

### SOFT CANNIBALIZATION

| | Before | After |
|--|-------:|------:|
| P0 | partial risk among KEEP siblings | **0** |
| P1 | present | **0** (matrix sample) |
| P2 | — | 0 |
| SAFE supporting clusters | — | yes |

Artifact: `docs/soft-cannibalization-matrix.json`

### SITEMAP

| | Count |
|--|------:|
| Before this batch | 261 |
| After (local build) | **251** |
| Noindex in sitemap | 0 (filter PASS) |

Delta ≈ 10 soft-cannibal hubs removed from sitemap.

### INTERNAL LINK REMEDIATION

- `/รับซื้อ` hub discovery groups → specialty KEEP hubs
- Money pages → supporting hubs via `supportingHubLinks`
- KEEP hubs → parent money + related hubs (enrichment)
- Province `AreaLocalSections` → province-local money pages (5 intents) + national parents
- Blog: `PrimaryMoneyLinkPanel` remains supplemental

### PRODUCTION VERIFICATION

| Field | Value |
|-------|--------|
| Initial SHA | `52a602c` |
| Release SHA | `a81cc61` |
| Docs SHA | `9025449` |
| Production SHA | **NOT ATTESTED** (no Vercel/gh deploy SHA API) |
| Production Matches Main | **YES (behavioral)** — sitemap **251**, KEEP H1 enrichment live, soft-cannibal `เครื่องเสียง` = `noindex,follow` + canonical → `/รับซื้อลำโพง`, money indexable |

### NEXT SEO BATCH (priority)

1. **GSC Ranking Intelligence** — owner export → `docs/gsc/` → `node scripts/analyze-gsc-query-page.mjs` (see `docs/gsc-owner-export-guide.md`)
2. Implement only Tier-1 opportunities from GSC matrix (≤10 URLs)
3. OWNER: NAP/GBP confirmation
4. Blog contextual inline links only when GSC shows wrong-URL / CTR evidence
5. Province near-orphan decisions driven by GSC province demand (not zero-click alone)

---

## BATCH — GSC RANKING INTELLIGENCE (2026-08-08)

**Verdict: PASS WITH WARNING** (owner exports ingested)

- Sources: `docs/gsc/*Performance*.xlsx` + Coverage / Coverage-Valid (3 เดือนล่าสุด)
- Normalized: `queries-3m.csv`, `pages-3m.csv` via `scripts/export-gsc-xlsx-to-csv.py`
- Analyzer: `scripts/analyze-gsc-query-page.mjs` (Thai column aliases)
- Reports: `docs/gsc-ranking-opportunities.{json,md}`, `docs/gsc-primary-query-registry.json`
- Page signals: **6 clicks / 244 impressions / 27 pages**; queries visible: **3**
- Money NEAR WIN: อุปกรณ์เกมมิ่ง, iPad, โน๊ตบุ๊ค
- Province PROVEN: สุรินทร์, อุบลราชธานี
- Query×Page: **NO** → GSC P0/P1 cannibalization **not validated**
- Site changes: **NONE** (implementation gate PARTIAL — Tier-1 plan only)

### OWNER ACTION REQUIRED

- Google Search Console export (Indexing + Performance + Sitemaps + Crawl stats)
- Confirm real business address / Google Business Profile URL
- Confirm reviewer/experience claims for public trust copy
- Confirm which provinces are true service coverage vs aspirational
