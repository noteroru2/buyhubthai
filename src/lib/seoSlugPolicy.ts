import { keywordToSlug } from './seoSlug';

export type SeoSlugAction = 'KEEP' | 'MERGE' | 'NOINDEX';

export type SeoSlugHubPolicy = {
  action: SeoSlugAction;
  /** Stronger URL when consolidating signals */
  primary: string | null;
  reason: string;
  score: number;
  cluster?: string;
};

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
} as const;

/**
 * Classify an indexable seoSlug *hub* keyword (not province locals).
 * Locals remain noindex separately in [seoSlug].astro.
 */
export function getSeoSlugHubPolicy(keyword: string): SeoSlugHubPolicy {
  const k = keyword.toLowerCase();

  if (/รับซื้อ\s*(iphone|ไอโฟน)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.iphone, reason: 'cannibalizes iPhone money page', score: 40 };
  if (/รับซื้อ\s*(ipad|ไอแพด)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.ipad, reason: 'cannibalizes iPad money page', score: 40 };
  if (/รับซื้อ\s*(macbook|แมคบุ๊ค|imac|ไอแมค|mac\s*mini|mac\s*pro|mac\s*studio)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.macbook, reason: 'cannibalizes MacBook money page', score: 40 };
  if (
    /รับซื้อ\s*(notebook|โน๊ตบุ๊ค)/i.test(keyword) ||
    /laptop\s*gaming|notebook\s*gaming|notebook\s*เกมมิ่ง|โน๊ตบุ๊คเกมมิ่ง/i.test(keyword)
  )
    return { action: 'MERGE', primary: PRIMARY.notebook, reason: 'cannibalizes notebook money page', score: 40 };
  if (/รับซื้อ\s*(การ์ดจอ|vga)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.gpu, reason: 'cannibalizes GPU money page', score: 40 };
  if (/รับซื้อ\s*(จอคอม|จอคอมพิวเตอร์)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.monitor, reason: 'cannibalizes monitor money page', score: 40 };
  if (/รับซื้อ\s*(คอมเกมมิ่ง|gaming\s*pc|คอมเล่นเกม|คอมร้านเกม|คอมสตรีมเกม|คอมเกมมิ่งประกอบ)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.gamingPc, reason: 'cannibalizes gaming PC money page', score: 40 };
  if (
    /รับซื้อ\s*(คอมบริษัท|คอมสำนักงาน|คอมองค์กร|คอมออฟฟิศ|คอมโรงงาน|คอมโรงเรียน|คอมปลดระวาง|คอมยกชุด|คอมเก่าจากสำนักงาน)/i.test(
      keyword
    )
  )
    return { action: 'MERGE', primary: PRIMARY.corporate, reason: 'cannibalizes corporate money page', score: 40 };
  if (/^รับซื้อ\s*jbl$/i.test(keyword.trim()))
    return { action: 'MERGE', primary: PRIMARY.jbl, reason: 'cannibalizes JBL money page', score: 40 };
  if (/^รับซื้อ\s*marshall$/i.test(keyword.trim()))
    return { action: 'MERGE', primary: PRIMARY.marshall, reason: 'cannibalizes Marshall money page', score: 40 };
  if (/รับซื้อ\s*(ps5|playstation)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.ps5, reason: 'cannibalizes PS5 money page', score: 40 };
  if (/รับซื้อ\s*(nintendo|switch)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.switch, reason: 'cannibalizes Switch money page', score: 40 };
  if (/รับซื้อ\s*(อุปกรณ์\s*gaming|เกมมิ่งเกียร์|หูฟังเกมมิ่ง|เก้าอี้เกมมิ่ง|โต๊ะ\s*gaming|ชุดน้ำคอม)/i.test(keyword))
    return { action: 'MERGE', primary: PRIMARY.gamingGear, reason: 'cannibalizes gaming gear money page', score: 40 };
  if (/^รับซื้อกล้อง$/i.test(keyword.trim()))
    return { action: 'MERGE', primary: PRIMARY.camera, reason: 'synonym of camera money page', score: 35 };
  if (
    /^รับซื้อมือถือ$/i.test(keyword.trim()) ||
    /รับซื้อมือถือ\s+(samsung|android|vivo|oppo|xiaomi|realme|honor|poco|huawei)/i.test(keyword)
  )
    return { action: 'MERGE', primary: PRIMARY.phone, reason: 'cannibalizes mobile money page', score: 40 };
  if (
    /^รับซื้อแท็บเล็ต$/i.test(keyword.trim()) ||
    /รับซื้อ\s*(tablet|แท็บเล็ต|samsung\s*tablet|xiaomi\s*tablet|redmi\s*pad|android\s*tablet|huawei\s*tablet)/i.test(
      keyword
    )
  )
    return { action: 'MERGE', primary: PRIMARY.tablet, reason: 'cannibalizes tablet money page', score: 40 };

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
      reason: brandDoor ? 'PC brand/form doorway' : 'cannibalizes desktop money page',
      score: brandDoor ? 36 : 40,
      cluster: brandDoor ? 'pc-brand' : undefined
    };
  }

  if (/กล้อง\s*(canon|nikon|sony|แคนนอน|นิคอน|โซนี่)|รับซื้อ\s*(fujifilm|leica|panasonic)/i.test(keyword)) {
    return { action: 'NOINDEX', primary: PRIMARY.camera, reason: 'camera brand doorway', score: 38, cluster: 'camera-brand' };
  }
  if (/รับซื้อ\s*notebook\s+(dell|hp|lenovo|acer|msi|asus|gigabyte)/i.test(keyword)) {
    return { action: 'NOINDEX', primary: PRIMARY.notebook, reason: 'notebook brand doorway', score: 36, cluster: 'nb-brand' };
  }
  if (/(เสีย|ซาก|จอแตก)/i.test(keyword) && /(โน๊ตบุ๊ค|notebook)/i.test(keyword)) {
    return { action: 'NOINDEX', primary: PRIMARY.notebook, reason: 'notebook condition doorway', score: 38, cluster: 'nb-condition' };
  }
  if (/(เสีย|ซาก)/i.test(keyword) && /(คอม|คอมพิวเตอร์)/i.test(keyword) && !/server/i.test(keyword)) {
    return { action: 'NOINDEX', primary: PRIMARY.desktop, reason: 'desktop condition doorway', score: 38, cluster: 'pc-condition' };
  }
  if (/รับซื้อ\s*ssd\s+/i.test(keyword) && !/ssd\s*(server|m\.2|nvme)/i.test(keyword)) {
    return { action: 'NOINDEX', primary: '/รับซื้อ-ssd', reason: 'SSD brand doorway', score: 32, cluster: 'ssd-brand' };
  }
  if (/รับซื้อ\s*harddisk\s+(seagate|wd|toshib|hitachi|hgst|samsung|dell|hp|lenovo)/i.test(keyword)) {
    return { action: 'NOINDEX', primary: '/รับซื้อ-harddisk', reason: 'HDD brand doorway', score: 32, cluster: 'hdd-brand' };
  }
  if (/รับซื้อ\s*ups\s+/i.test(keyword) && !/ups\s*(server|rack)|แบตเตอรี่/i.test(keyword)) {
    return { action: 'NOINDEX', primary: '/รับซื้อ-ups', reason: 'UPS brand doorway', score: 34, cluster: 'ups-brand' };
  }

  // Intra-seoSlug synonym consolidation (keep EN/tech form)
  if (/^รับซื้อแรม$/i.test(keyword.trim()))
    return { action: 'NOINDEX', primary: '/รับซื้อ-ram', reason: 'synonym of รับซื้อ Ram', score: 40 };
  if (/^รับซื้อคีย์บอร์ด$/i.test(keyword.trim()))
    return { action: 'NOINDEX', primary: '/รับซื้อ-keyboard', reason: 'synonym of keyboard hub', score: 40 };
  if (/^รับซื้อเม้าส์$/i.test(keyword.trim()))
    return { action: 'NOINDEX', primary: '/รับซื้อ-mouse', reason: 'synonym of mouse hub', score: 40 };
  if (/^รับซื้อไมโครติก$/i.test(keyword.trim()))
    return { action: 'NOINDEX', primary: '/รับซื้อ-mikrotik', reason: 'synonym of Mikrotik hub', score: 40 };
  if (/^รับซื้อไดสัน$/i.test(keyword.trim()))
    return { action: 'NOINDEX', primary: '/รับซื้อ-dyson', reason: 'synonym of Dyson hub', score: 40 };
  if (/^รับซื้อโดรน$/i.test(keyword.trim()))
    return { action: 'NOINDEX', primary: '/รับซื้อ-drone', reason: 'synonym of drone hub', score: 40 };
  if (/^รับซื้อฮาร์ดดิสก์$/i.test(keyword.trim()))
    return { action: 'NOINDEX', primary: '/รับซื้อ-harddisk', reason: 'synonym of Harddisk hub', score: 40 };
  if (/^รับซื้อเครื่องสำรองไฟ$/i.test(keyword.trim()))
    return { action: 'NOINDEX', primary: '/รับซื้อ-ups', reason: 'synonym of UPS hub', score: 40 };
  if (/harman|bang\s*olufsen/i.test(keyword))
    return { action: 'NOINDEX', primary: '/รับซื้อลำโพง', reason: 'speaker brand doorway', score: 36, cluster: 'speaker-brand' };
  if (/magic\s*mouse|magic\s*keyboard|apple\s*studio\s*display|microsoft\s*surface/i.test(keyword)) {
    return { action: 'NOINDEX', primary: PRIMARY.accessories, reason: 'accessory doorway', score: 42 };
  }
  if (
    /server\s+(dell|hp|cisco|lenovo|fujitsu|huawei|hitachi|ibm|oracle|supermicro)/i.test(keyword) ||
    /รับซื้อซาก\s*server|รับซื้อ\s*server\s*เสีย/i.test(keyword)
  ) {
    return {
      action: 'NOINDEX',
      primary: '/รับซื้อ-server-มือสอง',
      reason: 'server brand/condition doorway',
      score: 44,
      cluster: 'server-brand'
    };
  }

  // Soft cannibalization among former KEEP siblings (template-near-duplicates)
  if (/^รับซื้อเครื่องเสียง$/i.test(keyword.trim()))
    return { action: 'NOINDEX', primary: '/รับซื้อลำโพง', reason: 'soft overlap → speaker category', score: 48, cluster: 'soft-cannibal' };
  if (/^รับซื้อ\s*bose$/i.test(keyword.trim()))
    return { action: 'NOINDEX', primary: '/รับซื้อลำโพง', reason: 'speaker brand doorway', score: 42, cluster: 'soft-cannibal' };
  if (/harddisk\s*synology/i.test(keyword))
    return { action: 'NOINDEX', primary: '/รับซื้อ-synology', reason: 'soft overlap → Synology hub', score: 50, cluster: 'soft-cannibal' };
  if (/harddisk\s*nas/i.test(keyword))
    return { action: 'NOINDEX', primary: '/รับซื้อ-nas-storage', reason: 'soft overlap → NAS storage', score: 50, cluster: 'soft-cannibal' };
  if (/ups\s*(server|rack)/i.test(keyword))
    return { action: 'NOINDEX', primary: '/รับซื้อ-ups', reason: 'soft overlap → UPS category', score: 50, cluster: 'soft-cannibal' };
  if (/รับซื้ออุปกรณ์ไอทีเก่าบริษัท/i.test(keyword))
    return { action: 'NOINDEX', primary: '/รับซื้อทรัพย์สินไอทีบริษัท', reason: 'soft overlap B2B asset', score: 52, cluster: 'soft-cannibal' };
  if (/รับเหมาคอมสำนักงาน/i.test(keyword))
    return { action: 'NOINDEX', primary: '/รับเหมาคอมพิวเตอร์', reason: 'soft overlap B2B bulk', score: 52, cluster: 'soft-cannibal' };
  if (/รับประมูลงานคอมพิวเตอร์/i.test(keyword))
    return { action: 'NOINDEX', primary: '/รับประมูลคอมพิวเตอร์', reason: 'soft overlap auction', score: 52, cluster: 'soft-cannibal' };
  if (/^รับซื้อเครื่องบดกาแฟ$/i.test(keyword.trim()))
    return { action: 'NOINDEX', primary: '/รับซื้อเครื่องชงกาแฟ', reason: 'soft overlap coffee gear', score: 48, cluster: 'soft-cannibal' };

  if (/รับเหมา|รับประมูล|รับซื้อทรัพย์สิน|รับซื้ออุปกรณ์ไอที$/i.test(keyword)) {
    return {
      action: 'KEEP',
      primary: PRIMARY.corporate,
      reason: 'B2B/auction intent without money page',
      score: 78,
      cluster: 'b2b'
    };
  }
  if (
    /server|nas|network|fortinet|aruba|ubiquiti|mikrotik|synology|qnap|firewall|router|switch|access\s*point|สาย\s*lan|ip\s*phone|ตู้\s*rack|storage|netapp|ruijie|zyxel|netgear|buffalo/i.test(
      keyword
    )
  ) {
    return {
      action: 'KEEP',
      primary: /server|nas|storage|rack|synology|qnap|netapp/i.test(keyword)
        ? '/รับซื้อ-server-มือสอง'
        : PRIMARY.corporate,
      reason: 'infra/network intent without money page',
      score: 76,
      cluster: 'infra'
    };
  }
  if (/^รับซื้อ\s*ups$/i.test(keyword.trim()) || /แบตเตอรี่\s*ups/i.test(keyword)) {
    return {
      action: 'KEEP',
      primary: '/รับซื้อ-server-มือสอง',
      reason: 'UPS category hub',
      score: 74,
      cluster: 'ups'
    };
  }
  if (
    /^รับซื้อ\s*(ram|cpu|ssd|harddisk|mainboard|power\s*supply|flash\s*drive|อะไหล่คอม|ram\s*pc|ram\s*notebook|ram\s*ecc|ssd\s*m\.2|ssd\s*nvme|external\s*harddisk|case\s*คอมพิวเตอร์|keyboard|mouse)$/i.test(
      keyword.trim()
    )
  ) {
    return {
      action: 'KEEP',
      primary: PRIMARY.desktop,
      reason: 'component category hub',
      score: 72,
      cluster: 'component'
    };
  }
  if (
    /^รับซื้อ\s*(ลำโพง|เครื่องใช้ไฟฟ้า|พัดลม|แอร์|เครื่องฟอกอากาศ|เครื่องกรองน้ำ|เก้าอี้นวด|เครื่องชงกาแฟ|ของย้ายบ้าน|drone|dyson)$/i.test(
      keyword.trim()
    )
  ) {
    return {
      action: 'KEEP',
      primary: PRIMARY.sellHub,
      reason: 'electronics category hub',
      score: 70,
      cluster: 'electronics'
    };
  }
  if (/harddisk\s*(server|sas|กล้อง)/i.test(keyword) || /ssd\s*(server|m\.2|nvme)/i.test(keyword)) {
    return {
      action: 'KEEP',
      primary: /ssd|harddisk/i.test(keyword) ? PRIMARY.desktop : '/รับซื้อ-server-มือสอง',
      reason: 'storage specialty hub',
      score: 68,
      cluster: 'storage'
    };
  }

  return {
    action: 'NOINDEX',
    primary: PRIMARY.sellHub,
    reason: 'low information-gain template hub',
    score: 35,
    cluster: 'default-thin'
  };
}

export function isIndexableSeoSlugHub(keyword: string): boolean {
  return getSeoSlugHubPolicy(keyword).action === 'KEEP';
}

/** Pathnames that are seoSlug hubs marked MERGE/NOINDEX — exclude from sitemap. */
export function shouldNoindexSeoSlugHubPath(pathname: string, keywordBySlug: Map<string, string>): boolean {
  const clean = pathname.replace(/\/$/, '') || '/';
  if (clean === '/' || clean.includes('/')) {
    // hub paths are single-segment /{slug}
  }
  const slug = clean.replace(/^\//, '');
  if (slug.includes('/')) return false;
  const keyword = keywordBySlug.get(slug);
  if (!keyword) return false;
  return getSeoSlugHubPolicy(keyword).action !== 'KEEP';
}

export function buildKeywordBySlug(keywords: string[], toSlug: (k: string) => string, isExcluded: (k: string) => boolean) {
  const map = new Map<string, string>();
  for (const keyword of keywords) {
    if (isExcluded(keyword)) continue;
    map.set(toSlug(keyword), keyword);
  }
  return map;
}

export { keywordToSlug };
