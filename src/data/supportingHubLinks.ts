/**
 * Contextual supporting hubs that reinforce Primary Money Pages.
 * Keep lists short (3–6) and topical — not a link dump.
 */
export type SupportingHubLink = { href: string; label: string };

const SUPPORTING_BY_MONEY: Record<string, SupportingHubLink[]> = {
  '/รับซื้อคอมพิวเตอร์มือสอง': [
    { href: '/รับซื้อ-ram', label: 'รับซื้อ RAM' },
    { href: '/รับซื้อ-ssd', label: 'รับซื้อ SSD' },
    { href: '/รับซื้อ-cpu', label: 'รับซื้อ CPU' },
    { href: '/รับซื้อ-harddisk', label: 'รับซื้อ Harddisk' },
    { href: '/รับซื้อ-mainboard', label: 'รับซื้อ Mainboard' },
    { href: '/รับซื้อ-keyboard', label: 'รับซื้อ Keyboard' },
    { href: '/รับซื้อ-mouse', label: 'รับซื้อ Mouse' },
    { href: '/รับซื้อ-flash-drive', label: 'รับซื้อ Flash Drive' },
    { href: '/รับซื้ออะไหล่คอม', label: 'รับซื้ออะไหล่คอม' }
  ],
  '/รับซื้อคอมบริษัท': [
    { href: '/รับซื้ออุปกรณ์ไอที', label: 'รับซื้ออุปกรณ์ไอที' },
    { href: '/รับซื้อทรัพย์สินไอทีบริษัท', label: 'รับซื้อทรัพย์สินไอทีบริษัท' },
    { href: '/รับเหมาคอมพิวเตอร์', label: 'รับเหมาคอมพิวเตอร์' },
    { href: '/รับเหมาอุปกรณ์ไอที', label: 'รับเหมาอุปกรณ์ไอที' },
    { href: '/รับประมูลคอมพิวเตอร์', label: 'รับประมูลคอมพิวเตอร์' },
    { href: '/รับซื้อ-server-มือสอง', label: 'รับซื้อ Server มือสอง' },
    { href: '/รับซื้ออุปกรณ์-network', label: 'รับซื้ออุปกรณ์ Network' }
  ],
  '/รับซื้อคอมเกมมิ่ง': [
    { href: '/รับซื้อ-cpu', label: 'รับซื้อ CPU' },
    { href: '/รับซื้อ-ram', label: 'รับซื้อ RAM' },
    { href: '/รับซื้อ-ssd-nvme', label: 'รับซื้อ SSD NVMe' },
    { href: '/รับซื้อ-power-supply', label: 'รับซื้อ Power Supply' },
    { href: '/รับซื้อ-case-คอมพิวเตอร์', label: 'รับซื้อ Case คอมพิวเตอร์' }
  ],
  '/รับซื้อโน๊ตบุ๊คมือสอง': [
    { href: '/รับซื้อ-ram-notebook', label: 'รับซื้อ RAM Notebook' },
    { href: '/รับซื้อ-ssd-m-2', label: 'รับซื้อ SSD M.2' },
    { href: '/รับประมูลโน๊ตบุ๊ค', label: 'รับประมูลโน๊ตบุ๊ค' }
  ],
  '/รับซื้อการ์ดจอ': [
    { href: '/รับซื้อ-power-supply', label: 'รับซื้อ Power Supply' },
    { href: '/รับซื้อคอมเกมมิ่ง', label: 'รับซื้อคอมเกมมิ่ง' }
  ],
  '/รับซื้อจอคอม': [
    { href: '/รับซื้อคอมพิวเตอร์มือสอง', label: 'รับซื้อคอมพิวเตอร์มือสอง' },
    { href: '/รับซื้อคอมบริษัท', label: 'รับซื้อคอมบริษัท' }
  ],
  '/รับซื้อ-server-มือสอง': [
    { href: '/รับซื้อ-nas-storage', label: 'รับซื้อ NAS Storage' },
    { href: '/รับซื้อ-synology', label: 'รับซื้อ Synology' },
    { href: '/รับซื้อ-netapp-storage', label: 'รับซื้อ NetApp Storage' },
    { href: '/รับซื้อ-ram-server', label: 'รับซื้อ RAM Server' },
    { href: '/รับซื้อ-harddisk-server', label: 'รับซื้อ Harddisk Server' },
    { href: '/รับซื้อ-ssd-server', label: 'รับซื้อ SSD Server' },
    { href: '/รับซื้อ-ups', label: 'รับซื้อ UPS' },
    { href: '/รับซื้ออุปกรณ์-network', label: 'รับซื้ออุปกรณ์ Network' },
    { href: '/รับซื้อคอมบริษัท', label: 'รับซื้อคอมบริษัท' }
  ]
};

export function getSupportingHubsForMoneyPath(pathname: string, limit = 8): SupportingHubLink[] {
  const clean = pathname.replace(/\/$/, '') || '/';
  const list = SUPPORTING_BY_MONEY[clean];
  if (!list) return [];
  return list.slice(0, limit);
}
