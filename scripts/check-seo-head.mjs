import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');

/** @param {string} dir */
async function walk(dir) {
  /** @type {string[]} */
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

function getMeta(html, key, value) {
  const re = new RegExp(`<meta\\s+[^>]*${key}\\s*=\\s*["']${escapeRegExp(value)}["'][^>]*content\\s*=\\s*["']([^"']+)["'][^>]*>`, 'i');
  const m = html.match(re);
  return m?.[1] ?? null;
}

function getLinkRel(html, rel) {
  const re = new RegExp(`<link\\s+[^>]*rel\\s*=\\s*["']${escapeRegExp(rel)}["'][^>]*href\\s*=\\s*["']([^"']+)["'][^>]*>`, 'i');
  const m = html.match(re);
  return m?.[1] ?? null;
}

function getJsonLdBlocks(html) {
  const blocks = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    blocks.push(m[1] ?? '');
  }
  return blocks;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function containsWebsiteSchema(json) {
  if (!json) return false;
  const arr = Array.isArray(json) ? json : [json];
  return arr.some((o) => {
    if (!o || typeof o !== 'object') return false;
    return o['@type'] === 'WebSite' || o['@id']?.toString?.().includes?.('#website');
  });
}

function isAbsoluteUrl(u) {
  return typeof u === 'string' && /^https?:\/\//i.test(u);
}

async function main() {
  const files = (await walk(DIST_DIR)).filter((f) => f.toLowerCase().endsWith('.html'));

  /** @type {{file:string; issues:string[]}[]} */
  const problems = [];

  for (const f of files) {
    const html = await readFile(f, 'utf8');
    const canonical = getLinkRel(html, 'canonical');
    const ogUrl = getMeta(html, 'property', 'og:url');
    const twCard = getMeta(html, 'name', 'twitter:card');
    const ogTitle = getMeta(html, 'property', 'og:title');
    const ogDesc = getMeta(html, 'property', 'og:description');

    const issues = [];
    if (!canonical) issues.push('missing canonical');
    else if (!isAbsoluteUrl(canonical)) issues.push(`canonical not absolute: ${canonical}`);

    if (!ogUrl) issues.push('missing og:url');
    else if (!isAbsoluteUrl(ogUrl)) issues.push(`og:url not absolute: ${ogUrl}`);

    if (canonical && ogUrl && canonical !== ogUrl) issues.push('canonical != og:url');
    if (!ogTitle) issues.push('missing og:title');
    if (!ogDesc) issues.push('missing og:description');
    if (!twCard) issues.push('missing twitter:card');

    const blocks = getJsonLdBlocks(html);
    if (!blocks.length) {
      issues.push('missing JSON-LD');
    } else {
      const parsed = blocks.map(safeJsonParse).filter(Boolean);
      if (!parsed.some(containsWebsiteSchema)) issues.push('missing WebSite schema in JSON-LD');
    }

    if (issues.length) problems.push({ file: path.relative(DIST_DIR, f), issues });
  }

  if (problems.length) {
    console.error(`SEO head check failed: ${problems.length}/${files.length} pages have issues`);
    for (const p of problems.slice(0, 50)) {
      console.error(`- ${p.file}: ${p.issues.join('; ')}`);
    }
    if (problems.length > 50) console.error(`... and ${problems.length - 50} more`);
    process.exit(1);
  }

  console.log(`OK: ${files.length} pages have canonical/OG/Twitter + JSON-LD (incl. WebSite).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

