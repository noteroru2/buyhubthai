/**
 * Re-audit KEEP seoSlug hubs for information gain / template footprint.
 * Run after: node scripts/generate-seoslug-policy.mjs && npm run build
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const classification = JSON.parse(fs.readFileSync(path.join(root, 'docs/seoslug-classification.json'), 'utf8'));
const keepHubs = classification.hubs.filter((h) => h.action === 'KEEP');

const enrichmentSrc = fs.readFileSync(path.join(root, 'src/data/seoSlugHubEnrichment.ts'), 'utf8');

function hasEnrichment(keyword) {
  const esc = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`'${esc}'\\s*:`).test(enrichmentSrc) || new RegExp(`'${esc}'`).test(enrichmentSrc);
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMain(html) {
  const m = html.match(/<article[\s\S]*?<\/article>/i) || html.match(/<main[\s\S]*?<\/main>/i);
  return stripHtml(m ? m[0] : html);
}

function extractMeta(html, name) {
  const re = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["']`, 'i');
  return (html.match(re) || html.match(re2) || [])[1] || '';
}

function extractTitle(html) {
  return (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '';
}

function extractH1(html) {
  return stripHtml((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '');
}

function countFaqs(html) {
  return (html.match(/itemtype=["']https:\/\/schema\.org\/Question["']/g) || []).length;
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function uniqueRatio(text, boilerplatePool) {
  const sentences = text
    .split(/[.!?。\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
  if (sentences.length === 0) return { uniqueSentences: 0, sharedRatio: 1 };
  let shared = 0;
  for (const s of sentences) {
    const key = s.slice(0, 48);
    if (boilerplatePool.has(key)) shared++;
    else boilerplatePool.add(key);
  }
  return {
    uniqueSentences: sentences.length - shared,
    sharedRatio: shared / sentences.length
  };
}

const dist = path.join(root, 'dist');
const pages = [];
const boilerplatePool = new Set();

// First pass collect shared templates from a sample of KEEP pages
for (const hub of keepHubs) {
  const file = path.join(dist, hub.slug, 'index.html');
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const main = extractMain(html);
  const sentences = main
    .split(/[.!?。\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 28);
  for (const s of sentences) {
    const key = s.slice(0, 48);
    // mark as candidate boilerplate if seen once; second pass will score
    if (!boilerplatePool.has('__seen__' + key)) boilerplatePool.add('__seen__' + key);
    else boilerplatePool.add(key);
  }
}

for (const hub of keepHubs) {
  const file = path.join(dist, hub.slug, 'index.html');
  const enriched = hasEnrichment(hub.keyword);
  let html = '';
  let main = '';
  let exists = fs.existsSync(file);
  if (exists) {
    html = fs.readFileSync(file, 'utf8');
    main = extractMain(html);
  }

  const wc = wordCount(main);
  const { uniqueSentences, sharedRatio } = uniqueRatio(main, new Set([...boilerplatePool]));
  const templateRatio = Math.round(sharedRatio * 100);
  const title = extractTitle(html);
  const h1 = extractH1(html);
  const robots = extractMeta(html, 'robots') || 'index,follow';
  const faqCount = countFaqs(html);
  const hasAnswerFirst = /หน้านี้เจาะ|ต่างจาก|จุดตรวจสำคัญ|ปัจจัย/.test(main);
  const entitySpecific = enriched && hasAnswerFirst;

  // Scores /100 heuristic
  let intent = entitySpecific ? 16 : enriched ? 12 : 8;
  let infoGain = entitySpecific ? 16 : enriched ? 11 : 6;
  let commercial = hub.cluster === 'b2b' || hub.cluster === 'infra' ? 12 : 10;
  let entity = entitySpecific ? 13 : enriched ? 10 : 5;
  let authority = hub.primary ? 7 : 4;
  let aeo = faqCount >= 2 && hasAnswerFirst ? 4 : faqCount >= 1 ? 3 : 1;
  let trust = 3;
  let structure = wc >= 400 ? 4 : wc >= 250 ? 3 : 2;
  let cannibal = templateRatio > 75 ? 1 : templateRatio > 60 ? 2 : templateRatio > 40 ? 3 : 4;

  // Soft adjustments
  if (templateRatio > 75) {
    infoGain = Math.min(infoGain, 8);
    intent = Math.min(intent, 10);
  }
  if (!enriched) {
    infoGain = Math.min(infoGain, 7);
    entity = Math.min(entity, 6);
  }

  const total = intent + infoGain + commercial + entity + authority + aeo + trust + structure + cannibal;

  let classificationLabel = 'KEEP ACCEPTABLE';
  if (total >= 85 && entitySpecific) classificationLabel = 'KEEP STRONG';
  else if (total >= 70) classificationLabel = 'KEEP IMPROVE';
  else if (total >= 55) classificationLabel = 'MERGE CANDIDATE';
  else classificationLabel = 'NOINDEX CANDIDATE';

  // After enrichment batch: enriched pages with decent scores become ACCEPTABLE/STRONG
  if (enriched && total >= 70 && entitySpecific) {
    classificationLabel = total >= 85 ? 'KEEP STRONG' : 'KEEP ACCEPTABLE';
  } else if (enriched && total >= 70) {
    classificationLabel = 'KEEP ACCEPTABLE';
  } else if (!enriched) {
    classificationLabel = total >= 55 ? 'OWNER DATA REQUIRED' : 'NOINDEX CANDIDATE';
  }

  pages.push({
    url: `https://buyhubthai.com${hub.path}`,
    path: hub.path,
    seoSlug: hub.slug,
    keyword: hub.keyword,
    productEntity: hub.keyword.replace(/^รับซื้อ\s*/i, ''),
    primaryIntent: hub.cluster || 'unknown',
    parentIntent: hub.primary || '/รับซื้อ',
    primaryMoneyPage: hub.primary,
    title,
    description: extractMeta(html, 'description'),
    h1,
    robots,
    mainContentWordCount: wc,
    uniqueBodySentences: uniqueSentences,
    templateRatioPct: templateRatio,
    templateFlag: templateRatio > 75 ? 'CRITICAL' : templateRatio > 60 ? 'HIGH' : templateRatio > 40 ? 'REVIEW' : 'OK',
    faqCount,
    enriched,
    informationGainScore20: infoGain,
    scores: {
      intentUniqueness: intent,
      informationGain: infoGain,
      commercialUtility: commercial,
      entitySpecificity: entity,
      internalAuthority: authority,
      aeo,
      trust,
      contentStructure: structure,
      cannibalizationSafety: cannibal,
      total
    },
    classification: classificationLabel,
    existsInDist: exists
  });
}

const summary = {
  generatedAt: new Date().toISOString(),
  initialKeep: 73,
  auditedKeep: keepHubs.length,
  counts: pages.reduce((acc, p) => {
    acc[p.classification] = (acc[p.classification] || 0) + 1;
    return acc;
  }, {}),
  averages: {
    score: pages.length ? Math.round(pages.reduce((s, p) => s + p.scores.total, 0) / pages.length) : 0,
    informationGain: pages.length
      ? Math.round((pages.reduce((s, p) => s + p.informationGainScore20, 0) / pages.length) * 10) / 10
      : 0,
    templateRatio: pages.length
      ? Math.round(pages.reduce((s, p) => s + p.templateRatioPct, 0) / pages.length)
      : 0
  },
  templateHeavy: pages.filter((p) => p.templateRatioPct > 60).length,
  enriched: pages.filter((p) => p.enriched).length,
  missingDist: pages.filter((p) => !p.existsInDist).map((p) => p.path)
};

const out = { summary, pages };
fs.writeFileSync(path.join(root, 'docs/seoslug-keep-quality.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(summary, null, 2));
console.log('Wrote docs/seoslug-keep-quality.json');
