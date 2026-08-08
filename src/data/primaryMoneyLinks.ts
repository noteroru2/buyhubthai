/** Primary commercial URLs that should receive internal authority. */
export const PRIMARY_MONEY_LINKS = [
  { href: '/รับซื้อ-iphone', label: 'รับซื้อ iPhone' },
  { href: '/รับซื้อ-ipad', label: 'รับซื้อ iPad' },
  { href: '/รับซื้อ-macbook', label: 'รับซื้อ MacBook' },
  { href: '/รับซื้อโน๊ตบุ๊คมือสอง', label: 'รับซื้อโน๊ตบุ๊ค' },
  { href: '/รับซื้อคอมพิวเตอร์มือสอง', label: 'รับซื้อคอมพิวเตอร์' },
  { href: '/รับซื้อคอมเกมมิ่ง', label: 'รับซื้อคอมเกมมิ่ง' },
  { href: '/รับซื้อมือถือ', label: 'รับซื้อมือถือ' },
  { href: '/รับซื้อแท็บเล็ต', label: 'รับซื้อแท็บเล็ต' },
  { href: '/รับซื้อกล้อง', label: 'รับซื้อกล้อง' },
  { href: '/รับซื้อการ์ดจอ', label: 'รับซื้อการ์ดจอ' },
  { href: '/รับซื้อจอคอม', label: 'รับซื้อจอคอม' },
  { href: '/รับซื้อคอมบริษัท', label: 'รับซื้อคอมบริษัท' },
  { href: '/รับซื้อ-ps5', label: 'รับซื้อ PS5' },
  { href: '/รับซื้อเครื่องเกม', label: 'รับซื้อเครื่องเกม' },
  { href: '/รับซื้ออุปกรณ์เกมมิ่ง', label: 'รับซื้ออุปกรณ์เกมมิ่ง' }
] as const;

/** Resolve related money pages from free text (title/tags/keyword). */
export function relatedMoneyLinksFromText(text: string, limit = 3): { href: string; label: string }[] {
  const t = text.toLowerCase();
  const scored: { href: string; label: string; score: number }[] = [];

  const rules: { re: RegExp; href: string; label: string; score: number }[] = [
    { re: /iphone|ไอโฟน/, href: '/รับซื้อ-iphone', label: 'ดูหน้ารับซื้อ iPhone', score: 10 },
    { re: /ipad|ไอแพด/, href: '/รับซื้อ-ipad', label: 'ดูหน้ารับซื้อ iPad', score: 10 },
    { re: /macbook|แมคบุ๊ค|imac/, href: '/รับซื้อ-macbook', label: 'ดูหน้ารับซื้อ MacBook', score: 10 },
    { re: /โน๊ตบุ๊ค|notebook|laptop/, href: '/รับซื้อโน๊ตบุ๊คมือสอง', label: 'ดูหน้ารับซื้อโน๊ตบุ๊ค', score: 9 },
    { re: /คอมเกมมิ่ง|gaming\s*pc/, href: '/รับซื้อคอมเกมมิ่ง', label: 'ดูหน้ารับซื้อคอมเกมมิ่ง', score: 9 },
    { re: /คอมพิวเตอร์|desktop|คอมตั้งโต๊ะ/, href: '/รับซื้อคอมพิวเตอร์มือสอง', label: 'ดูหน้ารับซื้อคอมพิวเตอร์', score: 8 },
    { re: /มือถือ|android|samsung/, href: '/รับซื้อมือถือ', label: 'ดูหน้ารับซื้อมือถือ', score: 8 },
    { re: /แท็บเล็ต|tablet/, href: '/รับซื้อแท็บเล็ต', label: 'ดูหน้ารับซื้อแท็บเล็ต', score: 8 },
    { re: /กล้อง|canon|nikon|sony|fujifilm/, href: '/รับซื้อกล้อง', label: 'ดูหน้ารับซื้อกล้อง', score: 9 },
    { re: /การ์ดจอ|gpu|vga/, href: '/รับซื้อการ์ดจอ', label: 'ดูหน้ารับซื้อการ์ดจอ', score: 9 },
    { re: /จอคอม|monitor/, href: '/รับซื้อจอคอม', label: 'ดูหน้ารับซื้อจอคอม', score: 8 },
    { re: /คอมบริษัท|สำนักงาน|องค์กร/, href: '/รับซื้อคอมบริษัท', label: 'ดูหน้ารับซื้อคอมบริษัท', score: 9 },
    { re: /ps5|playstation/, href: '/รับซื้อ-ps5', label: 'ดูหน้ารับซื้อ PS5', score: 9 },
    { re: /เครื่องเกม|nintendo|switch/, href: '/รับซื้อเครื่องเกม', label: 'ดูหน้ารับซื้อเครื่องเกม', score: 8 },
    { re: /เกมมิ่ง|gaming/, href: '/รับซื้ออุปกรณ์เกมมิ่ง', label: 'ดูหน้ารับซื้ออุปกรณ์เกมมิ่ง', score: 7 },
    { re: /server|nas|network|ups/, href: '/รับซื้อ-server-มือสอง', label: 'ดูหน้ารับซื้อ Server มือสอง', score: 8 }
  ];

  for (const rule of rules) {
    if (rule.re.test(t)) scored.push({ href: rule.href, label: rule.label, score: rule.score });
  }

  scored.sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  const out: { href: string; label: string }[] = [];
  for (const item of scored) {
    if (seen.has(item.href)) continue;
    seen.add(item.href);
    out.push({ href: item.href, label: item.label });
    if (out.length >= limit) break;
  }

  if (out.length === 0) {
    out.push(
      { href: '/รับซื้อ', label: 'ดูหมวดรับซื้อทั้งหมด' },
      { href: '/รับซื้อโน๊ตบุ๊คมือสอง', label: 'ดูหน้ารับซื้อโน๊ตบุ๊ค' },
      { href: '/รับซื้อ-iphone', label: 'ดูหน้ารับซื้อ iPhone' }
    );
  }

  return out.slice(0, limit);
}
