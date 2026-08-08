/**
 * Full internal link graph for indexable inventory (from sitemap).
 * Requires dist/ from npm run build.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const dist = path.join(root, 'dist');
const site = 'https://buyhubthai.com';

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

function loadSitemapPaths() {
  // Prefer urlset sitemaps; skip sitemap-index.xml (its <loc> points at sitemap files).
  const files = fs
    .readdirSync(dist)
    .filter((f) => f.startsWith('sitemap') && f.endsWith('.xml') && !f.includes('index'));
  const urls = new Set();
  for (const f of files) {
    const xml = fs.readFileSync(path.join(dist, f), 'utf8');
    if (!xml.includes('<urlset')) continue;
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      try {
        const u = new URL(m[1]);
        const p = decodeURI(u.pathname).replace(/\/$/, '') || '/';
        if (p.endsWith('.xml')) continue;
        urls.add(p);
      } catch {
        /* ignore */
      }
    }
  }
  return [...urls].sort();
}

function htmlPathFor(pathname) {
  if (pathname === '/') return path.join(dist, 'index.html');
  const clean = pathname.replace(/^\//, '');
  const a = path.join(dist, clean, 'index.html');
  const b = path.join(dist, `${clean}.html`);
  if (fs.existsSync(a)) return a;
  if (fs.existsSync(b)) return b;
  return null;
}

function classifyPage(pathname) {
  if (pathname === '/') return 'homepage';
  if (pathname.startsWith('/บทความ')) return 'blog';
  if (pathname.startsWith('/พื้นที่ให้บริการ')) return 'province';
  if (PRIMARY_MONEY.includes(pathname)) return 'money';
  if (pathname === '/รับซื้อ' || pathname.startsWith('/sell/')) return 'sell-hub';
  if (
    pathname.startsWith('/รับซื้อ') ||
    pathname.startsWith('/รับเหมา') ||
    pathname.startsWith('/รับประมูล')
  )
    return 'keep-hub-or-service';
  return 'utility';
}

function linkPlacement(html, index) {
  const footerStart = html.lastIndexOf('<footer', index);
  if (footerStart !== -1) {
    const footerEnd = html.indexOf('</footer>', footerStart);
    if (footerEnd === -1 || index < footerEnd) return 'FOOTER';
  }
  const navStart = html.lastIndexOf('<nav', index);
  if (navStart !== -1) {
    const navEnd = html.indexOf('</nav>', navStart);
    if (navEnd === -1 || index < navEnd) return 'NAV';
  }
  const before = html.slice(Math.max(0, index - 500), index).toLowerCase();
  if (before.includes('breadcrumb')) return 'BREADCRUMB';
  if (before.includes('primary-money') || before.includes('money-link-panel')) return 'BLOG PANEL';
  if (before.includes('area-local') || before.includes('province-panel')) return 'PROVINCE PANEL';
  if (before.includes('combo-links') || before.includes('hub-discovery') || before.includes('related'))
    return 'RELATED CONTENT';
  return 'BODY CONTEXTUAL';
}

function normalizeHref(href, fromPath) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:'))
    return null;
  try {
    const base = site + (fromPath === '/' ? '/' : fromPath + '/');
    const u = new URL(href, base);
    if (u.origin !== site && !href.startsWith('/')) return null;
    if (u.hostname && u.hostname !== 'buyhubthai.com' && !href.startsWith('/')) return null;
    return decodeURI(u.pathname).replace(/\/$/, '') || '/';
  } catch {
    return null;
  }
}

const indexable = loadSitemapPaths();
const indexableSet = new Set(indexable);

const nodes = {};
for (const p of indexable) {
  nodes[p] = {
    path: p,
    pageType: classifyPage(p),
    inbound: [],
    outbound: [],
    uniqueSources: new Set(),
    anchorsIn: {},
    depth: null
  };
}

let edges = 0;
const placementCounts = {};

for (const from of indexable) {
  const file = htmlPathFor(from);
  if (!file) continue;
  const html = fs.readFileSync(file, 'utf8');
  const re = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const to = normalizeHref(m[1], from);
    if (!to || !indexableSet.has(to) || to === from) continue;
    const anchor = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
    const placement = linkPlacement(html, m.index);
    placementCounts[placement] = (placementCounts[placement] || 0) + 1;

    nodes[from].outbound.push({ to, anchor, placement });
    nodes[to].inbound.push({ from, anchor, placement });
    nodes[to].uniqueSources.add(from);
    nodes[to].anchorsIn[anchor || '(empty)'] = (nodes[to].anchorsIn[anchor || '(empty)'] || 0) + 1;
    edges++;
  }
}

// BFS depth from homepage
const queue = ['/'];
nodes['/'].depth = 0;
const seen = new Set(['/']);
while (queue.length) {
  const cur = queue.shift();
  const d = nodes[cur].depth;
  for (const edge of nodes[cur].outbound) {
    if (!nodes[edge.to] || seen.has(edge.to)) continue;
    // Prefer non-footer for crawl depth heuristic
    if (edge.placement === 'FOOTER') continue;
    seen.add(edge.to);
    nodes[edge.to].depth = d + 1;
    queue.push(edge.to);
  }
}
// Second pass: allow footer to fill remaining depths
for (const p of indexable) {
  if (nodes[p].depth != null) continue;
  for (const edge of nodes[p].inbound) {
    if (nodes[edge.from]?.depth != null) {
      nodes[p].depth = nodes[edge.from].depth + 1;
      break;
    }
  }
  if (nodes[p].depth == null) nodes[p].depth = 99;
}

function sourceWeight(fromPath, placement) {
  let w = 1;
  if (fromPath === '/') w += 5;
  if (PRIMARY_MONEY.includes(fromPath)) w += 3;
  if (fromPath === '/รับซื้อ') w += 2;
  if (placement === 'BODY CONTEXTUAL') w += 2;
  if (placement === 'NAV') w += 1.5;
  if (placement === 'RELATED CONTENT') w += 1;
  if (placement === 'FOOTER') w += 0.25;
  if (placement === 'BREADCRUMB') w += 0.5;
  return w;
}

function authorityBand(score, contextualUnique) {
  // Footer-heavy pages need contextual inbound to count as STRONG.
  if (score >= 28 && contextualUnique >= 3) return 'STRONG';
  if (score >= 16 || contextualUnique >= 2) return 'ADEQUATE';
  if (score >= 8 || contextualUnique >= 1) return 'WEAK';
  return 'CRITICAL';
}

const graphNodes = [];
for (const p of indexable) {
  const n = nodes[p];
  let score = 0;
  const contextualSources = new Set();
  for (const edge of n.inbound) {
    score += sourceWeight(edge.from, edge.placement);
    if (
      edge.placement === 'BODY CONTEXTUAL' ||
      edge.placement === 'RELATED CONTENT' ||
      edge.placement === 'BLOG PANEL' ||
      edge.placement === 'PROVINCE PANEL'
    ) {
      contextualSources.add(edge.from);
    }
  }
  if (n.depth != null && n.depth <= 2) score += 4;
  if (n.depth != null && n.depth >= 4) score -= 3;

  const uniqueInbound = n.uniqueSources.size;
  const contextualUniqueInbound = contextualSources.size;
  graphNodes.push({
    path: p,
    pageType: n.pageType,
    inboundCount: n.inbound.length,
    uniqueInbound,
    contextualUniqueInbound,
    outboundCount: n.outbound.length,
    depth: n.depth,
    authorityScore: Math.round(score * 10) / 10,
    authorityBand: authorityBand(score, contextualUniqueInbound),
    homepageLinked: n.uniqueSources.has('/'),
    topAnchors: Object.entries(n.anchorsIn)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([text, count]) => ({ text, count })),
    sampleSources: [...n.uniqueSources].slice(0, 12)
  });
}

const money = graphNodes.filter((n) => PRIMARY_MONEY.includes(n.path));
const orphans = graphNodes.filter((n) => n.uniqueInbound === 0);
const nearOrphans = graphNodes.filter((n) => n.uniqueInbound === 1);
const deep = graphNodes.filter((n) => n.depth > 3 && n.depth < 99);

const moneyAnchorReport = {};
for (const m of money) {
  moneyAnchorReport[m.path] = {
    authorityBand: m.authorityBand,
    authorityScore: m.authorityScore,
    uniqueInbound: m.uniqueInbound,
    contextualUniqueInbound: m.contextualUniqueInbound,
    topAnchors: m.topAnchors,
    exactMatchHeavy: m.topAnchors[0] && m.topAnchors[0].count / Math.max(1, m.inboundCount) > 0.7
  };
}

const homepageFile = htmlPathFor('/');
const homepageHtml = homepageFile ? fs.readFileSync(homepageFile, 'utf8') : '';
const homepageLinks = [];
if (homepageHtml) {
  const re = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  const seenH = new Set();
  while ((m = re.exec(homepageHtml))) {
    const to = normalizeHref(m[1], '/');
    if (!to || seenH.has(to)) continue;
    seenH.add(to);
    homepageLinks.push({
      to,
      anchor: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 80),
      placement: linkPlacement(homepageHtml, m.index),
      indexable: indexableSet.has(to)
    });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  note: 'Internal authority score is a heuristic (unique sources + source importance + placement + depth), not PageRank.',
  summary: {
    indexableUrls: indexable.length,
    totalInternalEdges: edges,
    orphans: orphans.length,
    nearOrphans: nearOrphans.length,
    depthGt3: deep.length,
    placementCounts,
    moneyAuthority: {
      STRONG: money.filter((m) => m.authorityBand === 'STRONG').length,
      ADEQUATE: money.filter((m) => m.authorityBand === 'ADEQUATE').length,
      WEAK: money.filter((m) => m.authorityBand === 'WEAK').length,
      CRITICAL: money.filter((m) => m.authorityBand === 'CRITICAL').length
    }
  },
  homepage: {
    uniqueOutbound: homepageLinks.length,
    indexableOutbound: homepageLinks.filter((l) => l.indexable).length,
    links: homepageLinks,
    linkDumpRisk: homepageLinks.filter((l) => l.indexable).length > 40 ? 'REVIEW' : 'OK'
  },
  moneyPages: money,
  moneyAnchorReport,
  orphans: orphans.map((n) => n.path),
  nearOrphans: nearOrphans.map((n) => ({ path: n.path, source: n.sampleSources[0] })),
  depthGt3: deep.map((n) => ({ path: n.path, depth: n.depth, type: n.pageType })),
  nodes: graphNodes
};

fs.writeFileSync(path.join(root, 'docs/internal-link-graph.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.summary, null, 2));
console.log('homepage unique outbound', report.homepage.uniqueOutbound, 'risk', report.homepage.linkDumpRisk);
console.log('Wrote docs/internal-link-graph.json');
