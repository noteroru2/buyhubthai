import fs from 'node:fs';
import path from 'node:path';
import {
  RECOVERY_CORE_MONEY_PATHS,
  RECOVERY_LOCAL_INDEX_ALLOWLIST,
  RECOVERY_TOPIC_SUPPRESSED_PATHS,
  isRecoverySuppressedPath
} from '../src/lib/recovery-policy.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const failures = [];
const warnings = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function builtHtmlPath(pathname) {
  const clean = pathname === '/' ? '' : pathname.replace(/^\//, '');
  const candidates = pathname === '/'
    ? [path.join(dist, 'index.html')]
    : [
        path.join(dist, `${clean}.html`),
        path.join(dist, clean, 'index.html')
      ];
  return candidates.find((file) => fs.existsSync(file)) || null;
}

function readHtml(pathname) {
  const file = builtHtmlPath(pathname);
  if (!file) {
    failures.push(`${pathname}: built HTML missing`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

const sitemapPath = path.join(dist, 'sitemap-0.xml');
assert(fs.existsSync(sitemapPath), 'dist/sitemap-0.xml missing');
const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => {
  try { return new URL(m[1]).pathname.replace(/\/$/, '') || '/'; } catch { return m[1]; }
});

for (const corePath of RECOVERY_CORE_MONEY_PATHS) {
  if (corePath === '/') continue;
  const html = readHtml(corePath);
  assert(!/noindex/i.test(html.match(/<meta[^>]+name=["']robots["'][^>]*>/i)?.[0] || ''), `${corePath}: core money page unexpectedly noindex`);
  assert(sitemapUrls.includes(corePath), `${corePath}: core money page missing from sitemap`);
}

const suppressedSamples = [
  '/รับซื้อ-iphone-ขอนแก่น',
  '/รับซื้อ-ipad-นครราชสีมา',
  '/รับซื้อ-macbook-อุดรธานี',
  '/รับซื้อโน๊ตบุ๊ค-ชัยภูมิ',
  '/รับซื้อคอมบริษัท-สุรินทร์',
  '/รับซื้อแอร์'
];

for (const p of suppressedSamples) {
  assert(isRecoverySuppressedPath(p), `${p}: expected recovery suppression`);
  const html = readHtml(p);
  assert(/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html), `${p}: suppressed page lacks noindex,follow`);
  assert(!sitemapUrls.includes(p), `${p}: suppressed page still present in sitemap`);
}

for (const p of RECOVERY_LOCAL_INDEX_ALLOWLIST) {
  const html = readHtml(p);
  assert(!/noindex/i.test(html.match(/<meta[^>]+name=["']robots["'][^>]*>/i)?.[0] || ''), `${p}: protected local page unexpectedly noindex`);
  assert(sitemapUrls.includes(p), `${p}: protected local page missing from sitemap`);
}

for (const p of RECOVERY_TOPIC_SUPPRESSED_PATHS) {
  assert(!sitemapUrls.includes(p), `${p}: off-topic page still present in sitemap`);
}

for (const p of ['/', '/รับซื้อ']) {
  const html = readHtml(p);
  assert(html.includes('data-buyhub-recovery="v1"'), `${p}: recovery authority surface missing`);
  assert(html.includes('/รับซื้อโน๊ตบุ๊คมือสอง'), `${p}: notebook core link missing from recovery surface`);
  assert(html.includes('/รับซื้อ-ipad'), `${p}: iPad core link missing from recovery surface`);
  assert(html.includes('/พื้นที่ให้บริการ/อุบลราชธานี'), `${p}: Ubon proven-area link missing from recovery surface`);
}

assert(sitemapUrls.length >= 100, `sitemap unexpectedly small: ${sitemapUrls.length}`);
assert(sitemapUrls.length <= 170, `sitemap recovery target exceeded: ${sitemapUrls.length} > 170`);

const summary = {
  sitemapUrls: sitemapUrls.length,
  protectedLocalPages: RECOVERY_LOCAL_INDEX_ALLOWLIST.size,
  suppressedTopicPages: RECOVERY_TOPIC_SUPPRESSED_PATHS.size,
  coreMoneyPages: RECOVERY_CORE_MONEY_PATHS.size,
  warnings
};

console.log('BUYHUB RECOVERY V1 QA');
console.log(JSON.stringify(summary, null, 2));

if (failures.length) {
  console.error('\nFAILURES');
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error('BUYHUB_RECOVERY_V1=FAIL');
  process.exit(1);
}

console.log('BUYHUB_RECOVERY_V1=PASS');
