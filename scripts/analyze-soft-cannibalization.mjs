/**
 * Soft cannibalization matrix: Primary Money × KEEP × Province × Blog.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const dist = path.join(root, 'dist');
const classification = JSON.parse(fs.readFileSync(path.join(root, 'docs/seoslug-classification.json'), 'utf8'));
const keep = classification.hubs.filter((h) => h.action === 'KEEP');

const MONEY = [
  { path: '/รับซื้อ-iphone', intent: 'iphone' },
  { path: '/รับซื้อ-ipad', intent: 'ipad' },
  { path: '/รับซื้อ-macbook', intent: 'macbook' },
  { path: '/รับซื้อโน๊ตบุ๊คมือสอง', intent: 'notebook' },
  { path: '/รับซื้อคอมพิวเตอร์มือสอง', intent: 'desktop' },
  { path: '/รับซื้อคอมเกมมิ่ง', intent: 'gaming-pc' },
  { path: '/รับซื้อมือถือ', intent: 'phone' },
  { path: '/รับซื้อแท็บเล็ต', intent: 'tablet' },
  { path: '/รับซื้อกล้อง', intent: 'camera' },
  { path: '/รับซื้อการ์ดจอ', intent: 'gpu' },
  { path: '/รับซื้อจอคอม', intent: 'monitor' },
  { path: '/รับซื้อคอมบริษัท', intent: 'corporate' }
];

function readPage(pathname) {
  const file =
    pathname === '/'
      ? path.join(dist, 'index.html')
      : path.join(dist, pathname.replace(/^\//, ''), 'index.html');
  if (!fs.existsSync(file)) return null;
  const html = fs.readFileSync(file, 'utf8');
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '';
  const h1 = ((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const intro = ((html.match(/<article[\s\S]{0,2500}/i) || [''])[0]).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 400);
  return { title, h1, intro };
}

function overlapScore(a, b) {
  if (!a || !b) return 0;
  const ta = `${a.title} ${a.h1}`.toLowerCase();
  const tb = `${b.title} ${b.h1}`.toLowerCase();
  const tokens = (s) => new Set(s.split(/[^a-z0-9\u0E00-\u0E7F]+/).filter((x) => x.length > 2));
  const A = tokens(ta);
  const B = tokens(tb);
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  const union = A.size + B.size - inter || 1;
  const titleH1 = inter / union;
  const introSim =
    a.intro && b.intro && a.intro.slice(0, 80) === b.intro.slice(0, 80) ? 0.4 : 0;
  return Math.round((titleH1 * 0.7 + introSim) * 100);
}

const rows = [];
for (const money of MONEY) {
  const m = readPage(money.path);
  const supporting = keep.filter((h) => h.primary === money.path || (h.cluster === 'component' && money.intent === 'desktop') || (h.cluster === 'b2b' && money.intent === 'corporate'));
  for (const hub of supporting.slice(0, 12)) {
    const h = readPage(hub.path);
    const score = overlapScore(m, h);
    let severity = 'SAFE';
    if (score >= 70) severity = 'P0';
    else if (score >= 55) severity = 'P1';
    else if (score >= 40) severity = 'P2';
    rows.push({
      intent: money.intent,
      primaryUrl: money.path,
      supportingUrl: hub.path,
      overlapScore: score,
      titleOverlap: overlapScore(
        { title: m?.title || '', h1: '', intro: '' },
        { title: h?.title || '', h1: '', intro: '' }
      ),
      severity,
      note: hub.enriched ? 'enriched hub' : hub.reason
    });
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  P0: rows.filter((r) => r.severity === 'P0').length,
  P1: rows.filter((r) => r.severity === 'P1').length,
  P2: rows.filter((r) => r.severity === 'P2').length,
  SAFE: rows.filter((r) => r.severity === 'SAFE').length,
  softCannibalDowngradesThisBatch: 10
};

fs.writeFileSync(
  path.join(root, 'docs/soft-cannibalization-matrix.json'),
  JSON.stringify({ summary, rows }, null, 2)
);
console.log(JSON.stringify(summary, null, 2));
