export const SITE_URL = 'https://buyhubthai.com' as const;
export const SITE_NAME = 'BuyHub';
export const SITE_TAGLINE = 'ขายไอทีง่าย รู้ราคาก่อนตัดสินใจ';

export const LINE_AT = '@buyhub';
export const LINE_URL = 'https://line.me/R/ti/p/@buyhub';
export const FACEBOOK_URL = 'https://www.facebook.com/buyhubthai' as const;
export const PARENT_ORG_NAME = 'บริษัท อำพล เทรดดิ้ง จำกัด' as const;
export const PARENT_ORG_URL = 'https://amphon.co.th' as const;
export const PARENT_ORG_ALTERNATE_NAME = 'AMPHON TRADING' as const;
export const STORE_ADDRESS = {
  street: '740/8 ถนนชยางกูร',
  locality: 'ตำบลในเมือง อำเภอเมืองอุบลราชธานี',
  region: 'อุบลราชธานี',
  postalCode: '34000',
  country: 'TH'
} as const;
export const STORE_GEO = { latitude: 15.2664215, longitude: 104.844358 } as const;
export const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/krv97o14jPTRrnpW8' as const;
export const EDITORIAL_REVIEWED_AT = '2026-05-10' as const;
export const EDITORIAL_REVIEWER = 'คุณอำพล' as const;
export const EDITORIAL_REVIEWER_TITLE = 'CEO & ผู้เชี่ยวชาญการประเมินราคาสินค้าไอทีประจำ BuyHub' as const;
export const EDITORIAL_REVIEWER_BIO = 'ทีมงานรับซื้อสินค้าไอทีของ BuyHub ในเครืออำพล เทรดดิ้ง ตรวจสอบรุ่น สเปก สภาพ และอุปกรณ์เพื่อประกอบการประเมินราคา' as const;
export const EDITORIAL_REVIEWER_SOCIAL = 'https://www.facebook.com/buyhubthai' as const;


/** เบอร์ติดต่อ BuyHub */
export const PHONE_DISPLAY = '095-547-9408';
export const PHONE_E164 = '+66955479408';

/** ช่วงเวลาทำการ (ปรับได้ตามร้านจริง) */
export const BUSINESS_HOURS_SHORT = '08.00 น - 23.00 น ทุกวัน';

export const DEFAULT_DESCRIPTION =
  'BuyHub ศูนย์รับซื้อสินค้าไอที มือหนึ่ง มือสอง ประเมินไว โอนเงินทันที รับซื้อ iPhone iPad MacBook โน๊ตบุ๊ค และอุปกรณ์ไอที';

export const NAV = [
  { href: '/รับซื้อ', label: 'สินค้าที่รับซื้อ' },
  { href: '/ขั้นตอนการขาย', label: 'ขายอย่างไร' },
  { href: '/รับซื้อคอมบริษัท', label: 'รับซื้อยกล็อต' },
  { href: '/ผลงานรับซื้อจริง', label: 'ภาพสินค้า' },
  { href: '/บทความ', label: 'บทความ' },
  { href: '/ติดต่อเรา', label: 'ติดต่อเรา' }
] as const;
