/**
 * Curated discovery links for specialty KEEP hubs.
 * Used on /รับซื้อ to give topical inbound without homepage link dumps.
 */
export type HubDiscoveryGroup = {
  title: string;
  sub: string;
  links: { href: string; label: string }[];
};

export const HUB_DISCOVERY_GROUPS: HubDiscoveryGroup[] = [
  {
    title: 'เซิร์ฟเวอร์ สตอเรจ และ UPS',
    sub: 'หน้ารองสำหรับงานองค์กร ห้องเซิร์ฟเวอร์ และสตอเรจแนบเครือข่าย',
    links: [
      { href: '/รับซื้อ-server-มือสอง', label: 'รับซื้อ Server มือสอง' },
      { href: '/รับซื้อ-nas-storage', label: 'รับซื้อ NAS Storage' },
      { href: '/รับซื้อ-synology', label: 'รับซื้อ Synology' },
      { href: '/รับซื้อ-qnap', label: 'รับซื้อ QNAP' },
      { href: '/รับซื้อ-netapp-storage', label: 'รับซื้อ NetApp Storage' },
      { href: '/รับซื้อ-storage-server', label: 'รับซื้อ Storage Server' },
      { href: '/รับซื้อตู้-rack-server', label: 'รับซื้อตู้ Rack Server' },
      { href: '/รับซื้อ-ups', label: 'รับซื้อ UPS' },
      { href: '/รับซื้อแบตเตอรี่-ups', label: 'รับซื้อแบตเตอรี่ UPS' }
    ]
  },
  {
    title: 'อุปกรณ์เครือข่าย',
    sub: 'สวิตช์ เราเตอร์ ไฟร์วอลล์ Access Point และแบรนด์องค์กรที่พบบ่อย',
    links: [
      { href: '/รับซื้ออุปกรณ์-network', label: 'รับซื้ออุปกรณ์ Network' },
      { href: '/รับซื้อ-network-switch', label: 'รับซื้อ Network Switch' },
      { href: '/รับซื้อ-router', label: 'รับซื้อ Router' },
      { href: '/รับซื้อ-firewall', label: 'รับซื้อ Firewall' },
      { href: '/รับซื้อ-access-point', label: 'รับซื้อ Access Point' },
      { href: '/รับซื้อ-fortinet', label: 'รับซื้อ Fortinet' },
      { href: '/รับซื้อ-aruba', label: 'รับซื้อ Aruba' },
      { href: '/รับซื้อ-mikrotik', label: 'รับซื้อ Mikrotik' },
      { href: '/รับซื้อ-ubiquiti-network', label: 'รับซื้อ Ubiquiti' },
      { href: '/รับซื้อ-ruijie', label: 'รับซื้อ Ruijie' },
      { href: '/รับซื้อ-zyxel', label: 'รับซื้อ Zyxel' },
      { href: '/รับซื้อ-netgear', label: 'รับซื้อ Netgear' },
      { href: '/รับซื้อ-buffalo-network', label: 'รับซื้อ Buffalo' },
      { href: '/รับซื้อ-ip-phone', label: 'รับซื้อ IP Phone' },
      { href: '/รับซื้อสาย-lan', label: 'รับซื้อสาย LAN' }
    ]
  },
  {
    title: 'อะไหล่และสตอเรจคอมพิวเตอร์',
    sub: 'ชิ้นส่วนที่ถอดจากการอัปเกรดหรือปลดระวาง — แยกจากหน้ารับซื้อเครื่องทั้งเครื่อง',
    links: [
      { href: '/รับซื้อ-ram', label: 'รับซื้อ RAM' },
      { href: '/รับซื้อ-ram-pc', label: 'รับซื้อ RAM PC' },
      { href: '/รับซื้อ-ram-notebook', label: 'รับซื้อ RAM Notebook' },
      { href: '/รับซื้อ-ram-ecc', label: 'รับซื้อ RAM ECC' },
      { href: '/รับซื้อ-ram-server', label: 'รับซื้อ RAM Server' },
      { href: '/รับซื้อ-cpu', label: 'รับซื้อ CPU' },
      { href: '/รับซื้อ-ssd', label: 'รับซื้อ SSD' },
      { href: '/รับซื้อ-ssd-m-2', label: 'รับซื้อ SSD M.2' },
      { href: '/รับซื้อ-ssd-nvme', label: 'รับซื้อ SSD NVMe' },
      { href: '/รับซื้อ-ssd-server', label: 'รับซื้อ SSD Server' },
      { href: '/รับซื้อ-harddisk', label: 'รับซื้อ Harddisk' },
      { href: '/รับซื้อ-harddisk-server', label: 'รับซื้อ Harddisk Server' },
      { href: '/รับซื้อ-harddisk-sas', label: 'รับซื้อ Harddisk SAS' },
      { href: '/รับซื้อ-harddisk-กล้องวงจรปิด', label: 'รับซื้อ HDD กล้องวงจรปิด' },
      { href: '/รับซื้อ-external-harddisk', label: 'รับซื้อ External Harddisk' },
      { href: '/รับซื้อ-flash-drive', label: 'รับซื้อ Flash Drive' },
      { href: '/รับซื้อ-mainboard', label: 'รับซื้อ Mainboard' },
      { href: '/รับซื้อ-power-supply', label: 'รับซื้อ Power Supply' },
      { href: '/รับซื้อ-case-คอมพิวเตอร์', label: 'รับซื้อ Case คอมพิวเตอร์' },
      { href: '/รับซื้อ-keyboard', label: 'รับซื้อ Keyboard' },
      { href: '/รับซื้อ-mouse', label: 'รับซื้อ Mouse' },
      { href: '/รับซื้ออะไหล่คอม', label: 'รับซื้ออะไหล่คอม' }
    ]
  },
  {
    title: 'งานองค์กร รับเหมา และรับประมูล',
    sub: 'เส้นทางสำหรับล็อตองค์กร ไม่ใช่การขายทีละเครื่องจากบุคคล',
    links: [
      { href: '/รับซื้อคอมบริษัท', label: 'รับซื้อคอมบริษัท' },
      { href: '/รับซื้ออุปกรณ์ไอที', label: 'รับซื้ออุปกรณ์ไอที' },
      { href: '/รับซื้อทรัพย์สินไอทีบริษัท', label: 'รับซื้อทรัพย์สินไอทีบริษัท' },
      { href: '/รับเหมาคอมพิวเตอร์', label: 'รับเหมาคอมพิวเตอร์' },
      { href: '/รับเหมาอุปกรณ์ไอที', label: 'รับเหมาอุปกรณ์ไอที' },
      { href: '/รับประมูลคอมพิวเตอร์', label: 'รับประมูลคอมพิวเตอร์' },
      { href: '/รับประมูลโน๊ตบุ๊ค', label: 'รับประมูลโน๊ตบุ๊ค' }
    ]
  },
  {
    title: 'เครื่องใช้ไฟฟ้าและอุปกรณ์พิเศษ',
    sub: 'หมวดที่แยกจากไอทีหลัก แต่ยังประเมินจากสภาพและรุ่นจริงได้',
    links: [
      { href: '/รับซื้อลำโพง', label: 'รับซื้อลำโพง' },
      { href: '/รับซื้อเครื่องใช้ไฟฟ้า', label: 'รับซื้อเครื่องใช้ไฟฟ้า' },
      { href: '/รับซื้อ-dyson', label: 'รับซื้อ Dyson' },
      { href: '/รับซื้อพัดลม', label: 'รับซื้อพัดลม' },
      { href: '/รับซื้อแอร์', label: 'รับซื้อแอร์' },
      { href: '/รับซื้อเครื่องฟอกอากาศ', label: 'รับซื้อเครื่องฟอกอากาศ' },
      { href: '/รับซื้อเครื่องกรองน้ำ', label: 'รับซื้อเครื่องกรองน้ำ' },
      { href: '/รับซื้อเก้าอี้นวด', label: 'รับซื้อเก้าอี้นวด' },
      { href: '/รับซื้อเครื่องชงกาแฟ', label: 'รับซื้อเครื่องชงกาแฟ' },
      { href: '/รับซื้อของย้ายบ้าน', label: 'รับซื้อของย้ายบ้าน' },
      { href: '/รับซื้อ-drone', label: 'รับซื้อโดรน' }
    ]
  }
];
