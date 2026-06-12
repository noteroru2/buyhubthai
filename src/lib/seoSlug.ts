import { SELL_THAI_ROUTES } from './thaiRoutes';

export const SEO_PROVINCES = [
  { id: 'khon-kaen', name: 'ขอนแก่น' },
  { id: 'nakhon-ratchasima', name: 'นครราชสีมา' },
  { id: 'udon-thani', name: 'อุดรธานี' },
  { id: 'ubon-ratchathani', name: 'อุบลราชธานี' },
  { id: 'amnat-charoen', name: 'อำนาจเจริญ' },
  { id: 'bueng-kan', name: 'บึงกาฬ' },
  { id: 'buriram', name: 'บุรีรัมย์' },
  { id: 'chaiyaphum', name: 'ชัยภูมิ' },
  { id: 'kalasin', name: 'กาฬสินธุ์' },
  { id: 'loei', name: 'เลย' },
  { id: 'maha-sarakham', name: 'มหาสารคาม' },
  { id: 'mukdahan', name: 'มุกดาหาร' },
  { id: 'nakhon-phanom', name: 'นครพนม' },
  { id: 'nong-bua-lamphu', name: 'หนองบัวลำภู' },
  { id: 'nong-khai', name: 'หนองคาย' },
  { id: 'roi-et', name: 'ร้อยเอ็ด' },
  { id: 'sakon-nakhon', name: 'สกลนคร' },
  { id: 'sisaket', name: 'ศรีสะเกษ' },
  { id: 'surin', name: 'สุรินทร์' },
  { id: 'yasothon', name: 'ยโสธร' }
] as const;

/** Slugs that already have dedicated static or hub pages — skip programmatic duplicates. */
const SYNONYM_EXCLUDED_SLUGS = [
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

export const SEO_SLUG_EXCLUDED_SLUGS = new Set([
  'รับซื้อ',
  ...Object.values(SELL_THAI_ROUTES).map((path) => path.replace(/^\//, '')),
  ...SYNONYM_EXCLUDED_SLUGS
]);

export function keywordToSlug(keyword: string): string {
  return keyword.trim().toLowerCase().replace(/[\s/]+/g, '-');
}

export function isSeoSlugExcluded(keyword: string): boolean {
  return SEO_SLUG_EXCLUDED_SLUGS.has(keywordToSlug(keyword));
}
