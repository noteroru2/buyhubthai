import fs from 'node:fs';
import assert from 'node:assert/strict';
const host = 'https://buyhubthai.com';
const sitemap = [...fs.readFileSync('dist/sitemap-0.xml', 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
const read = p => fs.readFileSync(`dist/${p === '/' ? '' : p.slice(1) + '/'}index.html`, 'utf8');
const main = html => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
const pages = ['/', '/รับซื้อ', '/รับซื้อโน๊ตบุ๊คมือสอง', '/รับซื้อคอมพิวเตอร์มือสอง', '/รับซื้อ-macbook', '/รับซื้อ-iphone', '/รับซื้อ-ipad', '/รับซื้อคอมบริษัท', '/ติดต่อเรา', '/ขั้นตอนการขาย', '/เกี่ยวกับเรา', '/บทความ', '/พื้นที่ให้บริการ', '/ผลงานรับซื้อจริง'];
for (const p of pages) {
  const html = read(p);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${p}: expected one h1`);
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  assert.equal(decodeURI(canonical ?? ''), host + p, `${p}: canonical changed`);
  assert(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html), `${p}: core page noindex`);
  assert(sitemap.some(url => (decodeURI(url).replace(/\/$/, '') || '/') === (host + p).replace(/\/$/, '')), `${p}: missing from sitemap`);
  assert(html.includes('https://line.me/R/ti/p/@buyhub'), `${p}: LINE missing`);
  assert(html.includes('tel:+66955479408'), `${p}: phone changed`);
  const content = main(html).replace(/<script[\s\S]*?<\/script>/g, '');
  assert(!/SEO|AEO|GEO|AUTO LONGFORM|ควรทำหน้าที่|รับ intent/.test(content), `${p}: editorial instructions leaked`);
}
const notebook = main(read('/รับซื้อโน๊ตบุ๊คมือสอง'));
assert(!/ถาดกระดาษ|ติดกระดาษ|ปากกา.*คีย์บอร์ด.*กล่อง/.test(notebook), 'Notebook contains unrelated product advice');
const proof = main(read('/ผลงานรับซื้อจริง'));
assert(!/98%|94%|3D Touch|สลิป/.test(proof), 'Unverified transaction details on gallery');
// No changes to the established indexing recovery policy or URL surface in this rebuild.
assert.equal(sitemap.length, 150, 'Unexpected sitemap URL count: review migration explicitly');
for(const url of sitemap) {
  const p = decodeURI(new URL(url).pathname);
  const html = read(p);
  const robots = html.match(/<meta[^>]*name="robots"[^>]*>/i)?.[0] ?? '';
  assert(!/noindex/.test(robots), `${p}: noindex URL in sitemap`);
  for(const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
}
console.log(`BUYHUB_REBUILD=PASS: ${pages.length} key flows, ${sitemap.length} sitemap URLs; contacts, canonicals, headings and product relevance verified.`);
