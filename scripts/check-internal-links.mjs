import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');

/** @param {string} p */
async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

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

const ATTR_RE = /\b(?:href|src)\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi;

/** @param {string} raw */
function normalizeInternalTarget(raw) {
  const u = raw.trim();
  if (!u) return null;
  if (u.startsWith('#')) return null;
  if (u.startsWith('mailto:') || u.startsWith('tel:') || u.startsWith('sms:')) return null;
  if (u.startsWith('http://') || u.startsWith('https://')) return null;
  if (u.startsWith('data:')) return null;
  if (u.startsWith('javascript:')) return null;

  // If it looks like a relative link, treat it as internal-but-relative and skip:
  // Astro output prefers absolute-path internal links; relative ones can be valid but are hard
  // to resolve from a random dist HTML file without a full URL resolver.
  if (!u.startsWith('/')) return null;

  const withoutHash = u.split('#')[0] ?? '';
  const withoutQuery = withoutHash.split('?')[0] ?? '';
  if (!withoutQuery) return null;

  let p = withoutQuery;
  try {
    p = decodeURI(p);
  } catch {
    // keep as-is
  }

  // File assets with extensions
  const lastSeg = p.split('/').pop() ?? '';
  if (lastSeg.includes('.') && !p.endsWith('/')) {
    return p;
  }

  // Route → directory index.html
  if (p.endsWith('/')) return `${p}index.html`;
  return `${p}/index.html`;
}

async function main() {
  const files = await walk(DIST_DIR);
  const htmlFiles = files.filter((f) => f.toLowerCase().endsWith('.html'));

  /** @type {Map<string, Set<string>>} */
  const missing = new Map();

  for (const htmlPath of htmlFiles) {
    const html = await readFile(htmlPath, 'utf8');
    ATTR_RE.lastIndex = 0;
    let m;
    while ((m = ATTR_RE.exec(html))) {
      const raw = m[1] ?? m[2] ?? m[3] ?? '';
      const target = normalizeInternalTarget(raw);
      if (!target) continue;

      const diskPath = path.join(DIST_DIR, target.replace(/^\//, ''));
      // Some routes may resolve both with and without trailing slash; we already normalize.
      // Also allow index.html-less directory existence (rare).
      const ok = (await exists(diskPath)) || (target.endsWith('/index.html') && (await exists(diskPath.replace(/index\.html$/, ''))));
      if (!ok) {
        const relFromDist = path.relative(DIST_DIR, htmlPath);
        if (!missing.has(target)) missing.set(target, new Set());
        missing.get(target).add(relFromDist);
      }
    }
  }

  if (missing.size) {
    console.error(`Missing internal targets: ${missing.size}`);
    for (const [target, froms] of [...missing.entries()].sort((a, b) => a[0].localeCompare(b[0], 'th'))) {
      const sample = [...froms].slice(0, 6);
      console.error(`- ${target} (from: ${sample.join(', ')}${froms.size > sample.length ? ', …' : ''})`);
    }
    process.exit(1);
  }

  console.log(`OK: ${htmlFiles.length} HTML files scanned, no missing internal links.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

