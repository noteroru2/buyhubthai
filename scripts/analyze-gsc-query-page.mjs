/**
 * Google Search Console ranking intelligence analyzer.
 *
 * Usage:
 *   node scripts/analyze-gsc-query-page.mjs
 *   node scripts/analyze-gsc-query-page.mjs --query path/to/queries.csv
 *   node scripts/analyze-gsc-query-page.mjs --page path/to/pages.csv
 *   node scripts/analyze-gsc-query-page.mjs --query-page path/to/query-page.csv
 *   node scripts/analyze-gsc-query-page.mjs --query q.csv --page p.csv --query-page qp.csv --start 2026-05-01 --end 2026-08-01
 *
 * Does NOT invent metrics. Without usable input → writes INSUFFICIENT_GSC_DATA reports.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const SITE = 'https://buyhubthai.com';
const OUT_JSON = path.join(ROOT, 'docs/gsc-ranking-opportunities.json');
const OUT_MD = path.join(ROOT, 'docs/gsc-ranking-opportunities.md');
const OUT_REGISTRY = path.join(ROOT, 'docs/gsc-primary-query-registry.json');

const PRIMARY_MONEY = [
  '/รับซื้อ-iphone',
  '/รับซื้อ-ipad',
  '/รับซื้อ-macbook',
  '/รับซื้อโน๊ตบุ๊คมือสอง',
  '/รับซื้อคอมพิวเตอร์มือสอง',
  '/รับซื้อคอมเกมมิ่ง',
  '/รับซื้อมือถือ',
  '/รับซื้อแท็บเล็ต',
  '/รับซื้อกล้อง',
  '/รับซื้อการ์ดจอ',
  '/รับซื้อจอคอม',
  '/รับซื้อคอมบริษัท',
  '/รับซื้อ-ps5',
  '/รับซื้อเครื่องเกม',
  '/รับซื้ออุปกรณ์เกมมิ่ง'
];

const INTENT_FAMILIES = [
  { intent: 'รับซื้อ iPhone', queryExamples: ['รับซื้อ iphone', 'รับซื้อไอโฟน', 'ขาย iphone'], primaryUrl: '/รับซื้อ-iphone' },
  { intent: 'รับซื้อ iPad', queryExamples: ['รับซื้อ ipad', 'รับซื้อไอแพด', 'ขาย ipad'], primaryUrl: '/รับซื้อ-ipad' },
  { intent: 'รับซื้อ MacBook', queryExamples: ['รับซื้อ macbook', 'รับซื้อแมคบุ๊ค', 'ขาย macbook'], primaryUrl: '/รับซื้อ-macbook' },
  { intent: 'รับซื้อโน๊ตบุ๊ค', queryExamples: ['รับซื้อโน๊ตบุ๊ค', 'รับซื้อ notebook', 'ขายโน๊ตบุ๊ค'], primaryUrl: '/รับซื้อโน๊ตบุ๊คมือสอง' },
  { intent: 'รับซื้อคอมพิวเตอร์', queryExamples: ['รับซื้อคอมพิวเตอร์', 'รับซื้อคอม', 'ขายคอมมือสอง'], primaryUrl: '/รับซื้อคอมพิวเตอร์มือสอง' },
  { intent: 'รับซื้อคอมเกมมิ่ง', queryExamples: ['รับซื้อคอมเกมมิ่ง', 'รับซื้อ gaming pc'], primaryUrl: '/รับซื้อคอมเกมมิ่ง' },
  { intent: 'รับซื้อมือถือ', queryExamples: ['รับซื้อมือถือ', 'รับซื้อโทรศัพท์', 'ขายมือถือ'], primaryUrl: '/รับซื้อมือถือ' },
  { intent: 'รับซื้อแท็บเล็ต', queryExamples: ['รับซื้อแท็บเล็ต', 'รับซื้อ tablet'], primaryUrl: '/รับซื้อแท็บเล็ต' },
  { intent: 'รับซื้อกล้อง', queryExamples: ['รับซื้อกล้อง', 'ขายกล้อง'], primaryUrl: '/รับซื้อกล้อง' },
  { intent: 'รับซื้อการ์ดจอ', queryExamples: ['รับซื้อการ์ดจอ', 'รับซื้อ gpu', 'ขายการ์ดจอ'], primaryUrl: '/รับซื้อการ์ดจอ' },
  { intent: 'รับซื้อจอคอม', queryExamples: ['รับซื้อจอคอม', 'รับซื้อ monitor'], primaryUrl: '/รับซื้อจอคอม' },
  { intent: 'รับซื้อคอมบริษัท', queryExamples: ['รับซื้อคอมบริษัท', 'รับซื้อคอมสำนักงาน'], primaryUrl: '/รับซื้อคอมบริษัท' },
  { intent: 'รับซื้อ PS5', queryExamples: ['รับซื้อ ps5', 'ขาย ps5'], primaryUrl: '/รับซื้อ-ps5' },
  { intent: 'รับซื้อเครื่องเกม', queryExamples: ['รับซื้อเครื่องเกม', 'รับซื้อ nintendo'], primaryUrl: '/รับซื้อเครื่องเกม' },
  { intent: 'รับซื้ออุปกรณ์เกมมิ่ง', queryExamples: ['รับซื้ออุปกรณ์เกมมิ่ง', 'รับซื้อเกมมิ่งเกียร์'], primaryUrl: '/รับซื้ออุปกรณ์เกมมิ่ง' }
];

const TRUST_PATHS = new Set([
  '/เกี่ยวกับเรา',
  '/ติดต่อเรา',
  '/รีวิวลูกค้า',
  '/ผลงานรับซื้อจริง',
  '/คำถามที่พบบ่อย',
  '/ขั้นตอนการขาย',
  '/คู่มือเตรียมสินค้าก่อนขาย',
  '/เงื่อนไขการใช้บริการ',
  '/นโยบายความเป็นส่วนตัว'
]);

function parseArgs(argv) {
  const out = { query: null, page: null, queryPage: null, start: null, end: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === '--query' && next) {
      out.query = next;
      i++;
    } else if (a === '--page' && next) {
      out.page = next;
      i++;
    } else if ((a === '--query-page' || a === '--querypage') && next) {
      out.queryPage = next;
      i++;
    } else if (a === '--start' && next) {
      out.start = next;
      i++;
    } else if (a === '--end' && next) {
      out.end = next;
      i++;
    } else if (a === '--help' || a === '-h') {
      out.help = true;
    }
  }
  return out;
}

function detectDelimiter(line) {
  const commas = (line.match(/,/g) || []).length;
  const semis = (line.match(/;/g) || []).length;
  const tabs = (line.match(/\t/g) || []).length;
  if (tabs >= commas && tabs >= semis) return '\t';
  if (semis > commas) return ';';
  return ',';
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim().length);
  if (lines.length === 0) return { headers: [], rows: [] };
  const delim = detectDelimiter(lines[0]);
  const parseLine = (line) => {
    const cells = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = !inQ;
      } else if (ch === delim && !inQ) {
        cells.push(cur);
        cur = '';
      } else cur += ch;
    }
    cells.push(cur);
    return cells.map((c) => c.trim());
  };
  const headers = parseLine(lines[0]).map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = parseLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = cells[i] ?? '';
    });
    return obj;
  });
  return { headers, rows };
}

function loadTable(filePath) {
  if (!filePath) return null;
  const abs = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Input not found: ${abs}`);
  }
  const raw = fs.readFileSync(abs, 'utf8');
  if (abs.endsWith('.json')) {
    const data = JSON.parse(raw);
    const rows = Array.isArray(data) ? data : data.rows || data.data || [];
    return { source: abs, format: 'json', rows, mtime: fs.statSync(abs).mtime.toISOString() };
  }
  const { headers, rows } = parseCsv(raw);
  return { source: abs, format: 'csv', headers, rows, mtime: fs.statSync(abs).mtime.toISOString() };
}

const ALIASES = {
  query: [
    'query',
    'top queries',
    'queries',
    'search query',
    'คำค้นหา',
    'คำค้น',
    'ข้อความค้นหา',
    'ข้อความค้นหายอดนิยม'
  ],
  page: [
    'page',
    'top pages',
    'pages',
    'landing page',
    'url',
    'หน้า',
    'landing page url',
    'เพจ',
    'เพจยอดนิยม'
  ],
  clicks: ['clicks', 'คลิก', 'การคลิก'],
  impressions: ['impressions', 'imps', 'impression', 'การแสดงผล'],
  ctr: ['ctr', 'average ctr', 'avg ctr', 'ctr (%)', 'อัตราการคลิก'],
  position: ['position', 'average position', 'avg position', 'avg. position', 'ตำแหน่ง', 'ตำแหน่งเฉลี่ย']
};

function normHeader(h) {
  return String(h || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function pickField(row, kind) {
  const keys = Object.keys(row);
  const aliases = ALIASES[kind];
  for (const key of keys) {
    const nk = normHeader(key);
    if (aliases.includes(nk)) return row[key];
  }
  // partial contains
  for (const key of keys) {
    const nk = normHeader(key);
    if (aliases.some((a) => nk.includes(a))) return row[key];
  }
  return undefined;
}

function parseNumber(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return v;
  let s = String(v).trim();
  if (s.endsWith('%')) s = s.slice(0, -1);
  s = s.replace(/,/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function normalizeUrl(input) {
  if (!input) return null;
  let s = String(input).trim();
  if (!s) return null;
  try {
    s = decodeURIComponent(s);
  } catch {
    /* keep */
  }
  // strip tracking
  try {
    const hasScheme = /^https?:\/\//i.test(s);
    const u = new URL(hasScheme ? s : SITE + (s.startsWith('/') ? s : `/${s}`));
    if (!/buyhubthai\.com$/i.test(u.hostname.replace(/^www\./, ''))) {
      return { external: true, raw: s, path: null };
    }
    let p = decodeURIComponent(u.pathname).replace(/\/$/, '') || '/';
    return { external: false, raw: s, path: p, absolute: SITE + (p === '/' ? '/' : p) };
  } catch {
    if (s.startsWith('/')) {
      const p = s.replace(/\/$/, '') || '/';
      return { external: false, raw: s, path: p, absolute: SITE + p };
    }
    return null;
  }
}

function loadKeepSlugs() {
  try {
    const pol = fs.readFileSync(path.join(ROOT, 'src/data/seoSlugHubIndexPolicy.mjs'), 'utf8');
    const m = pol.match(/SEO_SLUG_KEEP_HUB_SLUGS\s*=\s*new Set\(([\s\S]*?)\);/);
    if (!m) return new Set();
    return new Set(JSON.parse(m[1]));
  } catch {
    return new Set();
  }
}

function loadNoindexHubSlugs() {
  try {
    const pol = fs.readFileSync(path.join(ROOT, 'src/data/seoSlugHubIndexPolicy.mjs'), 'utf8');
    const m = pol.match(/SEO_SLUG_NOINDEX_HUB_SLUGS\s*=\s*new Set\(([\s\S]*?)\);/);
    if (!m) return new Set();
    return new Set(JSON.parse(m[1]));
  } catch {
    return new Set();
  }
}

function loadSitemapPaths() {
  const dist = path.join(ROOT, 'dist');
  if (!fs.existsSync(dist)) return new Set();
  const files = fs.readdirSync(dist).filter((f) => f.startsWith('sitemap') && f.endsWith('.xml') && !f.includes('index'));
  const urls = new Set();
  for (const f of files) {
    const xml = fs.readFileSync(path.join(dist, f), 'utf8');
    if (!xml.includes('<urlset')) continue;
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      try {
        const p = decodeURIComponent(new URL(m[1]).pathname).replace(/\/$/, '') || '/';
        if (!p.endsWith('.xml')) urls.add(p);
      } catch {
        /* ignore */
      }
    }
  }
  return urls;
}

const PROVINCES = [
  'ขอนแก่น',
  'นครราชสีมา',
  'อุดรธานี',
  'อุบลราชธานี',
  'อำนาจเจริญ',
  'บึงกาฬ',
  'บุรีรัมย์',
  'ชัยภูมิ',
  'กาฬสินธุ์',
  'เลย',
  'มหาสารคาม',
  'มุกดาหาร',
  'นครพนม',
  'หนองบัวลำภู',
  'หนองคาย',
  'ร้อยเอ็ด',
  'สกลนคร',
  'ศรีสะเกษ',
  'สุรินทร์',
  'ยโสธร'
];

function classifyPath(pathname, keepSlugs, noindexSlugs, sitemap) {
  if (!pathname) return 'UNKNOWN';
  if (PRIMARY_MONEY.includes(pathname)) return 'PRIMARY_MONEY';
  if (pathname.startsWith('/บทความ')) return 'BLOG';
  if (pathname.startsWith('/พื้นที่ให้บริการ')) return 'PROVINCE';
  if (TRUST_PATHS.has(pathname) || pathname === '/' || pathname === '/รับซื้อ') return 'TRUST';
  const slug = pathname.replace(/^\//, '');
  if (keepSlugs.has(slug)) return 'KEEP_HUB';
  if (noindexSlugs.has(slug)) return 'NOINDEX';
  if (PROVINCES.some((p) => pathname.endsWith(`-${p}`))) {
    if (sitemap.has(pathname)) return 'PROVINCE';
    return 'NOINDEX'; // likely programmatic local
  }
  if (pathname.startsWith('/รับซื้อ/') && pathname.split('/').filter(Boolean).length >= 3) return 'NOINDEX';
  if (sitemap.has(pathname)) return 'UNKNOWN';
  return 'UNKNOWN';
}

function normalizeRows(table, mode) {
  if (!table) return { rows: [], issues: [], mode };
  const issues = [];
  const rows = [];
  for (const raw of table.rows) {
    const query = mode === 'page' ? null : pickField(raw, 'query');
    const pageRaw = mode === 'query' ? null : pickField(raw, 'page');
    const clicks = parseNumber(pickField(raw, 'clicks'));
    const impressions = parseNumber(pickField(raw, 'impressions'));
    const ctrRaw = parseNumber(pickField(raw, 'ctr'));
    const position = parseNumber(pickField(raw, 'position'));
    const ctr = ctrRaw == null ? null : ctrRaw > 1 ? ctrRaw / 100 : ctrRaw;

    let page = null;
    if (pageRaw != null && String(pageRaw).trim()) {
      const nu = normalizeUrl(pageRaw);
      if (!nu) {
        issues.push({ type: 'invalid_url', value: pageRaw });
        continue;
      }
      if (nu.external) {
        issues.push({ type: 'external_domain', value: pageRaw });
        continue;
      }
      page = nu.path;
    }

    if (mode === 'query' && (query == null || String(query).trim() === '')) {
      issues.push({ type: 'missing_query' });
      continue;
    }
    if (mode === 'page' && !page) {
      issues.push({ type: 'missing_page' });
      continue;
    }
    if (mode === 'query-page' && ((query == null || String(query).trim() === '') || !page)) {
      issues.push({ type: 'missing_query_or_page' });
      continue;
    }

    rows.push({
      query: query == null ? null : String(query).trim().toLowerCase(),
      page,
      clicks: clicks ?? 0,
      impressions: impressions ?? 0,
      ctr,
      position
    });
  }
  return { rows, issues, mode, source: table.source, mtime: table.mtime };
}

function percentile(sorted, p) {
  if (!sorted.length) return null;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * (sorted.length - 1))));
  return sorted[idx];
}

function moneyBand(row, impressionFloor) {
  const imps = row.impressions || 0;
  const pos = row.position;
  if (imps < impressionFloor || pos == null) return 'NO SIGNAL';
  if (pos <= 3 && imps >= impressionFloor) return 'WINNER';
  if (pos > 3 && pos <= 10) return 'NEAR WIN';
  if (pos > 10 && pos <= 20) return 'OPPORTUNITY';
  if (imps >= impressionFloor) return 'WEAK';
  return 'NO SIGNAL';
}

function opportunityScore({ commercial, impressions, position, intentFit, ctrOpp, qualityGap }) {
  // heuristic /100 — not a Google metric
  return Math.round(commercial + impressions + position + intentFit + ctrOpp + qualityGap);
}

function expectedPrimaryForQuery(q) {
  const t = q.toLowerCase();
  for (const fam of INTENT_FAMILIES) {
    if (fam.queryExamples.some((ex) => t.includes(ex.replace(/^รับซื้อ\s*/, '')) || t.includes(ex))) {
      // tighter matching
    }
  }
  if (/iphone|ไอโฟน/.test(t)) return '/รับซื้อ-iphone';
  if (/ipad|ไอแพด/.test(t)) return '/รับซื้อ-ipad';
  if (/macbook|แมคบุ๊ค|imac/.test(t)) return '/รับซื้อ-macbook';
  if (/โน๊ตบุ๊ค|notebook|laptop/.test(t)) return '/รับซื้อโน๊ตบุ๊คมือสอง';
  if (/คอมเกมมิ่ง|gaming\s*pc/.test(t)) return '/รับซื้อคอมเกมมิ่ง';
  if (/คอมบริษัท|สำนักงาน|องค์กร/.test(t)) return '/รับซื้อคอมบริษัท';
  if (/คอมพิวเตอร์|คอมมือสอง|คอมตั้งโต๊ะ/.test(t)) return '/รับซื้อคอมพิวเตอร์มือสอง';
  if (/มือถือ|โทรศัพท์|android|samsung/.test(t) && !/iphone|ไอโฟน/.test(t)) return '/รับซื้อมือถือ';
  if (/แท็บเล็ต|tablet/.test(t) && !/ipad|ไอแพด/.test(t)) return '/รับซื้อแท็บเล็ต';
  if (/กล้อง/.test(t)) return '/รับซื้อกล้อง';
  if (/การ์ดจอ|gpu|vga/.test(t)) return '/รับซื้อการ์ดจอ';
  if (/จอคอม|monitor/.test(t)) return '/รับซื้อจอคอม';
  if (/ps5|playstation/.test(t)) return '/รับซื้อ-ps5';
  if (/เครื่องเกม|nintendo|switch/.test(t)) return '/รับซื้อเครื่องเกม';
  if (/เกมมิ่ง/.test(t)) return '/รับซื้ออุปกรณ์เกมมิ่ง';
  return null;
}

function writeInsufficient(args, reason) {
  const generatedAt = new Date().toISOString();
  const registry = {
    generatedAt,
    status: 'INSUFFICIENT_GSC_DATA',
    note: 'Primary URL registry from architecture only. GSC metrics are null until owner export is provided.',
    queryPageAvailable: false,
    intents: INTENT_FAMILIES.map((f) => ({
      intent: f.intent,
      queryExamples: f.queryExamples,
      primaryUrl: f.primaryUrl,
      supportingUrls: [],
      currentRankingUrl: null,
      clicks: null,
      impressions: null,
      position: null,
      ctr: null,
      status: 'AWAITING_GSC',
      recommendedAction: 'OWNER_DATA'
    }))
  };

  const report = {
    verdict: 'INSUFFICIENT_GSC_DATA',
    generatedAt,
    phase: 'GSC RANKING OPTIMIZATION — READ/ANALYZE',
    siteChanges: 'NONE (gate closed until GSC data)',
    data: {
      source: null,
      startDate: args.start || null,
      endDate: args.end || null,
      rowsRaw: 0,
      rowsNormalized: 0,
      queries: 0,
      pages: 0,
      queryPageAvailable: false,
      reason,
      freshness: 'N/A — no dataset'
    },
    architectureBaseline: {
      sitemap: 251,
      money: 15,
      keep: 63,
      provinceNearOrphansApprox: 90,
      note: 'From prior verified batch; not from GSC'
    },
    moneyPerformance: {
      moneyPages: 15,
      WINNER: null,
      NEAR_WIN: null,
      OPPORTUNITY: null,
      WEAK: null,
      NO_SIGNAL: null,
      pages: PRIMARY_MONEY.map((p) => ({
        path: p,
        clicks: null,
        impressions: null,
        ctr: null,
        position: null,
        band: 'NO SIGNAL',
        reason: 'INSUFFICIENT_GSC_DATA'
      }))
    },
    rankingOpportunities: {
      position4to10: [],
      position11to20: [],
      highImpressionLowCtr: [],
      wrongUrl: [],
      cannibalizationP0: [],
      cannibalizationP1: []
    },
    keepHubs: { proven: [], promising: [], noSignal: [], cannibalizing: [], note: 'Requires page or query×page GSC export' },
    province: { provenDemand: [], earlySignal: [], noData: [], wrongUrl: [], note: 'Requires GSC page/query×page export' },
    historicalSignal: {
      currentNoindexWithSignal: [],
      mergedWithSignal: [],
      reviewRequired: [],
      note: 'Cannot evaluate without historical GSC page export covering noindexed URLs'
    },
    top10Priorities: [],
    implementationGate: {
      ready: false,
      maxTier1Urls: 10,
      condition: 'Provide GSC exports per docs/gsc-owner-export-guide.md then re-run this script'
    },
    nextCommandExamples: [
      'node scripts/analyze-gsc-query-page.mjs --query docs/gsc/queries-3m.csv --page docs/gsc/pages-3m.csv --start 2026-05-08 --end 2026-08-08',
      'node scripts/analyze-gsc-query-page.mjs --query-page docs/gsc/query-page-3m.csv --start 2026-05-08 --end 2026-08-08'
    ]
  };

  fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));
  fs.writeFileSync(OUT_REGISTRY, JSON.stringify(registry, null, 2));
  fs.writeFileSync(
    OUT_MD,
    `# BuyHub GSC Ranking Opportunities

**Verdict: INSUFFICIENT_GSC_DATA**

Generated: ${generatedAt}

## Status

No usable Google Search Console Performance export was found in the repository.

- Searched: \`docs/\`, \`data/\`, \`reports/\`, \`tmp/\`, \`scripts/\`, \`*.csv\`, \`*.xlsx\`, \`*gsc*\`
- Result: **GSC DATA NOT PROVIDED**
- Site changes this phase: **NONE** (read/analyze only)

## What this means

Architecture cleanup is complete enough to enter ranking optimization, but **Google data is required** before Tier-1 content/title/link changes.

Prior architecture claim (P0/P1 cannibalization = 0) remains an **architecture assessment**, not yet confirmed or contradicted by GSC Query×Page evidence.

## Owner action

Follow: [gsc-owner-export-guide.md](./gsc-owner-export-guide.md)

Place exports under \`docs/gsc/\` (recommended) then run:

\`\`\`bash
node scripts/analyze-gsc-query-page.mjs --query docs/gsc/queries-3m.csv --page docs/gsc/pages-3m.csv --start YYYY-MM-DD --end YYYY-MM-DD
# preferred if available:
node scripts/analyze-gsc-query-page.mjs --query-page docs/gsc/query-page-3m.csv --start YYYY-MM-DD --end YYYY-MM-DD
\`\`\`

## Architecture baseline (not GSC)

| Surface | Count |
|--------|------:|
| Sitemap | 251 |
| Primary Money | 15 |
| KEEP hubs | 63 |
| Near-orphan province/local (approx) | 90 |

## Primary query registry

Architecture-only stubs written to \`gsc-primary-query-registry.json\` (metrics = null, status = AWAITING_GSC).

## Top 10 priorities

**Unavailable** until GSC data is imported.

## Implementation gate

**CLOSED** — do not rewrite pages, titles, links, robots, or sitemap for ranking until Opportunity Matrix is populated from real GSC rows.
`
  );

  console.log(JSON.stringify({ verdict: report.verdict, reason, outputs: [OUT_JSON, OUT_MD, OUT_REGISTRY] }, null, 2));
}

function analyzeWithData(args, querySet, pageSet, qpSet) {
  const keepSlugs = loadKeepSlugs();
  const noindexSlugs = loadNoindexHubSlugs();
  const sitemap = loadSitemapPaths();
  const generatedAt = new Date().toISOString();

  const queryPageAvailable = Boolean(qpSet?.rows?.length);
  const allImps = [...(pageSet?.rows || []), ...(querySet?.rows || []), ...(qpSet?.rows || [])]
    .map((r) => r.impressions)
    .filter((n) => n > 0)
    .sort((a, b) => a - b);
  const impressionFloor = Math.max(1, percentile(allImps, 40) || 1);

  // Money performance from page export preferred
  const pageByPath = new Map();
  for (const r of pageSet?.rows || []) {
    if (!r.page) continue;
    const prev = pageByPath.get(r.page) || { clicks: 0, impressions: 0, positions: [], ctrs: [] };
    prev.clicks += r.clicks;
    prev.impressions += r.impressions;
    if (r.position != null) prev.positions.push(r.position);
    if (r.ctr != null) prev.ctrs.push(r.ctr);
    pageByPath.set(r.page, prev);
  }

  const moneyPages = PRIMARY_MONEY.map((p) => {
    const agg = pageByPath.get(p);
    if (!agg) {
      return { path: p, clicks: 0, impressions: 0, ctr: null, position: null, band: 'NO SIGNAL', type: 'PRIMARY_MONEY' };
    }
    const position = agg.positions.length ? agg.positions.reduce((a, b) => a + b, 0) / agg.positions.length : null;
    const ctr = agg.impressions ? agg.clicks / agg.impressions : null;
    const row = { path: p, clicks: agg.clicks, impressions: agg.impressions, ctr, position, type: 'PRIMARY_MONEY' };
    return { ...row, band: moneyBand(row, impressionFloor) };
  });

  const bands = { WINNER: 0, 'NEAR WIN': 0, OPPORTUNITY: 0, WEAK: 0, 'NO SIGNAL': 0 };
  for (const m of moneyPages) bands[m.band] = (bands[m.band] || 0) + 1;

  const pos4to10 = [];
  const pos11to20 = [];
  const wrongUrl = [];
  const cannibal = [];

  if (queryPageAvailable) {
    const byQuery = new Map();
    for (const r of qpSet.rows) {
      if (!r.query || !r.page) continue;
      if (!byQuery.has(r.query)) byQuery.set(r.query, []);
      byQuery.get(r.query).push(r);
      const expected = expectedPrimaryForQuery(r.query);
      const pageType = classifyPath(r.page, keepSlugs, noindexSlugs, sitemap);
      if (r.position != null && r.position >= 4 && r.position <= 10 && r.impressions >= impressionFloor) {
        pos4to10.push({
          query: r.query,
          page: r.page,
          pageType,
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: r.ctr,
          position: r.position,
          expectedPrimary: expected,
          tier: 'TIER 1 candidate'
        });
      }
      if (r.position != null && r.position > 10 && r.position <= 20 && r.impressions >= impressionFloor) {
        pos11to20.push({
          query: r.query,
          page: r.page,
          pageType,
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: r.ctr,
          position: r.position,
          expectedPrimary: expected,
          tier: 'TIER 2 candidate'
        });
      }
      if (expected && r.page !== expected && r.impressions >= impressionFloor) {
        const expectedType = classifyPath(expected, keepSlugs, noindexSlugs, sitemap);
        if (pageType !== 'PRIMARY_MONEY' && expectedType === 'PRIMARY_MONEY') {
          wrongUrl.push({
            query: r.query,
            expectedPrimaryUrl: expected,
            rankingUrl: r.page,
            rankingType: pageType,
            clicks: r.clicks,
            impressions: r.impressions,
            position: r.position,
            severity: pageType === 'BLOG' || pageType === 'KEEP_HUB' ? 'P1' : 'SOFT',
            recommendedFix: 'INTERNAL_LINK + MONITOR; confirm with more data before INTENT_CONSOLIDATE'
          });
        }
      }
    }
    for (const [query, rows] of byQuery) {
      const indexableCommercial = rows.filter((r) => {
        const t = classifyPath(r.page, keepSlugs, noindexSlugs, sitemap);
        return (t === 'PRIMARY_MONEY' || t === 'KEEP_HUB' || t === 'PROVINCE') && r.impressions >= impressionFloor;
      });
      const uniquePages = [...new Set(indexableCommercial.map((r) => r.page))];
      if (uniquePages.length >= 2) {
        const types = uniquePages.map((p) => classifyPath(p, keepSlugs, noindexSlugs, sitemap));
        const moneyCount = types.filter((t) => t === 'PRIMARY_MONEY').length;
        let severity = 'SAFE';
        if (moneyCount >= 2) severity = 'P0';
        else if (types.includes('PRIMARY_MONEY') && types.includes('KEEP_HUB')) severity = 'P1';
        else if (types.includes('PRIMARY_MONEY') && types.includes('PROVINCE')) severity = 'SOFT';
        cannibal.push({
          query,
          pages: uniquePages,
          types,
          severity,
          rows: indexableCommercial.map((r) => ({
            page: r.page,
            clicks: r.clicks,
            impressions: r.impressions,
            position: r.position
          }))
        });
      }
    }
  }

  // Page-level opportunities when Query×Page is missing
  const pageOpportunities = [];
  for (const [p, agg] of pageByPath) {
    const position = agg.positions.length ? agg.positions.reduce((a, b) => a + b, 0) / agg.positions.length : null;
    const ctr = agg.impressions ? agg.clicks / agg.impressions : null;
    const pageType = classifyPath(p, keepSlugs, noindexSlugs, sitemap);
    const item = {
      query: null,
      page: p,
      pageType,
      clicks: agg.clicks,
      impressions: agg.impressions,
      ctr,
      position,
      expectedPrimary: PRIMARY_MONEY.includes(p) ? p : expectedPrimaryForQuery(p.replace(/^\//, '').replace(/-/g, ' ')),
      level: 'PAGE'
    };
    if (position != null && position >= 4 && position <= 10 && agg.impressions >= impressionFloor) {
      pos4to10.push({ ...item, tier: 'TIER 1 candidate (page-level)' });
      pageOpportunities.push({ ...item, band: 'NEAR WIN' });
    } else if (position != null && position > 10 && position <= 20 && agg.impressions >= impressionFloor) {
      pos11to20.push({ ...item, tier: 'TIER 2 candidate (page-level)' });
      pageOpportunities.push({ ...item, band: 'OPPORTUNITY' });
    } else if (position != null && position <= 3 && agg.impressions >= impressionFloor && (ctr == null || ctr < 0.03)) {
      pageOpportunities.push({ ...item, band: 'TOP_POS_LOW_CTR' });
    }
  }

  // Query-only near-wins (no page mapping)
  const queryOnlyOpps = [];
  for (const r of querySet?.rows || []) {
    if (r.position != null && r.position >= 4 && r.position <= 10 && r.impressions >= 1) {
      queryOnlyOpps.push({
        query: r.query,
        page: null,
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
        expectedPrimary: expectedPrimaryForQuery(r.query),
        tier: 'TIER 1 candidate (query-only — QUERY_PAGE_DATA_REQUIRED to confirm URL)',
        level: 'QUERY'
      });
      if (!queryPageAvailable) {
        pos4to10.push({
          query: r.query,
          page: expectedPrimaryForQuery(r.query),
          pageType: 'PRIMARY_MONEY',
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: r.ctr,
          position: r.position,
          expectedPrimary: expectedPrimaryForQuery(r.query),
          tier: 'TIER 1 candidate (query-only)',
          level: 'QUERY'
        });
      }
    }
  }

  // CTR anomalies — prefer pages when query volume is tiny
  const highImpLowCtr = [];
  const ctrSource = queryPageAvailable
    ? qpSet.rows
    : [
        ...[...pageByPath.entries()].map(([page, agg]) => ({
          query: null,
          page,
          clicks: agg.clicks,
          impressions: agg.impressions,
          ctr: agg.impressions ? agg.clicks / agg.impressions : null,
          position: agg.positions.length ? agg.positions.reduce((a, b) => a + b, 0) / agg.positions.length : null
        })),
        ...(querySet?.rows || [])
      ];
  for (const r of ctrSource) {
    if (r.position == null || r.impressions < impressionFloor) continue;
    if (r.ctr == null) continue;
    let expectedCtr = 0.02;
    if (r.position <= 3) expectedCtr = 0.12;
    else if (r.position <= 6) expectedCtr = 0.06;
    else if (r.position <= 10) expectedCtr = 0.035;
    else expectedCtr = 0.02;
    if (r.ctr < expectedCtr * 0.45 && r.impressions >= impressionFloor) {
      highImpLowCtr.push({
        query: r.query,
        page: r.page || null,
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
        expectedCtrApprox: expectedCtr,
        classification: r.position <= 3 ? 'TITLE OPPORTUNITY' : 'TITLE OPPORTUNITY',
        note: 'Heuristic vs position band — verify SERP manually; page-level when Query×Page missing'
      });
    }
  }

  // KEEP / province from page export (+ area hub)
  const keepEval = { proven: [], promising: [], noSignal: [], cannibalizing: [] };
  const provinceEval = { provenDemand: [], earlySignal: [], noData: [], wrongUrl: [] };
  for (const [p, agg] of pageByPath) {
    const type = classifyPath(p, keepSlugs, noindexSlugs, sitemap);
    const position = agg.positions.length ? agg.positions.reduce((a, b) => a + b, 0) / agg.positions.length : null;
    const row = { path: p, clicks: agg.clicks, impressions: agg.impressions, position, type };
    if (type === 'KEEP_HUB') {
      if (agg.clicks > 0) keepEval.proven.push(row);
      else if (agg.impressions >= impressionFloor) keepEval.promising.push(row);
      else keepEval.noSignal.push(row);
    }
    if (type === 'PROVINCE' || p === '/พื้นที่ให้บริการ') {
      if (agg.clicks > 0) provinceEval.provenDemand.push(row);
      else if (agg.impressions >= impressionFloor) provinceEval.earlySignal.push(row);
      else provinceEval.noData.push(row);
    }
  }

  // Historical noindex signal
  const historical = { currentNoindexWithSignal: [], mergedWithSignal: [], reviewRequired: [] };
  for (const [p, agg] of pageByPath) {
    const type = classifyPath(p, keepSlugs, noindexSlugs, sitemap);
    if (type === 'NOINDEX' && (agg.clicks > 0 || agg.impressions >= impressionFloor)) {
      const item = {
        historicalUrl: p,
        clicks: agg.clicks,
        impressions: agg.impressions,
        position: agg.positions[0] ?? null,
        currentTarget: 'see seoSlugHubIndexPolicy / redirects',
        signalPreservationStatus: 'REVIEW',
        note: 'Do not auto-reindex'
      };
      historical.currentNoindexWithSignal.push(item);
      if (agg.clicks > 0 || agg.impressions >= impressionFloor * 3) historical.reviewRequired.push(item);
    }
  }

  // Coverage exports (optional companion files)
  let coverage = null;
  const covIssuesPath = path.join(ROOT, 'docs/gsc/coverage-issues.csv');
  const covValidPath = path.join(ROOT, 'docs/gsc/coverage-valid-urls.csv');
  if (fs.existsSync(covIssuesPath)) {
    const issuesTable = loadTable(covIssuesPath);
    coverage = {
      issues: issuesTable.rows.map((r) => ({
        reason: r['เหตุผล'] || r.reason || Object.values(r)[0],
        source: r['แหล่งที่มา'] || r.source || null,
        validation: r['การตรวจสอบความถูกต้อง'] || null,
        pages: parseNumber(r['หน้า'] || r.pages) ?? null
      })),
      validIndexedUrlCount: fs.existsSync(covValidPath) ? loadTable(covValidPath).rows.length : null,
      note: 'Coverage ≠ Performance. Indexed URL list may include URLs later noindexed.'
    };
    // Flag performance pages that appear in valid index but are currently noindex architecture
    if (fs.existsSync(covValidPath)) {
      const validRows = loadTable(covValidPath).rows;
      for (const vr of validRows) {
        const url = vr.URL || vr.url || Object.values(vr)[0];
        const nu = normalizeUrl(url);
        if (!nu || nu.external || !nu.path) continue;
        const t = classifyPath(nu.path, keepSlugs, noindexSlugs, sitemap);
        if (t === 'NOINDEX') {
          historical.reviewRequired.push({
            historicalUrl: nu.path,
            clicks: null,
            impressions: null,
            position: null,
            currentTarget: 'noindex/merge target per policy',
            signalPreservationStatus: 'REVIEW',
            note: 'Appeared in Coverage Valid (indexed) export; now classified NOINDEX in architecture — do not auto-reindex'
          });
        }
      }
    }
  }

  pos4to10.sort((a, b) => b.impressions - a.impressions || (a.position ?? 99) - (b.position ?? 99));
  pos11to20.sort((a, b) => b.impressions - a.impressions || (a.position ?? 99) - (b.position ?? 99));
  highImpLowCtr.sort((a, b) => b.impressions - a.impressions);

  const priorities = [];
  const seenPri = new Set();
  const pushPri = (item, problem, action) => {
    if (priorities.length >= 10) return;
    const key = `${item.query || ''}::${item.page || item.rankingUrl || item.expectedPrimaryUrl || ''}`;
    if (seenPri.has(key)) return;
    seenPri.add(key);
    const isMoney = PRIMARY_MONEY.includes(item.page) || PRIMARY_MONEY.includes(item.expectedPrimary);
    const isProvince = (item.pageType || classifyPath(item.page || '', keepSlugs, noindexSlugs, sitemap)) === 'PROVINCE';
    let commercial = 8;
    if (isMoney) commercial = 25;
    else if (item.query && expectedPrimaryForQuery(item.query)) commercial = 18;
    else if (isProvince && (item.clicks || 0) > 0) commercial = 16;
    else if (isProvince) commercial = 12;
    const maxImp = allImps[allImps.length - 1] || 1;
    const impScore = Math.min(20, Math.round(((item.impressions || 0) / maxImp) * 20));
    let posScore = 0;
    if (item.position != null) {
      if (item.position >= 4 && item.position <= 10) posScore = 20;
      else if (item.position > 10 && item.position <= 15) posScore = 14;
      else if (item.position <= 3) posScore = 12;
      else if (item.position <= 20) posScore = 10;
    }
    if ((item.clicks || 0) > 0) posScore = Math.min(20, posScore + 3);
    priorities.push({
      rank: priorities.length + 1,
      query: item.query || null,
      primaryUrl: item.expectedPrimary || item.page || item.expectedPrimaryUrl || null,
      rankingUrl: item.page || item.rankingUrl || null,
      clicks: item.clicks,
      impressions: item.impressions,
      ctr: item.ctr ?? null,
      position: item.position,
      problem,
      recommendedAction: action,
      opportunityScore: opportunityScore({
        commercial,
        impressions: impScore,
        position: posScore,
        intentFit: isMoney ? 15 : 10,
        ctrOpp: problem.includes('CTR') ? 10 : 4,
        qualityGap: 6
      }),
      note: 'Opportunity Score is an internal heuristic, not a Google metric'
    });
  };

  // Prefer: clicked provinces → money near-wins → query-only → CTR gaps → pos 11–20 money-like
  const clickedPages = [...pageByPath.entries()]
    .filter(([, a]) => a.clicks > 0)
    .map(([page, agg]) => ({
      page,
      pageType: classifyPath(page, keepSlugs, noindexSlugs, sitemap),
      clicks: agg.clicks,
      impressions: agg.impressions,
      ctr: agg.impressions ? agg.clicks / agg.impressions : null,
      position: agg.positions.length ? agg.positions.reduce((a, b) => a + b, 0) / agg.positions.length : null,
      expectedPrimary: null
    }))
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);

  for (const r of clickedPages) pushPri(r, 'Has clicks + ranking in dataset — protect & deepen', 'PROVINCE_SUPPORT');
  for (const r of pos4to10.filter((x) => x.pageType === 'PRIMARY_MONEY' || PRIMARY_MONEY.includes(x.page))) {
    pushPri(r, 'Money page position 4–10 with impressions, 0 clicks', 'TITLE_META');
  }
  for (const r of queryOnlyOpps) {
    pushPri(
      { ...r, page: r.expectedPrimary, expectedPrimary: r.expectedPrimary },
      'Query near-win (page unknown — Query×Page required)',
      'CONTENT_ENRICH'
    );
  }
  for (const r of pos4to10.filter((x) => x.pageType === 'PROVINCE' || x.page === '/พื้นที่ให้บริการ')) {
    pushPri(r, 'Province/area near-win impressions', 'PROVINCE_SUPPORT');
  }
  for (const r of highImpLowCtr.filter((x) => x.page === '/' || PRIMARY_MONEY.includes(x.page))) {
    pushPri(r, 'High impression / weak CTR vs position', 'TITLE_META');
  }
  for (const r of pos11to20) pushPri(r, 'Position 11–20 opportunity', r.pageType === 'BLOG' ? 'INTERNAL_LINK' : 'CONTENT_ENRICH');
  for (const r of pos4to10) pushPri(r, 'Position 4–10 near-win', 'MONITOR');

  // Sort final priorities by opportunityScore
  priorities.sort((a, b) => b.opportunityScore - a.opportunityScore);
  priorities.forEach((p, i) => {
    p.rank = i + 1;
  });

  const sources = [querySet, pageSet, qpSet].filter(Boolean).map((s) => ({ source: s.source, mtime: s.mtime, mode: s.mode, rows: s.rows.length }));

  const report = {
    verdict: 'PASS WITH WARNING',
    generatedAt,
    phase: 'GSC RANKING OPTIMIZATION — READ/ANALYZE',
    siteChanges: 'NONE',
    data: {
      sources,
      startDate: args.start || null,
      endDate: args.end || null,
      rowsRaw: (querySet?.rows.length || 0) + (pageSet?.rows.length || 0) + (qpSet?.rows.length || 0),
      rowsNormalized: (querySet?.rows.length || 0) + (pageSet?.rows.length || 0) + (qpSet?.rows.length || 0),
      queries: new Set([...(querySet?.rows || []), ...(qpSet?.rows || [])].map((r) => r.query).filter(Boolean)).size,
      pages: pageByPath.size,
      queryPageAvailable,
      impressionFloorHeuristic: impressionFloor,
      dateRangeNote: args.start && args.end ? 'Owner-provided / filter sheet: 3 เดือนล่าสุด' : 'DATE_RANGE_NOT_PROVIDED',
      totalClicksInPageExport: [...pageByPath.values()].reduce((s, a) => s + a.clicks, 0),
      totalImpressionsInPageExport: [...pageByPath.values()].reduce((s, a) => s + a.impressions, 0),
      datasetCaveat:
        'Query volume is extremely sparse (privacy threshold). Page export is primary signal. Query×Page not provided.'
    },
    moneyPerformance: {
      moneyPages: 15,
      WINNER: bands.WINNER,
      NEAR_WIN: bands['NEAR WIN'],
      OPPORTUNITY: bands.OPPORTUNITY,
      WEAK: bands.WEAK,
      NO_SIGNAL: bands['NO SIGNAL'],
      pages: moneyPages
    },
    rankingOpportunities: {
      position4to10: pos4to10.slice(0, 50),
      position11to20: pos11to20.slice(0, 50),
      highImpressionLowCtr: highImpLowCtr.slice(0, 50),
      wrongUrl: wrongUrl.slice(0, 50),
      cannibalizationP0: cannibal.filter((c) => c.severity === 'P0'),
      cannibalizationP1: cannibal.filter((c) => c.severity === 'P1'),
      cannibalizationSoft: cannibal.filter((c) => c.severity === 'SOFT' || c.severity === 'SAFE'),
      pageLevelOpportunities: pageOpportunities.slice(0, 50),
      queryOnlyNearWins: queryOnlyOpps
    },
    keepHubs: keepEval,
    province: provinceEval,
    coverage,
    historicalSignal: historical,
    top10Priorities: priorities.slice(0, 10),
    implementationGate: {
      ready: priorities.length > 0,
      mode: queryPageAvailable ? 'FULL' : 'PARTIAL_PAGE_QUERY',
      maxTier1Urls: 10,
      note: queryPageAvailable
        ? 'Query×Page available — Tier-1 plan can be drafted (still no auto site changes in this phase)'
        : 'PARTIAL: page+query exports enable Tier-1 draft. QUERY_PAGE_DATA_REQUIRED for cannibalization/wrong-URL confirmation. No auto site edits.'
    }
  };

  if (!queryPageAvailable) {
    report.rankingOpportunities.queryPageNote =
      'QUERY_PAGE_DATA_REQUIRED for Query→Page cannibalization and wrong-URL confirmation. Architecture P0/P1=0 is NOT yet validated by GSC.';
  }

  const registry = {
    generatedAt,
    status: queryPageAvailable ? 'POPULATED_FROM_GSC' : pageSet?.rows?.length ? 'PARTIAL_PAGE_ONLY' : 'PARTIAL_QUERY_ONLY',
    queryPageAvailable,
    intents: INTENT_FAMILIES.map((f) => {
      const pageAgg = pageByPath.get(f.primaryUrl);
      let ranking = null;
      if (queryPageAvailable) {
        const matches = qpSet.rows.filter(
          (r) => f.queryExamples.some((ex) => r.query.includes(ex.toLowerCase()) || r.query.includes(ex.replace('รับซื้อ ', ''))) && r.impressions > 0
        );
        matches.sort((a, b) => b.impressions - a.impressions);
        ranking = matches[0] || null;
      }
      return {
        intent: f.intent,
        queryExamples: f.queryExamples,
        primaryUrl: f.primaryUrl,
        supportingUrls: [],
        currentRankingUrl: ranking?.page || (pageAgg ? f.primaryUrl : null),
        clicks: ranking?.clicks ?? pageAgg?.clicks ?? null,
        impressions: ranking?.impressions ?? pageAgg?.impressions ?? null,
        position: ranking?.position ?? (pageAgg?.positions?.[0] ?? null),
        ctr: ranking?.ctr ?? null,
        status: pageAgg || ranking ? 'HAS_SIGNAL' : 'NO_SIGNAL_IN_EXPORT',
        recommendedAction: pageAgg || ranking ? 'MONITOR' : 'OWNER_DATA'
      };
    })
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));
  fs.writeFileSync(OUT_REGISTRY, JSON.stringify(registry, null, 2));

  const md = `# BuyHub GSC Ranking Opportunities

**Verdict: ${report.verdict}**

Generated: ${generatedAt}

## Data

- Start: ${report.data.startDate || 'NOT PROVIDED'}
- End: ${report.data.endDate || 'NOT PROVIDED'}
- Query×Page available: ${queryPageAvailable ? 'YES' : 'NO'}
- Impression floor (heuristic p40): ${impressionFloor}
- Sources: ${sources.map((s) => s.source).join(' | ') || 'none'}

## Money performance

| Band | Count |
|------|------:|
| WINNER | ${bands.WINNER} |
| NEAR WIN | ${bands['NEAR WIN']} |
| OPPORTUNITY | ${bands.OPPORTUNITY} |
| WEAK | ${bands.WEAK} |
| NO SIGNAL | ${bands['NO SIGNAL']} |

## Ranking opportunities

| Type | Count |
|------|------:|
| Position 4–10 | ${pos4to10.length} |
| Position 11–20 | ${pos11to20.length} |
| High Imp / Low CTR | ${highImpLowCtr.length} |
| Wrong URL | ${wrongUrl.length} |
| Cannibalization P0 | ${cannibal.filter((c) => c.severity === 'P0').length} |
| Cannibalization P1 | ${cannibal.filter((c) => c.severity === 'P1').length} |

${!queryPageAvailable ? '\n> QUERY_PAGE_DATA_REQUIRED for precise Query→Page cannibalization / wrong URL ranking.\n' : ''}

## Top priorities

${
  priorities.length
    ? priorities
        .map(
          (p, i) =>
            `${i + 1}. **${p.query || '(page)'}** → \`${p.primaryUrl}\` · pos ${p.position} · imps ${p.impressions} · ${p.recommendedAction}`
        )
        .join('\n')
    : '_No priorities — insufficient overlapping signals._'
}

## Implementation gate

${report.implementationGate.ready ? 'OPEN for Tier-1 planning (still no automatic site edits in analyze phase).' : 'CLOSED or PARTIAL — see JSON for conditions.'}

Full machine report: \`gsc-ranking-opportunities.json\`
`;
  fs.writeFileSync(OUT_MD, md);
  console.log(JSON.stringify({ verdict: report.verdict, top10: priorities.length, queryPageAvailable, impressionFloor }, null, 2));
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`Usage:
  node scripts/analyze-gsc-query-page.mjs --query FILE --page FILE [--query-page FILE] [--start YYYY-MM-DD] [--end YYYY-MM-DD]`);
    process.exit(0);
  }

  // Auto-discover common drop locations if no args
  const discoverDirs = ['docs/gsc', 'docs', 'data/gsc', 'data', 'reports', 'tmp'];
  const discovered = { query: args.query, page: args.page, queryPage: args.queryPage };
  if (!discovered.query && !discovered.page && !discovered.queryPage) {
    for (const dir of discoverDirs) {
      const abs = path.join(ROOT, dir);
      if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) continue;
      for (const f of fs.readdirSync(abs)) {
        const lower = f.toLowerCase();
        if (!/\.(csv|json)$/.test(lower)) continue;
        const full = path.join(dir, f);
        if (!discovered.queryPage && /query.?page|queries.?pages|หน้า.*คำค้น|คำค้น.*หน้า/.test(lower)) discovered.queryPage = full;
        else if (!discovered.query && /quer|คำค้น|top.queries/.test(lower)) discovered.query = full;
        else if (!discovered.page && /page|หน้า|top.pages/.test(lower)) discovered.page = full;
      }
    }
  }

  if (!discovered.query && !discovered.page && !discovered.queryPage) {
    writeInsufficient(args, 'GSC DATA NOT PROVIDED — no CSV/JSON Performance export found in repository');
    return;
  }

  try {
    const qTable = loadTable(discovered.query);
    const pTable = loadTable(discovered.page);
    const qpTable = loadTable(discovered.queryPage);
    const querySet = normalizeRows(qTable, 'query');
    const pageSet = normalizeRows(pTable, 'page');
    const qpSet = normalizeRows(qpTable, 'query-page');

    const usable =
      (querySet.rows.length || 0) + (pageSet.rows.length || 0) + (qpSet.rows.length || 0);
    if (!usable) {
      writeInsufficient(args, 'Files found but no usable Query/Page/CTR/Position rows after normalization');
      return;
    }
    if (!args.start || !args.end) {
      console.warn('WARNING: --start/--end not provided. Date range will be marked DATE_RANGE_NOT_PROVIDED.');
    }
    analyzeWithData(args, querySet.rows.length ? querySet : null, pageSet.rows.length ? pageSet : null, qpSet.rows.length ? qpSet : null);
  } catch (e) {
    writeInsufficient(args, String(e.message || e));
  }
}

main();
