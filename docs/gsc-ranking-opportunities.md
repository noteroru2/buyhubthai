# BuyHub GSC Ranking Opportunities

**Verdict: PASS WITH WARNING**

Generated from owner exports dated **2026-08-08**  
Filter: Search type = Web · **3 เดือนล่าสุด** (chart ~2026-05-09 → 2026-08-08)  
Site changes this phase: **NONE**

## Data quality

| Field | Value |
|-------|--------|
| Source files | `buyhubthai.com-Performance-on-Search-2026-08-08.xlsx` (+ Coverage / Coverage-Valid) |
| Normalized | `docs/gsc/queries-3m.csv`, `docs/gsc/pages-3m.csv` |
| Queries (visible) | **3** (GSC privacy threshold — sparse) |
| Pages | **27** unique |
| Total clicks (pages) | **6** |
| Total impressions (pages) | **244** |
| Query×Page | **NO** → cannibalization / wrong-URL = **not confirmable** |

**Caveat:** Page export is the primary signal. Do not over-read the 3 anonymized queries.

## Coverage (indexing context — not rankings)

| Issue | Pages |
|-------|------:|
| Crawled – currently not indexed (validation failed) | **174** |
| Excluded by `noindex` | 30 |
| Redirect | 19 |
| Alternate with proper canonical | 1 |

Coverage-Valid lists ~95 URLs Google had as indexed/crawled (includes many topic/seoSlug URLs later noindexed). Treat as **historical crawl inventory**, not a reason to re-open index automatically.

## Money performance (15 primaries)

| Band | Count | URLs with signal |
|------|------:|------------------|
| WINNER | 0 | — |
| NEAR WIN | **3** | `/รับซื้ออุปกรณ์เกมมิ่ง` (16 imp · pos 6.75), `/รับซื้อ-ipad` (12 · 10), `/รับซื้อโน๊ตบุ๊คมือสอง` (6 · 9.33) |
| OPPORTUNITY | 0 | — |
| WEAK | 0 | — |
| NO SIGNAL | **12** | รวม iPhone, MacBook, คอม, กล้อง, การ์ดจอ, จอคอม, คอมบริษัท ฯลฯ |

Related non-registry commercial: `/รับซื้อ-jbl` (7 imp · pos 18), `/รับซื้อ-playstation` (3 · 5), `/รับซื้อ-ps5` (1 · 7).

## Ranking opportunities

| Type | Count / note |
|------|----------------|
| Position ~4–10 (page-level) | Province + money + trust/blog mix — see JSON |
| Position 11–20 | `/รับซื้อ-jbl` (pos 18) |
| High imp / low CTR | Homepage pos **1.72** / 18 imp / 0 clicks; several money pages with 0 CTR at pos 4–10 |
| Wrong URL | **QUERY_PAGE_DATA_REQUIRED** |
| Cannibalization P0/P1 | **Not measurable** without Query×Page (architecture claim P0/P1=0 remains unvalidated by GSC) |

### Queries (all visible)

| Query | Clicks | Impr | CTR | Pos | Note |
|-------|-------:|-----:|----:|----:|------|
| buyhub | 0 | 2 | 0 | 33 | Brand — weak |
| รับซื้อคอมพิวเตอร์ ใกล้ฉัน | 0 | 1 | 0 | **4** | Near-win query; expected primary `/รับซื้อคอมพิวเตอร์มือสอง` (unconfirmed landing URL) |
| ประเมินราคาไอแพด | 0 | 1 | 0 | 47 | Weak; related to iPad money |

## Province demand

| Status | Pages |
|--------|--------|
| **PROVEN DEMAND** | `/พื้นที่ให้บริการ/สุรินทร์` (4 clicks · 64 imp · pos 9.84), `/พื้นที่ให้บริการ/อุบลราชธานี` (2 · 33 · 8.12) |
| EARLY SIGNAL | `/พื้นที่ให้บริการ` (15·6.93), `/เลย` (3·3.67), `/นครพนม` (3·9) |
| NO DATA (in this export) | Most other provinces |

**Insight:** Google is rewarding **province hub pages** more than most money pages right now. Do not noindex near-orphan province URLs from zero clicks alone — สุรินทร์/อุบล are proven.

## KEEP hubs (63)

No KEEP hub paths appear in this Performance Pages export with meaningful rows → **NO SIGNAL** for KEEP set in this window.  
Do **not** noindex KEEP from absence of signal.

## Top 10 priorities (heuristic)

Opportunity Score = internal heuristic, not Google.

1. `/พื้นที่ให้บริการ/สุรินทร์` — 4 clicks · 64 imp · pos 9.84 — **PROVINCE_SUPPORT**
2. `/รับซื้ออุปกรณ์เกมมิ่ง` — 0 · 16 · 6.75 — **TITLE_META**
3. `/รับซื้อ-ipad` — 0 · 12 · 10 — **TITLE_META**
4. `/รับซื้อโน๊ตบุ๊คมือสอง` — 0 · 6 · 9.33 — **TITLE_META**
5. Query `รับซื้อคอมพิวเตอร์ ใกล้ฉัน` → `/รับซื้อคอมพิวเตอร์มือสอง` — pos 4 · 1 imp — **CONTENT_ENRICH** (local intent) + need Query×Page
6. `/พื้นที่ให้บริการ/อุบลราชธานี` — 2 · 33 · 8.12 — **PROVINCE_SUPPORT**
7. `/พื้นที่ให้บริการ` — 0 · 15 · 6.93 — **PROVINCE_SUPPORT** / TITLE
8. `/พื้นที่ให้บริการ/นครพนม` — 0 · 3 · 9 — **MONITOR** / light support
9. `/` homepage — 0 · 18 · pos 1.72 — **TITLE_META** / SERP review (may be brand/nav)
10. `/รับซื้อ-jbl` — 0 · 7 · 18 — **CONTENT_ENRICH**

## Implementation gate

**PARTIAL OPEN** for a Tier-1 plan (≤10 URLs)  
**CLOSED** for blind mass edits  
**Still required:** Query×Page export before claiming GSC cannibalization P0/P1

Recommended next implementation batch (when you approve): titles/CTR + province deepen for items 1–6 only — not architecture rewrites.

## Re-run

```bash
python scripts/_tmp-export-gsc-csv.py   # if new xlsx dropped
node scripts/analyze-gsc-query-page.mjs --query docs/gsc/queries-3m.csv --page docs/gsc/pages-3m.csv --start 2026-05-09 --end 2026-08-08
```
