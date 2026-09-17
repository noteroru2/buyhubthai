/** BuyHub Recovery V1 policy.
 * Fresh GSC (2026-06-19..2026-09-16) shows near-zero visibility across the site.
 * Recovery goal: reduce local product×province crawl noise while protecting core money pages,
 * the real Ubon service market, and the two local URLs that still showed Search Console signal.
 */

export const BUYHUB_RECOVERY_VERSION = '2026-09-18-v1';

export const RECOVERY_PROVINCE_NAMES = [
  'ขอนแก่น','นครราชสีมา','อุดรธานี','อุบลราชธานี','อำนาจเจริญ','บึงกาฬ','บุรีรัมย์',
  'ชัยภูมิ','กาฬสินธุ์','เลย','มหาสารคาม','มุกดาหาร','นครพนม','หนองบัวลำภู',
  'หนองคาย','ร้อยเอ็ด','สกลนคร','ศรีสะเกษ','สุรินทร์','ยโสธร'
];

export const RECOVERY_LOCAL_PRODUCT_PREFIXES = [
  '/รับซื้อ-iphone-',
  '/รับซื้อ-ipad-',
  '/รับซื้อ-macbook-',
  '/รับซื้อโน๊ตบุ๊ค-',
  '/รับซื้อคอมบริษัท-'
];

/**
 * Ubon is the verified operating market. Two Nong Khai pages are temporarily protected
 * because the fresh 90-day GSC page export still showed impressions for them.
 */
export const RECOVERY_LOCAL_INDEX_ALLOWLIST = new Set([
  '/รับซื้อ-iphone-อุบลราชธานี',
  '/รับซื้อ-ipad-อุบลราชธานี',
  '/รับซื้อ-macbook-อุบลราชธานี',
  '/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี',
  '/รับซื้อคอมบริษัท-อุบลราชธานี',
  '/รับซื้อ-macbook-หนองคาย',
  '/รับซื้อโน๊ตบุ๊ค-หนองคาย'
]);

/** Off-topic household pages are retained as routes but removed from index competition. */
export const RECOVERY_TOPIC_SUPPRESSED_PATHS = new Set([
  '/รับซื้อพัดลม',
  '/รับซื้อของย้ายบ้าน',
  '/รับซื้อเก้าอี้นวด',
  '/รับซื้อเครื่องชงกาแฟ',
  '/รับซื้อเครื่องฟอกอากาศ',
  '/รับซื้อเครื่องกรองน้ำ',
  '/รับซื้อเครื่องใช้ไฟฟ้า',
  '/รับซื้อแอร์'
]);

export const RECOVERY_CORE_MONEY_PATHS = new Set([
  '/',
  '/รับซื้อ',
  '/รับซื้อโน๊ตบุ๊คมือสอง',
  '/รับซื้อคอมพิวเตอร์มือสอง',
  '/รับซื้อ-macbook',
  '/รับซื้อ-iphone',
  '/รับซื้อ-ipad',
  '/รับซื้อมือถือ',
  '/รับซื้อแท็บเล็ต',
  '/รับซื้อกล้อง',
  '/รับซื้อการ์ดจอ',
  '/รับซื้อจอคอม',
  '/รับซื้อคอมเกมมิ่ง',
  '/รับซื้อคอมบริษัท',
  '/รับซื้ออุปกรณ์สำนักงาน-it',
  '/รับซื้ออุปกรณ์เกมมิ่ง',
  '/รับซื้อ-ps5',
  '/รับซื้อ-nintendo-switch',
  '/รับซื้อ-jbl',
  '/รับซื้อ-marshall',
  '/รับซื้อ-server-มือสอง',
  '/รับซื้อ-ram',
  '/รับซื้อ-ssd',
  '/รับซื้อ-harddisk',
  '/รับซื้อ-ups'
]);

export const RECOVERY_PROVEN_AREA_PATHS = new Set([
  '/พื้นที่ให้บริการ',
  '/พื้นที่ให้บริการ/สุรินทร์',
  '/พื้นที่ให้บริการ/อุบลราชธานี',
  '/พื้นที่ให้บริการ/นครพนม',
  '/พื้นที่ให้บริการ/เลย'
]);

function decodePath(pathname) {
  try { return decodeURIComponent(pathname); } catch { return pathname; }
}

export function normalizeRecoveryPath(pathname) {
  const clean = decodePath(pathname || '/').split('?')[0].replace(/\/$/, '');
  return clean || '/';
}

export function isRecoveryLocalProductPage(pathname) {
  const clean = normalizeRecoveryPath(pathname);
  const endsProvince = RECOVERY_PROVINCE_NAMES.some((province) => clean.endsWith(`-${province}`));
  if (!endsProvince) return false;
  return RECOVERY_LOCAL_PRODUCT_PREFIXES.some((prefix) => clean.startsWith(prefix));
}

export function isRecoverySuppressedPath(pathname) {
  const clean = normalizeRecoveryPath(pathname);
  if (RECOVERY_TOPIC_SUPPRESSED_PATHS.has(clean)) return true;
  if (isRecoveryLocalProductPage(clean) && !RECOVERY_LOCAL_INDEX_ALLOWLIST.has(clean)) return true;
  return false;
}

export function getRecoveryRobots(pathname, explicitRobots) {
  if (isRecoverySuppressedPath(pathname)) return 'noindex,follow';
  return explicitRobots;
}

const LINKS = {
  notebook: [
    ['/รับซื้อโน๊ตบุ๊คมือสอง','รับซื้อโน๊ตบุ๊คมือสอง'],
    ['/รับซื้อคอมพิวเตอร์มือสอง','รับซื้อคอมพิวเตอร์มือสอง'],
    ['/รับซื้อคอมเกมมิ่ง','รับซื้อคอมเกมมิ่ง'],
    ['/รับซื้อการ์ดจอ','รับซื้อการ์ดจอ'],
    ['/รับซื้อจอคอม','รับซื้อจอคอม'],
    ['/รับซื้อ-ram','รับซื้อ RAM'],
    ['/รับซื้อ-ssd','รับซื้อ SSD'],
    ['/รับซื้อคอมบริษัท','รับซื้อคอมบริษัท']
  ],
  apple: [
    ['/รับซื้อ-iphone','รับซื้อ iPhone'],
    ['/รับซื้อ-ipad','รับซื้อ iPad'],
    ['/รับซื้อ-macbook','รับซื้อ MacBook'],
    ['/รับซื้อมือถือ','รับซื้อมือถือ'],
    ['/รับซื้อแท็บเล็ต','รับซื้อแท็บเล็ต'],
    ['/รับซื้อ-iphone-อุบลราชธานี','รับซื้อ iPhone อุบลราชธานี'],
    ['/รับซื้อ-ipad-อุบลราชธานี','รับซื้อ iPad อุบลราชธานี'],
    ['/รับซื้อ-macbook-อุบลราชธานี','รับซื้อ MacBook อุบลราชธานี']
  ],
  infra: [
    ['/รับซื้อคอมบริษัท','รับซื้อคอมบริษัท'],
    ['/รับซื้ออุปกรณ์สำนักงาน-it','รับซื้ออุปกรณ์สำนักงาน IT'],
    ['/รับซื้อ-server-มือสอง','รับซื้อ Server มือสอง'],
    ['/รับซื้อ-ups','รับซื้อ UPS'],
    ['/รับซื้อ-harddisk','รับซื้อ Harddisk'],
    ['/รับซื้อ-ssd','รับซื้อ SSD'],
    ['/รับซื้อคอมพิวเตอร์มือสอง','รับซื้อคอมพิวเตอร์มือสอง']
  ],
  gaming: [
    ['/รับซื้ออุปกรณ์เกมมิ่ง','รับซื้ออุปกรณ์เกมมิ่ง'],
    ['/รับซื้อ-ps5','รับซื้อ PS5'],
    ['/รับซื้อ-nintendo-switch','รับซื้อ Nintendo Switch'],
    ['/รับซื้อคอมเกมมิ่ง','รับซื้อคอมเกมมิ่ง'],
    ['/รับซื้อ-jbl','รับซื้อ JBL'],
    ['/รับซื้อ-marshall','รับซื้อ Marshall']
  ],
  area: [
    ['/พื้นที่ให้บริการ/สุรินทร์','พื้นที่รับซื้อ สุรินทร์'],
    ['/พื้นที่ให้บริการ/อุบลราชธานี','พื้นที่รับซื้อ อุบลราชธานี'],
    ['/พื้นที่ให้บริการ/นครพนม','พื้นที่รับซื้อ นครพนม'],
    ['/พื้นที่ให้บริการ/เลย','พื้นที่รับซื้อ เลย'],
    ['/พื้นที่ให้บริการ','พื้นที่ให้บริการทั้งหมด']
  ]
};

export function getRecoveryAuthorityLinks(pathname) {
  const clean = normalizeRecoveryPath(pathname);
  let group = LINKS.notebook;

  if (/iphone|ipad|macbook|มือถือ|แท็บเล็ต/i.test(clean)) group = LINKS.apple;
  else if (/server|คอมบริษัท|สำนักงาน|ups|harddisk|ssd|network|router|switch|nas/i.test(clean)) group = LINKS.infra;
  else if (/gaming|เกม|ps5|playstation|nintendo|jbl|marshall/i.test(clean)) group = LINKS.gaming;

  if (clean === '/' || clean === '/รับซื้อ') {
    group = [
      ...LINKS.notebook.slice(0, 5),
      ...LINKS.apple.slice(0, 3),
      ...LINKS.gaming.slice(0, 2),
      ...LINKS.area.slice(0, 4)
    ];
  } else {
    group = [...group, ...LINKS.area.slice(0, 2)];
  }

  const seen = new Set();
  return group
    .filter(([href]) => href !== clean && !isRecoverySuppressedPath(href))
    .filter(([href]) => {
      if (seen.has(href)) return false;
      seen.add(href);
      return true;
    })
    .map(([href, label]) => ({ href, label }));
}

export function shouldShowRecoveryAuthority(pathname) {
  const clean = normalizeRecoveryPath(pathname);
  return RECOVERY_CORE_MONEY_PATHS.has(clean) || clean === '/พื้นที่ให้บริการ';
}
