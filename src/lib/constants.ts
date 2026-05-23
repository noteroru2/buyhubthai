export const SITE_URL = 'https://buyhubthai.com' as const;
export const SITE_NAME = 'BuyHub';
export const SITE_TAGLINE = 'ศูนย์รับซื้อสินค้าไอที มือหนึ่ง มือสอง';

export const LINE_AT = '@buyhub';
export const LINE_URL = 'https://line.me/R/ti/p/@buyhub';
export const FACEBOOK_URL = 'https://www.facebook.com/buyhubthai' as const;
export const GOOGLE_MAPS_URL = 'https://maps.google.com/?cid=12345678901234567890' as const;
export const EDITORIAL_REVIEWED_AT = '2026-05-10' as const;
export const EDITORIAL_REVIEWER = 'ทีมเนื้อหา BuyHub' as const;

/** เบอร์ติดต่อ BuyHub */
export const PHONE_DISPLAY = '095-547-9408';
export const PHONE_E164 = '+66955479408';

/** ช่วงเวลาทำการ (ปรับได้ตามร้านจริง) */
export const BUSINESS_HOURS_SHORT = '08.00 น - 23.00 น ทุกวัน';

export const DEFAULT_DESCRIPTION =
  'BuyHub ศูนย์รับซื้อสินค้าไอที มือหนึ่ง มือสอง ประเมินไว โอนเงินทันที รับซื้อ iPhone iPad MacBook โน๊ตบุ๊ค และอุปกรณ์ไอที';

export const NAV = [
  { href: '/', label: 'หน้าแรก' },
  { href: '/รับซื้อ', label: 'รับซื้ออะไรบ้าง' },
  { href: '/พื้นที่ให้บริการ', label: 'พื้นที่ให้บริการ' },
  { href: '/ขั้นตอนการขาย', label: 'ขั้นตอนการขาย' },
  { href: '/บทความ', label: 'บทความ' },
  { href: '/ติดต่อเรา', label: 'ติดต่อเรา' }
] as const;
