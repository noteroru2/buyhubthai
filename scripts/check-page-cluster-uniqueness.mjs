import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const MIN_LENGTH = 160;

const CLUSTERS = [
  {
    name: 'sell',
    maxOccurrences: 6,
    commonRepeatRatio: 0.2,
    match: (relativePath) => /^รับซื้อ[^/]*\/index\.html$/u.test(relativePath)
  },
  {
    name: 'sell-support',
    maxOccurrences: 6,
    commonRepeatRatio: 0.15,
    match: (relativePath) =>
      relativePath.startsWith('รับซื้อ/') &&
      relativePath.endsWith('/index.html') &&
      relativePath.split('/').length === 4
  },
  {
    name: 'area',
    maxOccurrences: 2,
    commonRepeatRatio: 0.6,
    match: (relativePath) => /^พื้นที่ให้บริการ(?:\/[^/]+)?\/index\.html$/u.test(relativePath)
  }
];

const IGNORE_PATTERNS = [
  /หน้านี้ตั้งใจตอบคำค้นหลักอย่าง/u,
  /ถ้าคุณกำลังค้นหาทั้ง/u,
  /บทความชุดนี้ตั้งใจช่วยตอบคำถามก่อนขายสินค้าไอทีมือสอง/u,
  /ส่วนนี้ตั้งใจสรุปเป็นชิ้นสั้น ๆ/u,
  /ส่วนนี้ตั้งใจทำให้มีคำตอบอยู่ใน HTML โดยตรง/u,
  /หลังจากดูหน้าจังหวัดแล้ว ขั้นถัดไปที่มีประโยชน์ที่สุด/u,
  /ถ้ายังไม่แน่ใจว่าจะเริ่มจากหน้าใด/u,
  /ตัวอย่างผลงานและรีวิวที่เชื่อมจากหน้านี้เป็นชุดข้อมูลประกอบแบบปิดข้อมูลส่วนตัว/u,
  /สำหรับลูกค้าที่อยู่ใน .* และต้องการขายหลายรายการพร้อมกัน/u,
  /การระบุพื้นที่ชัดเจนยังช่วยในแง่ GEO และ Local SEO/u,
  /โดยหลักแล้ว ข้อมูลตัวสินค้าอย่างรุ่น ความจุ สภาพ และอุปกรณ์/u,
  /ลูกค้าในจังหวัดหลัก เช่น/u,
  /อย่างไรก็ตาม BuyHub จะไม่สัญญาว่ารับซื้อถึงที่ทุกอำเภอ/u,
  /ส่งรูปสินค้าและรายละเอียดอย่าง รุ่น สเปกหรือความจุ/u,
  /ส่งรูปและรายละเอียดอย่าง รุ่น สเปกหรือความจุ/u,
  /รูปแบบการตรวจหรือส่งมอบอาจขึ้นอยู่กับพื้นที่/u,
  /สำหรับร้านค้า บริษัท หรือหน่วยงาน การส่งข้อมูลเป็นตาราง/u,
  /ถ้ามีข้อมูลเป็นไฟล์ Excel, Google Sheet/u,
  /BuyHub เน้นการประเมินที่เข้าใจง่ายและเป็นระบบ/u,
  /สำหรับองค์กรที่มีอุปกรณ์หลายรายการ การส่งรายการ/u
];

function walkHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkHtmlFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

function decodeHtml(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function normalizeText(text) {
  return decodeHtml(text).replace(/\s+/g, ' ').trim();
}

function stripTags(html) {
  return normalizeText(
    html
      .replace(/<br\s*\/?>/giu, ' ')
      .replace(/<[^>]+>/g, ' ')
  );
}

function extractParagraphs(html) {
  const articleLike =
    html.match(/<article\b[\s\S]*?<\/article>/iu)?.[0] ??
    html.match(/<main\b[\s\S]*?<\/main>/iu)?.[0] ??
    html;

  const cleaned = articleLike
    .replace(/<script\b[\s\S]*?<\/script>/giu, '')
    .replace(/<style\b[\s\S]*?<\/style>/giu, '')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/giu, '')
    .replace(/<svg\b[\s\S]*?<\/svg>/giu, '');

  const paragraphMatches = cleaned.match(/<p\b[^>]*>[\s\S]*?<\/p>/giu) ?? [];

  return paragraphMatches
    .map((paragraph) => stripTags(paragraph))
    .filter((paragraph) => paragraph.length >= MIN_LENGTH)
    .filter((paragraph) => !IGNORE_PATTERNS.some((pattern) => pattern.test(paragraph)));
}

function toRelativeDistPath(fullPath) {
  return path.relative(DIST_DIR, fullPath).replace(/\\/g, '/');
}

function collectClusterParagraphs(files, cluster) {
  const paragraphMap = new Map();

  for (const file of files) {
    const relativePath = toRelativeDistPath(file);
    if (!cluster.match(relativePath)) continue;

    const html = fs.readFileSync(file, 'utf8');
    const pageId = `/${relativePath.replace(/\/index\.html$/u, '')}`;

    for (const paragraph of extractParagraphs(html)) {
      if (!paragraphMap.has(paragraph)) paragraphMap.set(paragraph, new Set());
      paragraphMap.get(paragraph).add(pageId);
    }
  }

  return paragraphMap;
}

const htmlFiles = walkHtmlFiles(DIST_DIR);
const results = [];

for (const cluster of CLUSTERS) {
  const clusterPages = new Set(
    htmlFiles.filter((file) => cluster.match(toRelativeDistPath(file))).map((file) =>
      `/${toRelativeDistPath(file).replace(/\/index\.html$/u, '')}`
    )
  );
  const paragraphMap = collectClusterParagraphs(htmlFiles, cluster);
  const commonThreshold = Math.max(cluster.maxOccurrences + 1, Math.ceil(clusterPages.size * cluster.commonRepeatRatio));

  const normalizedEntries = [...paragraphMap.entries()]
    .map(([paragraph, pages]) => ({ paragraph, pages: [...pages].sort() }))
    .sort((a, b) => b.pages.length - a.pages.length || b.paragraph.length - a.paragraph.length);

  const ignoredCommon = normalizedEntries.filter((entry) => entry.pages.length >= commonThreshold);
  const repeated = normalizedEntries.filter(
    (entry) => entry.pages.length > cluster.maxOccurrences && entry.pages.length < commonThreshold
  );

  results.push({
    name: cluster.name,
    files: clusterPages.size,
    maxOccurrences: cluster.maxOccurrences,
    commonThreshold,
    ignoredCommonCount: ignoredCommon.length,
    repeated
  });
}

const failed = results.some((cluster) => cluster.repeated.length > 0);

if (failed) {
  console.error(
    JSON.stringify(
      {
        status: 'failed',
        minLength: MIN_LENGTH,
        clusters: results.map((cluster) => ({
          name: cluster.name,
          files: cluster.files,
          maxOccurrences: cluster.maxOccurrences,
          commonThreshold: cluster.commonThreshold,
          ignoredCommonCount: cluster.ignoredCommonCount,
          repeatedCount: cluster.repeated.length,
          repeated: cluster.repeated.slice(0, 12).map((entry) => ({
            count: entry.pages.length,
            pages: entry.pages,
            paragraph: entry.paragraph.slice(0, 220)
          }))
        }))
      },
      null,
      2
    )
  );
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      status: 'ok',
      minLength: MIN_LENGTH,
      clusters: results.map((cluster) => ({
        name: cluster.name,
        files: cluster.files,
        maxOccurrences: cluster.maxOccurrences,
        commonThreshold: cluster.commonThreshold,
        ignoredCommonCount: cluster.ignoredCommonCount,
        repeatedCount: 0
      }))
    },
    null,
    2
  )
);
