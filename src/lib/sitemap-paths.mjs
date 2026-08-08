/** Shared sitemap filter helpers (plain JS for astro.config.mjs). */

import { SEO_SLUG_NOINDEX_HUB_SLUGS } from '../data/seoSlugHubIndexPolicy.mjs';

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

/**
 * Nested sell support routes under /รับซื้อ/{product}/... (topic + area-topic).
 * These are near-duplicate support pages — noindex and exclude from sitemap.
 * @param {string} pathname
 */
export function isSellSupportTopicPage(pathname) {
  const clean = decodePathname(pathname).replace(/\/$/, '') || '/';
  if (!clean.startsWith('/รับซื้อ/')) return false;

  const parts = clean.split('/').filter(Boolean);
  // รับซื้อ / product / topic  OR  รับซื้อ / product / province / topic
  return parts.length === 3 || parts.length === 4;
}

/**
 * seoSlug hubs classified MERGE/NOINDEX — keep crawlable but out of sitemap.
 * @param {string} pathname
 */
export function isNonIndexableSeoSlugHub(pathname) {
  const clean = decodePathname(pathname).replace(/\/$/, '') || '/';
  if (clean === '/' || clean.slice(1).includes('/')) return false;
  const slug = clean.replace(/^\//, '');
  return SEO_SLUG_NOINDEX_HUB_SLUGS.has(slug);
}

/** @param {string} pathname */
export function shouldExcludeFromSitemap(pathname) {
  return (
    isProgrammaticSeoLocalPage(pathname) ||
    isSellSupportTopicPage(pathname) ||
    isNonIndexableSeoSlugHub(pathname)
  );
}
