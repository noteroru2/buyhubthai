/** Canonical service links shared by navigation, discovery and the homepage. */
export const serviceGroups = [
  { id: 'computers', title: 'คอมพิวเตอร์และโน๊ตบุ๊ค', description: 'เครื่องทำงาน เครื่องเรียน และเครื่องเกมมิ่ง', items: [
    { href: '/รับซื้อโน๊ตบุ๊คมือสอง', name: 'โน๊ตบุ๊ค', detail: 'Windows · ทำงาน · เกมมิ่ง', image: 'buyhub-notebook-asus-vivobook-oled.webp' },
    { href: '/รับซื้อคอมพิวเตอร์มือสอง', name: 'คอมพิวเตอร์', detail: 'คอมตั้งโต๊ะ · คอมประกอบ', image: 'buyhub-desktop-gaming-pc-white-rgb.webp' },
    { href: '/รับซื้อ-macbook', name: 'MacBook', detail: 'MacBook Air · MacBook Pro', image: 'buyhub-macbook-air-real-box.webp' },
    { href: '/รับซื้อคอมเกมมิ่ง', name: 'คอมเกมมิ่ง', detail: 'ส่งสเปก CPU และการ์ดจอให้ประเมิน' },
    { href: '/รับซื้อการ์ดจอ', name: 'การ์ดจอ', detail: 'รุ่น · ความจุ · ประกัน · ผลทดสอบ' },
    { href: '/รับซื้อจอคอม', name: 'จอคอมพิวเตอร์', detail: 'จอทำงาน · จอเกมมิ่ง' },
    { href: '/รับซื้อ-ram', name: 'RAM', detail: 'ความจุ · ชนิด · จำนวนแผง' },
    { href: '/รับซื้อ-ssd', name: 'SSD', detail: 'รุ่น · ความจุ · สุขภาพไดรฟ์' }
  ] },
  { id: 'mobile', title: 'มือถือและแท็บเล็ต', description: 'ส่งรุ่น ความจุ และสภาพเครื่องให้เช็กราคา', items: [
    { href: '/รับซื้อ-iphone', name: 'iPhone', detail: 'รุ่น · ความจุ · สุขภาพแบตเตอรี่', image: 'buyhub-iphone-15-used-box.webp' },
    { href: '/รับซื้อ-ipad', name: 'iPad', detail: 'iPad · Air · mini · Pro', image: 'buyhub-ipad-mini-starlight-box.webp' },
    { href: '/รับซื้อมือถือ', name: 'มือถือ Android', detail: 'Samsung และแบรนด์อื่น ส่งรุ่นให้พิจารณา' },
    { href: '/รับซื้อแท็บเล็ต', name: 'แท็บเล็ต Android', detail: 'รุ่น · ความจุ · ปากกาและคีย์บอร์ด', image: 'buyhub-xiaomi-pad-tablet.webp' },
    { href: '/รับซื้อ-apple-watch', name: 'Apple Watch', detail: 'รุ่น · ขนาด · แบตเตอรี่ · สถานะบัญชี' }
  ] },
  { id: 'entertainment', title: 'กล้อง เครื่องเกม และเครื่องเสียง', description: 'ตัวเครื่องและอุปกรณ์ประกอบมีผลต่อราคา', items: [
    { href: '/รับซื้อกล้อง', name: 'กล้องและเลนส์', detail: 'Mirrorless · DSLR · เลนส์', image: 'buyhub-sony-a6000-mirrorless-kit.webp' },
    { href: '/รับซื้อ-ps5', name: 'PlayStation 5', detail: 'เครื่อง · จอย · อุปกรณ์ในชุด', image: 'buyhub-ps5-digital-edition-set.webp' },
    { href: '/รับซื้อ-nintendo-switch', name: 'Nintendo Switch', detail: 'รุ่น · จอย · Dock · ที่ชาร์จ' },
    { href: '/รับซื้อ-jbl', name: 'ลำโพง JBL', detail: 'รุ่น · แบตเตอรี่ · อุปกรณ์', image: 'buyhub-jbl-boombox-2-box.webp' },
    { href: '/รับซื้อ-marshall', name: 'ลำโพง Marshall', detail: 'รุ่น · สภาพ · ระบบเสียง' },
    { href: '/รับซื้ออุปกรณ์เกมมิ่ง', name: 'อุปกรณ์เกมมิ่ง', detail: 'เมาส์ · คีย์บอร์ด · หูฟัง' }
  ] },
  { id: 'business', title: 'บริษัท ร้านค้า และงานยกล็อต', description: 'เริ่มจากรายการสินค้า จำนวน และพื้นที่เก็บอุปกรณ์', items: [
    { href: '/รับซื้อคอมบริษัท', name: 'คอมบริษัทและไอทียกล็อต', detail: 'ส่ง Asset List หรือรูปแยกกลุ่ม' },
    { href: '/รับซื้ออุปกรณ์สำนักงาน-it', name: 'อุปกรณ์ไอทีสำนักงาน', detail: 'อุปกรณ์ที่ปลดระวางหรือเปลี่ยนใหม่' },
    { href: '/รับซื้อ-server-มือสอง', name: 'Server', detail: 'รุ่น · สเปก · จำนวน · ผลทดสอบ' },
    { href: '/รับซื้อ-ups', name: 'UPS', detail: 'รุ่น · กำลังไฟ · สภาพแบตเตอรี่' }
  ] }
] as const;

export const featuredServices = [serviceGroups[0].items[0], serviceGroups[0].items[1], serviceGroups[0].items[2], serviceGroups[1].items[0], serviceGroups[1].items[1], serviceGroups[2].items[0]];

export const productPhotos = [
  { name: 'โน๊ตบุ๊ค ASUS', image: 'buyhub-notebook-asus-vivobook-oled.webp', href: '/รับซื้อโน๊ตบุ๊คมือสอง' },
  { name: 'iPhone พร้อมกล่อง', image: 'buyhub-iphone-15-used-box.webp', href: '/รับซื้อ-iphone' },
  { name: 'MacBook Air', image: 'buyhub-macbook-air-real-box.webp', href: '/รับซื้อ-macbook' },
  { name: 'คอมพิวเตอร์ประกอบ', image: 'buyhub-desktop-gaming-pc-white-rgb.webp', href: '/รับซื้อคอมพิวเตอร์มือสอง' },
  { name: 'กล้อง Sony พร้อมเลนส์', image: 'buyhub-sony-a6000-mirrorless-kit.webp', href: '/รับซื้อกล้อง' },
  { name: 'PlayStation 5 พร้อมอุปกรณ์', image: 'buyhub-ps5-digital-edition-set.webp', href: '/รับซื้อ-ps5' }
];

export const sellingSteps = [
  { title: 'ส่งรูปและข้อมูล', detail: 'แจ้งรุ่น สเปก สภาพ อุปกรณ์ และจังหวัด ผ่าน LINE @buyhub' },
  { title: 'รับราคาเบื้องต้น', detail: 'ทีมงานพิจารณาจากข้อมูลที่ส่ง คุณเลือกได้ว่าจะขายต่อหรือไม่' },
  { title: 'ตรวจและยืนยันราคา', detail: 'ตกลงวิธีส่งมอบ ตรวจสินค้าจริง และยืนยันราคาสุดท้ายก่อนทำรายการ' },
  { title: 'ตกลงขายและรับเงิน', detail: 'เมื่อทั้งสองฝ่ายตกลง จึงส่งมอบสินค้าและชำระเงินตามวิธีที่ยืนยัน' }
];
