/** Shared sitemap filter helpers (plain JS for astro.config.mjs). */

export const SEO_PROVINCE_NAMES = [
  'ขอนแก่น',
  'นครราชสีมา',
  'อุดรธานี',
  'อุบลราชธานี',
  'อำนาจเจริญ',
  'บึงกาฬ',
  'บุรีรัมย์',
  'ชัยภูมิ',
  'กาฬสินธุ์',
  'เลย',
  'มหาสารคาม',
  'มุกดาหาร',
  'นครพนม',
  'หนองบัวลำภู',
  'หนองคาย',
  'ร้อยเอ็ด',
  'สกลนคร',
  'ศรีสะเกษ',
  'สุรินทร์',
  'ยโสธร'
];

/** Province-local pages that should stay indexable (static + sellRoute). */
export const INDEXABLE_PROVINCE_PATH_PREFIXES = [
  '/รับซื้อ-iphone-',
  '/รับซื้อ-ipad-',
  '/รับซื้อ-macbook-',
  '/รับซื้อโน๊ตบุ๊ค-',
  '/รับซื้อคอมบริษัท-'
];

function decodePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

/**
 * Programmatic [seoSlug] local pages (keyword × province) are noindex — keep them out of sitemap.
 * @param {string} pathname
 */
export function isProgrammaticSeoLocalPage(pathname) {
  const clean = decodePathname(pathname).replace(/\/$/, '') || '/';
  if (clean === '/') return false;

  const endsWithProvince = SEO_PROVINCE_NAMES.some((name) => clean.endsWith(`-${name}`));
  if (!endsWithProvince) return false;

  return !INDEXABLE_PROVINCE_PATH_PREFIXES.some((prefix) => clean.startsWith(prefix));
}
