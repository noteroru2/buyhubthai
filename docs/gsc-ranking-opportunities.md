# BuyHub GSC Ranking Opportunities

**Verdict: INSUFFICIENT_GSC_DATA**

Generated: 2026-08-08T04:31:06.214Z

## Status

No usable Google Search Console Performance export was found in the repository.

- Searched: `docs/`, `data/`, `reports/`, `tmp/`, `scripts/`, `*.csv`, `*.xlsx`, `*gsc*`
- Result: **GSC DATA NOT PROVIDED**
- Site changes this phase: **NONE** (read/analyze only)

## What this means

Architecture cleanup is complete enough to enter ranking optimization, but **Google data is required** before Tier-1 content/title/link changes.

Prior architecture claim (P0/P1 cannibalization = 0) remains an **architecture assessment**, not yet confirmed or contradicted by GSC Query×Page evidence.

## Owner action

Follow: [gsc-owner-export-guide.md](./gsc-owner-export-guide.md)

Place exports under `docs/gsc/` (recommended) then run:

```bash
node scripts/analyze-gsc-query-page.mjs --query docs/gsc/queries-3m.csv --page docs/gsc/pages-3m.csv --start YYYY-MM-DD --end YYYY-MM-DD
# preferred if available:
node scripts/analyze-gsc-query-page.mjs --query-page docs/gsc/query-page-3m.csv --start YYYY-MM-DD --end YYYY-MM-DD
```

## Architecture baseline (not GSC)

| Surface | Count |
|--------|------:|
| Sitemap | 251 |
| Primary Money | 15 |
| KEEP hubs | 63 |
| Near-orphan province/local (approx) | 90 |

## Primary query registry

Architecture-only stubs written to `gsc-primary-query-registry.json` (metrics = null, status = AWAITING_GSC).

## Top 10 priorities

**Unavailable** until GSC data is imported.

## Implementation gate

**CLOSED** — do not rewrite pages, titles, links, robots, or sitemap for ranking until Opportunity Matrix is populated from real GSC rows.
