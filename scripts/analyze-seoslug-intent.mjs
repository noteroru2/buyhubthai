import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const kwRaw = fs.readFileSync(path.join(root, 'src/data/seoKeywords.ts'), 'utf8');
const thaiRoutesRaw = fs.readFileSync(path.join(root, 'src/lib/thaiRoutes.ts'), 'utf8');

const SEO_KEYWORDS = [...kwRaw.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const SELL_PATHS = [...thaiRoutesRaw.matchAll(/:\s*'(\/[^']+)'/g)].map((m) => m[1].replace(/^\//, ''));

const SYNONYM_EXCLUDED = [
  'รับซื้อไอโฟน',
  'รับซื้อไอแพด',
  'รับซื้อไอแมค',
  'รับซื้อแมคบุ๊ค',
  'รับซื้อ-macbook-pro',
  'รับซื้อ-macbook-air',
  'รับซื้อจอคอมพิวเตอร์',
  'รับซื้อโน๊ตบุ๊ค',
  'รับซื้อ-notebook',
  'รับซื้อคอมบริษัท',
  'รับซื้อคอมพิวเตอร์',
  'รับซื้อ-gaming-pc',
  'รับซื้อ-laptop-gaming'
];

function keywordToSlug(keyword) {
  return keyword
    .trim()
    .toLowerCase()
    .replace(/[&]+/g, ' ')
    .replace(/[\s/]+/g, '-')
    .replace(/[^a-z0-9\u0E00-\u0E7F-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const EXCLUDED = new Set(['รับซื้อ', ...SELL_PATHS, ...SYNONYM_EXCLUDED]);
const isExcluded = (kw) => EXCLUDED.has(keywordToSlug(kw));

const PRIMARY = {
  notebook: '/รับซื้อโน๊ตบุ๊คมือสอง',
  desktop: '/รับซื้อคอมพิวเตอร์มือสอง',
  macbook: '/รับซื้อ-macbook',
  iphone: '/รับซื้อ-iphone',
  ipad: '/รับซื้อ-ipad',
  phone: '/รับซื้อมือถือ',
  tablet: '/รับซื้อแท็บเล็ต',
  camera: '/รับซื้อกล้อง',
  gpu: '/รับซื้อการ์ดจอ',
  monitor: '/รับซื้อจอคอม',
  gamingPc: '/รับซื้อคอมเกมมิ่ง',
  corporate: '/รับซื้อคอมบริษัท',
  accessories: '/รับซื้ออุปกรณ์เสริม-it',
  gamingGear: '/รับซื้ออุปกรณ์เกมมิ่ง',
  ps5: '/รับซื้อ-ps5',
  switch: '/รับซื้อ-nintendo-switch',
  jbl: '/รับซื้อ-jbl',
  marshall: '/รับซื้อ-marshall',
  sellHub: '/รับซื้อ'
};

function classify(keyword) {
  const k = keyword.toLowerCase();
  if (isExcluded(keyword)) return { action: 'EXCLUDED', primary: null, reason: 'excluded from paths', score: 0 };

  // MERGE clear money cannibalization
  if (/รับซื้อ\s*(iphone|ไอโฟน)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.iphone, reason: '→ iPhone money', score: 40 };
  if (/รับซื้อ\s*(ipad|ไอแพด)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.ipad, reason: '→ iPad money', score: 40 };
  if (/รับซื้อ\s*(macbook|แมคบุ๊ค|imac|ไอแมค|mac\s*mini|mac\s*pro|mac\s*studio)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.macbook, reason: '→ MacBook money', score: 40 };
  if (/รับซื้อ\s*(notebook|โน๊ตบุ๊ค)/i.test(keyword) || /laptop\s*gaming|notebook\s*gaming|notebook\s*เกมมิ่ง|โน๊ตบุ๊คเกมมิ่ง/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.notebook, reason: '→ notebook money', score: 40 };
  if (/รับซื้อ\s*(การ์ดจอ|vga)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.gpu, reason: '→ GPU money', score: 40 };
  if (/รับซื้อ\s*(จอคอม|จอคอมพิวเตอร์)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.monitor, reason: '→ monitor money', score: 40 };
  if (/รับซื้อ\s*(คอมเกมมิ่ง|gaming\s*pc|คอมเล่นเกม|คอมร้านเกม|คอมสตรีมเกม|คอมเกมมิ่งประกอบ)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.gamingPc, reason: '→ gaming PC money', score: 40 };
  if (/รับซื้อ\s*(คอมบริษัท|คอมสำนักงาน|คอมองค์กร|คอมออฟฟิศ|คอมโรงงาน|คอมโรงเรียน|คอมปลดระวาง|คอมยกชุด|คอมเก่าจากสำนักงาน)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.corporate, reason: '→ corporate money', score: 40 };
  if (/^รับซื้อ\s*jbl$/i.test(keyword.trim())) return { action: 'MERGE', primary: PRIMARY.jbl, reason: '→ JBL money', score: 40 };
  if (/^รับซื้อ\s*marshall$/i.test(keyword.trim())) return { action: 'MERGE', primary: PRIMARY.marshall, reason: '→ Marshall money', score: 40 };
  if (/รับซื้อ\s*(ps5|playstation)/i.test(keyword)) return { action: 'MERGE', primary: PRIMARY.ps5, reason: '→ PS5 money', score: 40 };
  if (/รับซื้อ\s*(nintendo|switch)/i.test(keyword)) return { action: 'MERGE', primary: PRIMARY.switch, reason: '→ Switch money', score: 40 };
  if (/รับซื้อ\s*(อุปกรณ์\s*gaming|เกมมิ่งเกียร์|หูฟังเกมมิ่ง|เก้าอี้เกมมิ่ง|โต๊ะ\s*gaming|ชุดน้ำคอม)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.gamingGear, reason: '→ gaming gear money', score: 40 };
  if (/^รับซื้อกล้อง$/i.test(keyword.trim())) return { action: 'MERGE', primary: PRIMARY.camera, reason: '→ camera money', score: 35 };
  if (/^รับซื้อมือถือ$/i.test(keyword.trim()) || /รับซื้อมือถือ\s+(samsung|android|vivo|oppo|xiaomi|realme|honor|poco|huawei)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.phone, reason: '→ phone money', score: 40 };
  if (/^รับซื้อแท็บเล็ต$/i.test(keyword.trim()) || /รับซื้อ\s*(tablet|แท็บเล็ต|samsung\s*tablet|xiaomi\s*tablet|redmi\s*pad|android\s*tablet|huawei\s*tablet)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.tablet, reason: '→ tablet money', score: 40 };

  // Desktop / PC variants
  if (
    /รับซื้อ\s*(คอมพิวเตอร์|คอมตั้งโต๊ะ|คอมประกอบ(?!ร้านเกม)|คอมประกอบออฟฟิศ|คอมประกอบบริษัท|คอมตัดต่อ|คอมทำงาน|คอมสเปคสูง|คอมแบรนด์|คอมตกรุ่น|คอมทำงานกราฟิก|pc\s*workstation|^รับซื้อ\s*pc$)/i.test(
      keyword
    ) ||
    /รับซื้อ\s*pc\s+(acer|dell|hp|lenovo)/i.test(keyword) ||
    /mini\s*pc|nuc\s*pc|intel\s*nuc|asus\s*nuc|pc\s*all\s*in\s*one|pc\s*aio/i.test(keyword)
  ) {
    const brandDoor = /pc\s+(acer|dell|hp|lenovo)|mini\s*pc|nuc|aio|all\s*in\s*one/i.test(keyword);
    return {
      action: brandDoor ? 'NOINDEX' : 'MERGE',
      primary: PRIMARY.desktop,
      reason: brandDoor ? 'PC brand/form doorway → desktop' : '→ desktop money',
      score: brandDoor ? 36 : 40,
      cluster: brandDoor ? 'pc-brand' : undefined
    };
  }

  // Camera brands
  if (/กล้อง\s*(canon|nikon|sony|แคนนอน|นิคอน|โซนี่)|รับซื้อ\s*(fujifilm|leica|panasonic)/i.test(keyword)) {
    return { action: 'NOINDEX', primary: PRIMARY.camera, reason: 'camera brand doorway', score: 38, cluster: 'camera-brand' };
  }

  // Notebook brands / condition
  if (/รับซื้อ\s*notebook\s+(dell|hp|lenovo|acer|msi|asus|gigabyte)/i.test(keyword)) {
    return { action: 'NOINDEX', primary: PRIMARY.notebook, reason: 'notebook brand doorway', score: 36, cluster: 'nb-brand' };
  }
  if (/(เสีย|ซาก|จอแตก)/i.test(keyword) && /(โน๊ตบุ๊ค|notebook)/i.test(keyword)) {
    return { action: 'NOINDEX', primary: PRIMARY.notebook, reason: 'notebook condition doorway', score: 38, cluster: 'nb-condition' };
  }
  if (/(เสีย|ซาก)/i.test(keyword) && /(คอม|คอมพิวเตอร์)/i.test(keyword) && !/server/i.test(keyword)) {
    return { action: 'NOINDEX', primary: PRIMARY.desktop, reason: 'desktop condition doorway', score: 38, cluster: 'pc-condition' };
  }

  // SSD / HDD / UPS brand doorways
  if (/รับซื้อ\s*ssd\s+/i.test(keyword) && !/ssd\s*(server|m\.2|nvme)/i.test(keyword)) {
    return { action: 'NOINDEX', primary: '/รับซื้อ-ssd', reason: 'SSD brand doorway', score: 32, cluster: 'ssd-brand' };
  }
  if (/รับซื้อ\s*harddisk\s+(seagate|wd|toshib|hitachi|hgst|samsung|dell|hp|lenovo)/i.test(keyword)) {
    return { action: 'NOINDEX', primary: '/รับซื้อ-harddisk', reason: 'HDD brand doorway', score: 32, cluster: 'hdd-brand' };
  }
  if (/รับซื้อ\s*ups\s+/i.test(keyword) && !/ups\s*(server|rack)|แบตเตอรี่/i.test(keyword)) {
    return { action: 'NOINDEX', primary: '/รับซื้อ-ups', reason: 'UPS brand doorway', score: 34, cluster: 'ups-brand' };
  }

  // Synonym duplicates inside seoSlug set
  if (/^รับซื้อแรม$/i.test(keyword.trim())) return { action: 'NOINDEX', primary: '/รับซื้อ-ram', reason: 'synonym of รับซื้อ Ram', score: 40 };
  if (/^รับซื้อไมโครติก$/i.test(keyword.trim())) return { action: 'NOINDEX', primary: '/รับซื้อ-mikrotik', reason: 'synonym of Mikrotik', score: 40 };
  if (/^รับซื้อไดสัน$/i.test(keyword.trim())) return { action: 'NOINDEX', primary: '/รับซื้อ-dyson', reason: 'synonym of Dyson', score: 40 };
  if (/^รับซื้อโดรน$/i.test(keyword.trim())) return { action: 'NOINDEX', primary: '/รับซื้อ-drone', reason: 'synonym of drone', score: 40 };
  if (/^รับซื้อฮาร์ดดิสก์$/i.test(keyword.trim())) return { action: 'NOINDEX', primary: '/รับซื้อ-harddisk', reason: 'synonym of Harddisk', score: 40 };
  if (/^รับซื้อเครื่องสำรองไฟ$/i.test(keyword.trim())) return { action: 'NOINDEX', primary: '/รับซื้อ-ups', reason: 'synonym of UPS', score: 40 };
  if (/harman|bang\s*olufsen/i.test(keyword)) return { action: 'NOINDEX', primary: '/รับซื้อลำโพง', reason: 'speaker brand doorway', score: 36, cluster: 'speaker-brand' };
  if (/magic\s*mouse|magic\s*keyboard|apple\s*studio\s*display|microsoft\s*surface/i.test(keyword)) {
    return { action: 'NOINDEX', primary: PRIMARY.accessories, reason: 'accessory doorway', score: 42 };
  }

  // Server brand doorways → parent server hub
  if (/server\s+(dell|hp|cisco|lenovo|fujitsu|huawei|hitachi|ibm|oracle|supermicro)/i.test(keyword) || /รับซื้อซาก\s*server|รับซื้อ\s*server\s*เสีย/i.test(keyword)) {
    return { action: 'NOINDEX', primary: '/รับซื้อ-server-มือสอง', reason: 'server brand/condition doorway', score: 44, cluster: 'server-brand' };
  }

  // KEEP: B2B / infra / unique category hubs without money pages
  if (/รับเหมา|รับประมูล|รับซื้อทรัพย์สิน|รับซื้ออุปกรณ์ไอทีเก่า|รับซื้ออุปกรณ์ไอที$/i.test(keyword)) {
    return { action: 'KEEP', primary: null, reason: 'B2B/auction intent', score: 78, cluster: 'b2b' };
  }
  if (
    /server|nas|network|fortinet|aruba|ubiquiti|mikrotik|synology|qnap|firewall|router|switch|access\s*point|สาย\s*lan|ip\s*phone|ตู้\s*rack|storage|netapp|ruijie|zyxel|netgear|buffalo/i.test(
      keyword
    )
  ) {
    return { action: 'KEEP', primary: null, reason: 'infra/network intent (no money page)', score: 76, cluster: 'infra' };
  }
  if (/^รับซื้อ\s*ups$/i.test(keyword.trim()) || /แบตเตอรี่\s*ups|ups\s*server|ups\s*rack/i.test(keyword)) {
    return { action: 'KEEP', primary: null, reason: 'UPS category', score: 74, cluster: 'ups' };
  }
  if (
    /^รับซื้อ\s*(ram|cpu|ssd|harddisk|mainboard|power\s*supply|flash\s*drive|อะไหล่คอม|ram\s*pc|ram\s*notebook|ram\s*ecc|ssd\s*m\.2|ssd\s*nvme|external\s*harddisk|case\s*คอมพิวเตอร์|keyboard|คีย์บอร์ด|mouse|เม้าส์)$/i.test(
      keyword.trim()
    )
  ) {
    return { action: 'KEEP', primary: null, reason: 'component category hub', score: 72, cluster: 'component' };
  }
  if (
    /^รับซื้อ\s*(ลำโพง|เครื่องเสียง|bose|เครื่องใช้ไฟฟ้า|พัดลม|แอร์|เครื่องฟอกอากาศ|เครื่องกรองน้ำ|เก้าอี้นวด|เครื่องชงกาแฟ|เครื่องบดกาแฟ|ของย้ายบ้าน|drone|dyson)$/i.test(
      keyword.trim()
    )
  ) {
    return { action: 'KEEP', primary: null, reason: 'electronics category hub', score: 70, cluster: 'electronics' };
  }

  // Remaining harddisk specials / SSD specials that are category not brand
  if (/harddisk\s*(server|sas|กล้อง|synology|nas)/i.test(keyword) || /ssd\s*(server|m\.2|nvme)/i.test(keyword)) {
    return { action: 'KEEP', primary: null, reason: 'storage specialty hub', score: 68, cluster: 'storage' };
  }

  return { action: 'NOINDEX', primary: PRIMARY.sellHub, reason: 'low information-gain template', score: 35, cluster: 'default-thin' };
}

const hubs = [];
for (const keyword of SEO_KEYWORDS) {
  if (isExcluded(keyword)) continue;
  const slug = keywordToSlug(keyword);
  hubs.push({ keyword, slug, path: `/${slug}`, ...classify(keyword) });
}

const counts = {};
for (const h of hubs) counts[h.action] = (counts[h.action] || 0) + 1;

console.log('keywords total', SEO_KEYWORDS.length);
console.log('hubs generated', hubs.length);
console.log(counts);
console.log('\nKEEP (' + hubs.filter((h) => h.action === 'KEEP').length + ')');
for (const h of hubs.filter((h) => h.action === 'KEEP')) console.log('-', h.path, '::', h.cluster || h.reason);
console.log('\nMERGE', hubs.filter((h) => h.action === 'MERGE').length);
console.log('NOINDEX', hubs.filter((h) => h.action === 'NOINDEX').length);

const clusters = {};
for (const h of hubs.filter((x) => x.action === 'NOINDEX')) {
  clusters[h.cluster || 'other'] = (clusters[h.cluster || 'other'] || 0) + 1;
}
console.log('NOINDEX clusters', clusters);

fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(
  path.join(root, 'docs/seoslug-classification.json'),
  JSON.stringify({ hubs, counts, generatedAt: new Date().toISOString() }, null, 2)
);
console.log('Wrote docs/seoslug-classification.json');
