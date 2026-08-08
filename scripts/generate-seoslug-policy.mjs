import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

spawnSync(process.execPath, ['scripts/analyze-seoslug-intent.mjs'], { stdio: 'inherit' });

const data = JSON.parse(fs.readFileSync('docs/seoslug-classification.json', 'utf8'));

const forceNoindex = new Map([
  ['รับซื้อคีย์บอร์ด', '/รับซื้อ-keyboard'],
  ['รับซื้อเม้าส์', '/รับซื้อ-mouse']
]);

const hubs = data.hubs.map((h) => {
  if (forceNoindex.has(h.slug)) {
    return {
      ...h,
      action: 'NOINDEX',
      primary: forceNoindex.get(h.slug),
      reason: 'synonym of kept component hub',
      score: 40
    };
  }
  return h;
});

const counts = {};
for (const h of hubs) counts[h.action] = (counts[h.action] || 0) + 1;

const noindexSlugs = hubs.filter((h) => h.action === 'NOINDEX' || h.action === 'MERGE').map((h) => h.slug);
const keep = hubs.filter((h) => h.action === 'KEEP').map((h) => h.slug);
const canonicalOverrides = Object.fromEntries(
  hubs.filter((h) => (h.action === 'MERGE' || h.action === 'NOINDEX') && h.primary).map((h) => [h.slug, h.primary])
);

fs.writeFileSync(
  'docs/seoslug-classification.json',
  JSON.stringify({ hubs, counts, generatedAt: new Date().toISOString() }, null, 2)
);

const body = `/** Auto-derived index policy for seoSlug hubs (KEEP vs MERGE/NOINDEX). */
export const SEO_SLUG_NOINDEX_HUB_SLUGS = new Set(${JSON.stringify(noindexSlugs, null, 2)});
export const SEO_SLUG_KEEP_HUB_SLUGS = new Set(${JSON.stringify(keep, null, 2)});
export const SEO_SLUG_CANONICAL_OVERRIDES = ${JSON.stringify(canonicalOverrides, null, 2)};
`;

fs.writeFileSync('src/data/seoSlugHubIndexPolicy.mjs', body);
console.log('counts', counts);
console.log('KEEP', keep.length, 'NOINDEX+MERGE', noindexSlugs.length);
