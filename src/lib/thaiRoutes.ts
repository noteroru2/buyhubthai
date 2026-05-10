export const SELL_THAI_ROUTES: Record<string, string> = {
  notebook: '/รับซื้อโน๊ตบุ๊คมือสอง',
  'desktop-pc': '/รับซื้อคอมพิวเตอร์มือสอง',
  macbook: '/รับซื้อ-macbook',
  iphone: '/รับซื้อ-iphone',
  ipad: '/รับซื้อ-ipad',
  camera: '/รับซื้อกล้อง',
  'mobile-phone': '/รับซื้อมือถือ',
  tablet: '/รับซื้อแท็บเล็ต',
  samsung: '/รับซื้อ-samsung',
  'it-accessories': '/รับซื้ออุปกรณ์เสริม-it',
  'gaming-gear': '/รับซื้ออุปกรณ์เกมมิ่ง',
  'corporate-it': '/รับซื้อคอมบริษัท',
  monitor: '/รับซื้อจอคอม',
  gpu: '/รับซื้อการ์ดจอ',
  'apple-watch': '/รับซื้อ-apple-watch',
  airpods: '/รับซื้อ-airpods',
  'apple-pencil': '/รับซื้อ-apple-pencil',
  'game-console': '/รับซื้อเครื่องเกม',
  playstation: '/รับซื้อ-playstation',
  'nintendo-switch': '/รับซื้อ-nintendo-switch',
  'gaming-pc': '/รับซื้อคอมเกมมิ่ง',
  'pc-assembled': '/รับซื้อ-pc-ประกอบ',
  printer: '/รับซื้อเครื่องปริ้น',
  'office-it': '/รับซื้ออุปกรณ์สำนักงาน-it'
};

export const AREA_THAI_ROUTES: Record<string, string> = {
  'ubon-ratchathani': '/พื้นที่ให้บริการ/อุบลราชธานี',
  'khon-kaen': '/พื้นที่ให้บริการ/ขอนแก่น',
  'nakhon-ratchasima': '/พื้นที่ให้บริการ/นครราชสีมา',
  'udon-thani': '/พื้นที่ให้บริการ/อุดรธานี',
  buriram: '/พื้นที่ให้บริการ/บุรีรัมย์',
  surin: '/พื้นที่ให้บริการ/สุรินทร์',
  sisaket: '/พื้นที่ให้บริการ/ศรีสะเกษ',
  'roi-et': '/พื้นที่ให้บริการ/ร้อยเอ็ด',
  yasothon: '/พื้นที่ให้บริการ/ยโสธร',
  'amnat-charoen': '/พื้นที่ให้บริการ/อำนาจเจริญ',
  'maha-sarakham': '/พื้นที่ให้บริการ/มหาสารคาม',
  kalasin: '/พื้นที่ให้บริการ/กาฬสินธุ์',
  'sakon-nakhon': '/พื้นที่ให้บริการ/สกลนคร',
  'nakhon-phanom': '/พื้นที่ให้บริการ/นครพนม',
  mukdahan: '/พื้นที่ให้บริการ/มุกดาหาร',
  chaiyaphum: '/พื้นที่ให้บริการ/ชัยภูมิ',
  loei: '/พื้นที่ให้บริการ/เลย',
  'nong-khai': '/พื้นที่ให้บริการ/หนองคาย',
  'bueng-kan': '/พื้นที่ให้บริการ/บึงกาฬ',
  'nong-bua-lamphu': '/พื้นที่ให้บริการ/หนองบัวลำภู'
};

export function sellThaiHref(id: string): string {
  return SELL_THAI_ROUTES[id] ?? '/รับซื้อ';
}

export function areaThaiHref(id: string): string {
  return AREA_THAI_ROUTES[id] ?? '/พื้นที่ให้บริการ';
}

export function blogThaiHref(id: string): string {
  return `/บทความ/${id}`;
}

