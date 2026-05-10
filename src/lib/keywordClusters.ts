export type KeywordCluster = {
  primary: string;
  secondary: string[];
  localIntent?: string[];
  modelIntent?: string[];
  issueIntent?: string[];
};

const uniquePhrases = (phrases: string[]) => {
  const seen = new Set<string>();
  return phrases.filter((phrase) => {
    const normalized = phrase.replace(/\s+/g, ' ').trim();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

const joinThaiListInternal = (items: string[]) => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} และ ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} และ ${items.at(-1)}`;
};

const needsLeadingSpace = (text: string) => /^[A-Za-z0-9]/.test(text);

const withTopic = (prefix: string, topic: string) =>
  `${prefix}${needsLeadingSpace(topic) ? ' ' : ''}${topic}`;

const normalizeTopic = (text: string) => text.replace(/\s+/g, ' ').trim();

const stripUsedQualifier = (text: string) => {
  const normalized = normalizeTopic(text);
  const stripped = normalized.replace(/มือสอง/g, '').replace(/\s+/g, ' ').trim();
  return stripped || normalized;
};

const detectArticleTopic = (title: string, tags: string[], slug: string) => {
  const explicitTag = tags.find(Boolean);
  if (explicitTag) return explicitTag;

  const knownTopics = [
    'iPhone',
    'iPad',
    'MacBook',
    'Samsung',
    'AirPods',
    'Apple Pencil',
    'Apple Watch',
    'Nintendo Switch',
    'PlayStation',
    'แท็บเล็ต Android',
    'แท็บเล็ต',
    'โน๊ตบุ๊ค',
    'คอมเกมมิ่ง',
    'คอมบริษัท',
    'คอม',
    'จอคอม',
    'การ์ดจอ',
    'เครื่องปริ้น',
    'กล้อง',
    'อุปกรณ์สำนักงาน IT',
    'อุปกรณ์ IT'
  ];

  const haystack = `${title} ${slug}`;
  const matched = knownTopics.find((topic) => haystack.includes(topic));
  return matched ?? title;
};

const buildArticleSecondaryKeywords = (title: string, topic: string) => {
  const cleanTopic = stripUsedQualifier(topic);
  const sellTopic = withTopic('ขาย', cleanTopic);
  const priceTopic = withTopic('ประเมินราคา', cleanTopic);
  const prepareTopic = withTopic('เตรียม', cleanTopic);
  const cleanTitle = title.replace(/[?]/g, '').trim();

  const keywords = [
    cleanTitle,
    `${cleanTopic} มือสอง`,
    `${sellTopic} มือสอง`,
    `${sellTopic} ได้ไหม`,
    `${sellTopic} ได้ราคาไหม`,
    `${priceTopic} มือสอง`,
    `${prepareTopic} ก่อนขาย`
  ];

  if (/ราคา|เท่าไหร่/u.test(title)) {
    keywords.push(`${cleanTopic} มือสองขายได้ราคาเท่าไหร่`);
  }

  if (/ต้องออก|icloud|apple id|find my|บัญชี/u.test(title)) {
    keywords.push(`${sellTopic} ต้องออกบัญชีก่อนไหม`);
    keywords.push(`ล้างข้อมูล${needsLeadingSpace(cleanTopic) ? ' ' : ''}${cleanTopic} ก่อนขาย`);
  }

  if (/ต้องเช็ค|ต้องเตรียม/u.test(title)) {
    keywords.push(`${sellTopic} ต้องเช็คอะไรบ้าง`);
    keywords.push(`${sellTopic} ต้องเตรียมอะไรบ้าง`);
  }

  return uniquePhrases(keywords);
};

const buildArticleIntentKeywords = (title: string, topic: string) => {
  const cleanTopic = stripUsedQualifier(topic);
  const sellTopic = withTopic('ขาย', cleanTopic);
  const priceTopic = withTopic('ประเมินราคา', cleanTopic);

  return uniquePhrases([
    title,
    `${sellTopic} มือสอง`,
    `${sellTopic} ได้ไหม`,
    `${priceTopic} มือสอง`
  ]);
};

const buildArticleTopicKeywords = (topic: string) => {
  const cleanTopic = stripUsedQualifier(topic);
  const sellTopic = withTopic('ขาย', cleanTopic);
  const priceTopic = withTopic('ประเมินราคา', cleanTopic);

  if (cleanTopic === 'iPhone') {
    return uniquePhrases([
      'ขาย iPhone ต้องออก iCloud ไหม',
      'ขาย iPhone ต้องเตรียมอะไรบ้าง',
      'เช็กราคา iPhone มือสอง',
      'ขาย iPhone ก่อนประเมินต้องส่งอะไร'
    ]);
  }

  if (cleanTopic === 'iPad') {
    return uniquePhrases([
      'ขาย iPad ต้องเตรียมอะไรบ้าง',
      'ขาย iPad ต้องเช็กอะไรบ้าง',
      'เช็กราคา iPad มือสอง',
      'ขาย iPad พร้อม Apple Pencil ได้ไหม'
    ]);
  }

  if (cleanTopic === 'MacBook') {
    return uniquePhrases([
      'ขาย MacBook ต้องออก Apple ID ไหม',
      'ขาย MacBook ต้องเช็กอะไรบ้าง',
      'เช็กราคา MacBook มือสอง',
      'ขาย MacBook ก่อนส่งประเมินต้องเตรียมอะไร'
    ]);
  }

  if (cleanTopic === 'โน๊ตบุ๊ค') {
    return uniquePhrases([
      'ขายโน๊ตบุ๊คต้องล้างข้อมูลไหม',
      'ขายโน๊ตบุ๊คต้องส่งสเปกอะไรบ้าง',
      'เช็กราคาโน๊ตบุ๊คมือสอง',
      'ขายโน๊ตบุ๊คเครื่องเสียได้ไหม'
    ]);
  }

  if (cleanTopic === 'คอมเกมมิ่ง') {
    return uniquePhrases([
      'ขายคอมเกมมิ่งต้องส่งสเปกอะไรบ้าง',
      'ขายคอมเกมมิ่งต้องถ่ายรูปจุดไหนบ้าง',
      'เช็กราคาคอมเกมมิ่งมือสอง',
      'ขายคอมเกมมิ่งเครื่องมีตำหนิได้ไหม'
    ]);
  }

  if (cleanTopic === 'คอมบริษัท') {
    return uniquePhrases([
      'ขายคอมบริษัทเก่าต้องทำอย่างไร',
      'ขายคอมบริษัทหลายชิ้นต้องเตรียมรายการยังไง',
      'เช็กราคาคอมบริษัทยกล็อต',
      'ขายอุปกรณ์ IT บริษัทต้องส่งอะไรบ้าง'
    ]);
  }

  if (cleanTopic === 'Samsung') {
    return uniquePhrases([
      'ขาย Samsung ต้องเตรียมอะไรบ้าง',
      'ขาย Samsung มือสองได้ไหม',
      'เช็กราคา Samsung มือสอง',
      'ขาย Samsung เครื่องมีตำหนิได้ไหม'
    ]);
  }

  if (cleanTopic === 'AirPods') {
    return uniquePhrases([
      'ขาย AirPods ต้องเช็กอะไรบ้าง',
      'ขาย AirPods แบตเสื่อมได้ไหม',
      'เช็กราคา AirPods มือสอง',
      'ขาย AirPods อุปกรณ์ไม่ครบได้ไหม'
    ]);
  }

  return uniquePhrases([
    `${sellTopic} ต้องเตรียมอะไรบ้าง`,
    `${sellTopic} ต้องเช็กอะไรบ้าง`,
    `${priceTopic} ก่อนขาย`,
    `${sellTopic} ก่อนส่งประเมินต้องส่งอะไร`
  ]);
};

const buildArticleIssueKeywords = (title: string, topic: string) => {
  const cleanTopic = stripUsedQualifier(topic);
  const sellTopic = withTopic('ขาย', cleanTopic);
  const compactSellTopic = sellTopic.replace(/\s+/g, ' ').trim();

  if (/ต้องออก|icloud|apple id|find my|บัญชี/u.test(title)) {
    return uniquePhrases([
      `${compactSellTopic} ต้องออกบัญชีก่อนไหม`,
      `ล้างข้อมูล${needsLeadingSpace(cleanTopic) ? ' ' : ''}${cleanTopic} ก่อนขาย`,
      `${compactSellTopic} ติดบัญชีขายได้ไหม`,
      `${compactSellTopic} ต้องรีเซ็ตเครื่องไหม`
    ]);
  }

  if (/ราคา|เท่าไหร่/u.test(title)) {
    return uniquePhrases([
      `${cleanTopic} มือสองขายได้ราคาเท่าไหร่`,
      `${compactSellTopic} ช่วงราคาเท่าไหร่`,
      `ประเมินราคา${needsLeadingSpace(cleanTopic) ? ' ' : ''}${cleanTopic} ยังไง`,
      `${compactSellTopic} ราคาตกเพราะอะไร`
    ]);
  }

  if (/ต้องเช็ค|ต้องเตรียม/u.test(title)) {
    return uniquePhrases([
      `${compactSellTopic} ต้องเตรียมอะไรบ้าง`,
      `${compactSellTopic} ต้องเช็กอะไรบ้าง`,
      `ส่งรูป${needsLeadingSpace(cleanTopic) ? ' ' : ''}${cleanTopic} ยังไง`,
      `${compactSellTopic} ข้อความแรกควรส่งอะไร`
    ]);
  }

  if (/เสีย|ตำหนิ|แตก|แบต|รอย|ไม่ครบ/u.test(title)) {
    return uniquePhrases([
      `${compactSellTopic} เครื่องเสียได้ไหม`,
      `${compactSellTopic} เครื่องมีตำหนิได้ไหม`,
      `${compactSellTopic} อุปกรณ์ไม่ครบได้ไหม`,
      `${compactSellTopic} ยังประเมินได้ไหม`
    ]);
  }

  return uniquePhrases([
    `${compactSellTopic} ต้องรู้อะไรก่อนขาย`,
    `${compactSellTopic} ต้องเตรียมอะไรบ้าง`,
    `${compactSellTopic} ก่อนประเมินต้องส่งอะไร`,
    `${compactSellTopic} เครื่องมีตำหนิได้ไหม`
  ]);
};

const buildLocalSellIntentKeywords = (
  cleanProduct: string,
  provinceName: string,
  serviceName: string,
  sellProduct: string,
  buyProduct: string,
  appraiseProduct: string,
  usedProduct: string
) =>
  uniquePhrases([
    serviceName,
    `${buyProduct} ${provinceName}`,
    `${sellProduct} มือสอง ${provinceName}`,
    `${usedProduct} ${provinceName}`,
    `${appraiseProduct} ${provinceName}`,
    `${sellProduct} ได้ที่ไหน ${provinceName}`,
    `ร้าน${buyProduct} ${provinceName}`,
    `เช็กราคา${needsLeadingSpace(cleanProduct) ? ' ' : ''}${cleanProduct} ${provinceName}`
  ]);

const buildProductModelKeywords = (cleanProduct: string, provinceName: string) => {
  if (cleanProduct === 'iPhone') {
    return uniquePhrases([
      `รับซื้อ iPhone 11 ${provinceName}`,
      `รับซื้อ iPhone 13 ${provinceName}`,
      `รับซื้อ iPhone Pro Max ${provinceName}`,
      `ขาย iPhone ความจุ 128GB ${provinceName}`
    ]);
  }

  if (cleanProduct === 'iPad') {
    return uniquePhrases([
      `รับซื้อ iPad Pro ${provinceName}`,
      `รับซื้อ iPad Air ${provinceName}`,
      `รับซื้อ iPad mini ${provinceName}`,
      `ขาย iPad พร้อม Apple Pencil ${provinceName}`
    ]);
  }

  if (cleanProduct === 'MacBook') {
    return uniquePhrases([
      `รับซื้อ MacBook Air ${provinceName}`,
      `รับซื้อ MacBook Pro ${provinceName}`,
      `ขาย MacBook M1 ${provinceName}`,
      `ขาย MacBook M2 ${provinceName}`
    ]);
  }

  if (cleanProduct === 'โน๊ตบุ๊ค') {
    return uniquePhrases([
      `รับซื้อโน๊ตบุ๊ค ASUS ${provinceName}`,
      `รับซื้อโน๊ตบุ๊ค Lenovo ${provinceName}`,
      `ขายโน๊ตบุ๊คเกมมิ่ง ${provinceName}`,
      `ขายโน๊ตบุ๊คทำงาน ${provinceName}`
    ]);
  }

  if (cleanProduct === 'Samsung') {
    return uniquePhrases([
      `รับซื้อ Samsung Galaxy S ${provinceName}`,
      `รับซื้อ Samsung Galaxy A ${provinceName}`,
      `รับซื้อ Samsung Galaxy Z Flip ${provinceName}`,
      `ขาย Samsung ความจุ 256GB ${provinceName}`
    ]);
  }

  if (cleanProduct === 'AirPods') {
    return uniquePhrases([
      `รับซื้อ AirPods Pro ${provinceName}`,
      `รับซื้อ AirPods 3 ${provinceName}`,
      `รับซื้อ AirPods Max ${provinceName}`,
      `ขาย AirPods พร้อมเคสชาร์จ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'แท็บเล็ต') {
    return uniquePhrases([
      `รับซื้อแท็บเล็ต Android ${provinceName}`,
      `รับซื้อแท็บเล็ต Samsung ${provinceName}`,
      `รับซื้อแท็บเล็ต Lenovo ${provinceName}`,
      `ขายแท็บเล็ตพร้อมปากกา ${provinceName}`
    ]);
  }

  if (cleanProduct === 'คอมบริษัท') {
    return uniquePhrases([
      `รับซื้อคอมบริษัทยกล็อต ${provinceName}`,
      `รับซื้อโน๊ตบุ๊คบริษัท ${provinceName}`,
      `รับซื้อคอมสำนักงาน ${provinceName}`,
      `ขายอุปกรณ์ IT บริษัท ${provinceName}`
    ]);
  }

  if (cleanProduct === 'Apple Watch') {
    return uniquePhrases([
      `รับซื้อ Apple Watch Ultra ${provinceName}`,
      `รับซื้อ Apple Watch Series 9 ${provinceName}`,
      `รับซื้อ Apple Watch SE ${provinceName}`,
      `ขาย Apple Watch พร้อมสาย ${provinceName}`
    ]);
  }

  if (cleanProduct === 'Apple Pencil') {
    return uniquePhrases([
      `รับซื้อ Apple Pencil Gen 1 ${provinceName}`,
      `รับซื้อ Apple Pencil Gen 2 ${provinceName}`,
      `รับซื้อ Apple Pencil USB-C ${provinceName}`,
      `ขาย Apple Pencil พร้อมกล่อง ${provinceName}`
    ]);
  }

  if (cleanProduct === 'Nintendo Switch') {
    return uniquePhrases([
      `รับซื้อ Nintendo Switch OLED ${provinceName}`,
      `รับซื้อ Nintendo Switch Lite ${provinceName}`,
      `รับซื้อ Nintendo Switch พร้อมจอย ${provinceName}`,
      `ขาย Nintendo Switch พร้อมเกม ${provinceName}`
    ]);
  }

  if (cleanProduct === 'PlayStation') {
    return uniquePhrases([
      `รับซื้อ PlayStation 5 ${provinceName}`,
      `รับซื้อ PlayStation 4 ${provinceName}`,
      `รับซื้อ PlayStation พร้อมจอย ${provinceName}`,
      `ขาย PlayStation พร้อมแผ่นเกม ${provinceName}`
    ]);
  }

  if (cleanProduct === 'กล้อง') {
    return uniquePhrases([
      `รับซื้อกล้อง Sony ${provinceName}`,
      `รับซื้อกล้อง Fujifilm ${provinceName}`,
      `รับซื้อกล้อง Canon ${provinceName}`,
      `ขายกล้องพร้อมเลนส์ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'การ์ดจอ') {
    return uniquePhrases([
      `รับซื้อการ์ดจอ RTX ${provinceName}`,
      `รับซื้อการ์ดจอ GTX ${provinceName}`,
      `รับซื้อการ์ดจอ AMD ${provinceName}`,
      `ขายการ์ดจอ 8GB ${provinceName}`
    ]);
  }

  if (cleanProduct === 'คอมเกมมิ่ง') {
    return uniquePhrases([
      `รับซื้อคอมเกมมิ่ง RTX ${provinceName}`,
      `รับซื้อคอมเกมมิ่ง Ryzen ${provinceName}`,
      `รับซื้อคอมเกมมิ่ง Intel ${provinceName}`,
      `ขายคอมเกมมิ่งพร้อมจอ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'คอมพิวเตอร์') {
    return uniquePhrases([
      `รับซื้อคอมตั้งโต๊ะ ${provinceName}`,
      `รับซื้อคอมสำนักงาน ${provinceName}`,
      `รับซื้อคอม All in One ${provinceName}`,
      `ขายคอมพร้อมจอ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'PC ประกอบ') {
    return uniquePhrases([
      `รับซื้อ PC ประกอบ RTX ${provinceName}`,
      `รับซื้อ PC ประกอบ Ryzen ${provinceName}`,
      `รับซื้อ PC ประกอบ Intel ${provinceName}`,
      `ขาย PC ประกอบพร้อมจอ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'เครื่องปริ้น') {
    return uniquePhrases([
      `รับซื้อเครื่องปริ้นเลเซอร์ ${provinceName}`,
      `รับซื้อเครื่องปริ้นอิงค์เจ็ท ${provinceName}`,
      `รับซื้อเครื่องปริ้นมัลติฟังก์ชัน ${provinceName}`,
      `ขายเครื่องปริ้นพร้อมหมึก ${provinceName}`
    ]);
  }

  if (cleanProduct === 'จอคอม') {
    return uniquePhrases([
      `รับซื้อจอคอม 24 นิ้ว ${provinceName}`,
      `รับซื้อจอคอม 144Hz ${provinceName}`,
      `รับซื้อจอคอมเกมมิ่ง ${provinceName}`,
      `ขายจอคอมพร้อมขาตั้ง ${provinceName}`
    ]);
  }

  if (cleanProduct === 'อุปกรณ์เกมมิ่ง') {
    return uniquePhrases([
      `รับซื้อคีย์บอร์ดเกมมิ่ง ${provinceName}`,
      `รับซื้อเมาส์เกมมิ่ง ${provinceName}`,
      `รับซื้อหูฟังเกมมิ่ง ${provinceName}`,
      `ขายจอยเกม ${provinceName}`
    ]);
  }

  if (cleanProduct === 'อุปกรณ์เสริม IT') {
    return uniquePhrases([
      `รับซื้อ SSD ${provinceName}`,
      `รับซื้อฮาร์ดดิสก์ ${provinceName}`,
      `รับซื้อเราเตอร์ ${provinceName}`,
      `ขายอะแดปเตอร์ IT ${provinceName}`
    ]);
  }

  if (cleanProduct === 'อุปกรณ์สำนักงาน IT') {
    return uniquePhrases([
      `รับซื้อ UPS ${provinceName}`,
      `รับซื้อ Access Point ${provinceName}`,
      `รับซื้อ Switch Network ${provinceName}`,
      `ขายอุปกรณ์ประชุมสำนักงาน ${provinceName}`
    ]);
  }

  if (cleanProduct === 'มือถือ') {
    return uniquePhrases([
      `รับซื้อมือถือ Android ${provinceName}`,
      `รับซื้อมือถือ iPhone ${provinceName}`,
      `รับซื้อมือถือ Samsung ${provinceName}`,
      `ขายมือถือความจุ 256GB ${provinceName}`
    ]);
  }

  if (cleanProduct === 'เครื่องเกม') {
    return uniquePhrases([
      `รับซื้อเครื่องเกม PlayStation ${provinceName}`,
      `รับซื้อเครื่องเกม Nintendo Switch ${provinceName}`,
      `รับซื้อเครื่องเกม Xbox ${provinceName}`,
      `ขายเครื่องเกมพร้อมจอย ${provinceName}`
    ]);
  }

  return uniquePhrases([
    `${cleanProduct} รุ่นไหนขายได้ดี ${provinceName}`,
    `${cleanProduct} แบบไหนขายต่อได้ ${provinceName}`,
    `${cleanProduct} พร้อมอุปกรณ์ ${provinceName}`
  ]);
};

const buildProductIssueKeywords = (cleanProduct: string, provinceName: string) => {
  if (cleanProduct === 'iPhone') {
    return uniquePhrases([
      `ขาย iPhone แบตเสื่อม ${provinceName}`,
      `ขาย iPhone จอมีรอย ${provinceName}`,
      `ขาย iPhone กล้องมีปัญหา ${provinceName}`,
      `ประเมิน iPhone เครื่องมีตำหนิ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'iPad') {
    return uniquePhrases([
      `ขาย iPad จอแตก ${provinceName}`,
      `ขาย iPad ทัชเพี้ยน ${provinceName}`,
      `ขาย iPad พอร์ตชาร์จมีปัญหา ${provinceName}`,
      `ประเมิน iPad เครื่องมีตำหนิ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'MacBook') {
    return uniquePhrases([
      `ขาย MacBook แบตเสื่อม ${provinceName}`,
      `ขาย MacBook จอมีเงา ${provinceName}`,
      `ขาย MacBook พอร์ตมีปัญหา ${provinceName}`,
      `ประเมิน MacBook เครื่องมีตำหนิ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'โน๊ตบุ๊ค') {
    return uniquePhrases([
      `ขายโน๊ตบุ๊คแบตเสื่อม ${provinceName}`,
      `ขายโน๊ตบุ๊คจอแตก ${provinceName}`,
      `ขายโน๊ตบุ๊คเปิดไม่ติด ${provinceName}`,
      `ประเมินโน๊ตบุ๊คเครื่องมีตำหนิ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'Samsung') {
    return uniquePhrases([
      `ขาย Samsung แบตเสื่อม ${provinceName}`,
      `ขาย Samsung จอร้าว ${provinceName}`,
      `ขาย Samsung กล้องมีปัญหา ${provinceName}`,
      `ประเมิน Samsung เครื่องมีตำหนิ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'AirPods') {
    return uniquePhrases([
      `ขาย AirPods แบตเสื่อม ${provinceName}`,
      `ขาย AirPods ไมค์มีปัญหา ${provinceName}`,
      `ขาย AirPods เคสชาร์จมีปัญหา ${provinceName}`,
      `ประเมิน AirPods อุปกรณ์ไม่ครบ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'แท็บเล็ต') {
    return uniquePhrases([
      `ขายแท็บเล็ตจอแตก ${provinceName}`,
      `ขายแท็บเล็ตแบตเสื่อม ${provinceName}`,
      `ขายแท็บเล็ตทัชเพี้ยน ${provinceName}`,
      `ประเมินแท็บเล็ตเครื่องมีตำหนิ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'คอมบริษัท') {
    return uniquePhrases([
      `ขายคอมบริษัทเปิดไม่ติด ${provinceName}`,
      `ขายคอมบริษัทยังมีข้อมูล ${provinceName}`,
      `ขายคอมบริษัทหลายสภาพ ${provinceName}`,
      `ประเมินคอมบริษัทยกล็อต ${provinceName}`
    ]);
  }

  if (cleanProduct === 'Apple Watch') {
    return uniquePhrases([
      `ขาย Apple Watch แบตเสื่อม ${provinceName}`,
      `ขาย Apple Watch จอเป็นรอย ${provinceName}`,
      `ขาย Apple Watch ติด Activation Lock ${provinceName}`,
      `ประเมิน Apple Watch สายไม่ครบ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'Apple Pencil') {
    return uniquePhrases([
      `ขาย Apple Pencil ชาร์จไม่เข้า ${provinceName}`,
      `ขาย Apple Pencil เขียนไม่ติด ${provinceName}`,
      `ขาย Apple Pencil มีรอยหนัก ${provinceName}`,
      `ประเมิน Apple Pencil อุปกรณ์ไม่ครบ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'Nintendo Switch') {
    return uniquePhrases([
      `ขาย Nintendo Switch จอยดริฟต์ ${provinceName}`,
      `ขาย Nintendo Switch แบตเสื่อม ${provinceName}`,
      `ขาย Nintendo Switch เครื่องมีรอย ${provinceName}`,
      `ประเมิน Nintendo Switch อุปกรณ์ไม่ครบ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'PlayStation') {
    return uniquePhrases([
      `ขาย PlayStation พัดลมดัง ${provinceName}`,
      `ขาย PlayStation จอยมีปัญหา ${provinceName}`,
      `ขาย PlayStation อ่านแผ่นไม่ได้ ${provinceName}`,
      `ประเมิน PlayStation อุปกรณ์ไม่ครบ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'กล้อง') {
    return uniquePhrases([
      `ขายกล้องชัตเตอร์สูง ${provinceName}`,
      `ขายกล้องเลนส์มีฝ้า ${provinceName}`,
      `ขายกล้องโฟกัสมีปัญหา ${provinceName}`,
      `ประเมินกล้องอุปกรณ์ไม่ครบ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'การ์ดจอ') {
    return uniquePhrases([
      `ขายการ์ดจอพัดลมดัง ${provinceName}`,
      `ขายการ์ดจอผ่านขุด ${provinceName}`,
      `ขายการ์ดจอพอร์ตมีปัญหา ${provinceName}`,
      `ประเมินการ์ดจอสภาพใช้งาน ${provinceName}`
    ]);
  }

  if (cleanProduct === 'คอมเกมมิ่ง') {
    return uniquePhrases([
      `ขายคอมเกมมิ่งร้อนผิดปกติ ${provinceName}`,
      `ขายคอมเกมมิ่งเปิดไม่ติด ${provinceName}`,
      `ขายคอมเกมมิ่งสเปกไม่ครบ ${provinceName}`,
      `ประเมินคอมเกมมิ่งมีตำหนิ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'คอมพิวเตอร์') {
    return uniquePhrases([
      `ขายคอมเปิดไม่ติด ${provinceName}`,
      `ขายคอมสภาพใช้งาน ${provinceName}`,
      `ขายคอมมีตำหนิ ${provinceName}`,
      `ประเมินคอมเครื่องเก่า ${provinceName}`
    ]);
  }

  if (cleanProduct === 'PC ประกอบ') {
    return uniquePhrases([
      `ขาย PC ประกอบเปิดไม่ติด ${provinceName}`,
      `ขาย PC ประกอบการ์ดจอมีปัญหา ${provinceName}`,
      `ขาย PC ประกอบเคสมีรอย ${provinceName}`,
      `ประเมิน PC ประกอบสภาพใช้งาน ${provinceName}`
    ]);
  }

  if (cleanProduct === 'เครื่องปริ้น') {
    return uniquePhrases([
      `ขายเครื่องปริ้นหัวตัน ${provinceName}`,
      `ขายเครื่องปริ้นกระดาษติด ${provinceName}`,
      `ขายเครื่องปริ้นพิมพ์ไม่ออก ${provinceName}`,
      `ประเมินเครื่องปริ้นอุปกรณ์ไม่ครบ ${provinceName}`
    ]);
  }

  if (cleanProduct === 'จอคอม') {
    return uniquePhrases([
      `ขายจอคอมมีเดดพิกเซล ${provinceName}`,
      `ขายจอคอมจอเป็นเส้น ${provinceName}`,
      `ขายจอคอมไม่มีขาตั้ง ${provinceName}`,
      `ประเมินจอคอมสภาพใช้งาน ${provinceName}`
    ]);
  }

  if (cleanProduct === 'อุปกรณ์เกมมิ่ง') {
    return uniquePhrases([
      `ขายคีย์บอร์ดเกมมิ่งปุ่มเสีย ${provinceName}`,
      `ขายเมาส์เกมมิ่งดับเบิลคลิก ${provinceName}`,
      `ขายหูฟังเกมมิ่งไมค์มีปัญหา ${provinceName}`,
      `ประเมินอุปกรณ์เกมมิ่งสภาพใช้งาน ${provinceName}`
    ]);
  }

  if (cleanProduct === 'อุปกรณ์เสริม IT') {
    return uniquePhrases([
      `ขาย SSD สุขภาพลด ${provinceName}`,
      `ขายฮาร์ดดิสก์มีเสียงดัง ${provinceName}`,
      `ขายเราเตอร์มีปัญหา ${provinceName}`,
      `ประเมินอุปกรณ์เสริม IT สภาพใช้งาน ${provinceName}`
    ]);
  }

  if (cleanProduct === 'อุปกรณ์สำนักงาน IT') {
    return uniquePhrases([
      `ขาย UPS แบตเสื่อม ${provinceName}`,
      `ขาย Access Point มีปัญหา ${provinceName}`,
      `ขายอุปกรณ์สำนักงาน IT หลายสภาพ ${provinceName}`,
      `ประเมินอุปกรณ์สำนักงาน IT ยกชุด ${provinceName}`
    ]);
  }

  if (cleanProduct === 'มือถือ') {
    return uniquePhrases([
      `ขายมือถือแบตเสื่อม ${provinceName}`,
      `ขายมือถือจอร้าว ${provinceName}`,
      `ขายมือถือเครื่องมีตำหนิ ${provinceName}`,
      `ประเมินมือถือสภาพใช้งาน ${provinceName}`
    ]);
  }

  if (cleanProduct === 'เครื่องเกม') {
    return uniquePhrases([
      `ขายเครื่องเกมจอยมีปัญหา ${provinceName}`,
      `ขายเครื่องเกมพัดลมดัง ${provinceName}`,
      `ขายเครื่องเกมอุปกรณ์ไม่ครบ ${provinceName}`,
      `ประเมินเครื่องเกมสภาพใช้งาน ${provinceName}`
    ]);
  }

  return uniquePhrases([
    `${withTopic('ขาย', cleanProduct)} เครื่องมีตำหนิ ${provinceName}`,
    `${withTopic('ขาย', cleanProduct)} สภาพใช้งาน ${provinceName}`,
    `${withTopic('ประเมิน', cleanProduct)} ก่อนขาย ${provinceName}`
  ]);
};

export const joinThaiKeywordList = (items: string[], quoted = false) => {
  const normalized = items.map((item) => (quoted ? `“${item}”` : item));
  return joinThaiListInternal(normalized);
};

export const buildSellKeywordCluster = ({
  productName,
  provinceName,
  serviceName
}: {
  productName: string;
  provinceName: string;
  serviceName: string;
}): KeywordCluster => {
  const cleanProduct = stripUsedQualifier(productName);
  const buyProduct = withTopic('รับซื้อ', cleanProduct);
  const sellProduct = withTopic('ขาย', cleanProduct);
  const appraiseProduct = withTopic('ประเมินราคา', cleanProduct);
  const usedProduct = /มือสอง/u.test(productName) ? normalizeTopic(productName) : `${cleanProduct} มือสอง`;
  const localIntent = buildLocalSellIntentKeywords(
    cleanProduct,
    provinceName,
    serviceName,
    sellProduct,
    buyProduct,
    appraiseProduct,
    usedProduct
  );
  const modelIntent = buildProductModelKeywords(cleanProduct, provinceName);
  const issueIntent = buildProductIssueKeywords(cleanProduct, provinceName);

  return {
    primary: serviceName,
    secondary: uniquePhrases([serviceName, ...localIntent, ...modelIntent, ...issueIntent]),
    localIntent,
    modelIntent,
    issueIntent
  };
};

export const buildAreaKeywordCluster = (provinceName: string): KeywordCluster => ({
  primary: `รับซื้อสินค้าไอทีมือสอง ${provinceName}`,
  localIntent: uniquePhrases([
    `รับซื้อสินค้าไอทีมือสอง ${provinceName}`,
    `ประเมินราคาไอทีมือสอง ${provinceName}`,
    `ขายมือถือมือสอง ${provinceName}`,
    `ขายโน๊ตบุ๊คมือสอง ${provinceName}`
  ]),
  modelIntent: uniquePhrases([
    `ขาย iPhone ${provinceName}`,
    `ขาย iPad ${provinceName}`,
    `ขาย MacBook ${provinceName}`,
    `ขายคอมพิวเตอร์มือสอง ${provinceName}`,
    `ขายคอมบริษัท ${provinceName}`,
    `ขายอุปกรณ์ไอที ${provinceName}`
  ]),
  issueIntent: uniquePhrases([
    `ขายไอทีหลายชิ้น ${provinceName}`,
    `ขายสินค้าไอทีต่างอำเภอ ${provinceName}`,
    `เช็กราคาไอทีมือสอง ${provinceName}`,
    `ร้านรับซื้อไอทีใกล้ฉัน ${provinceName}`
  ]),
  secondary: uniquePhrases([
    `รับซื้อสินค้าไอทีมือสอง ${provinceName}`,
    `ประเมินราคาไอทีมือสอง ${provinceName}`,
    `ขายมือถือมือสอง ${provinceName}`,
    `ขายโน๊ตบุ๊คมือสอง ${provinceName}`,
    `ขาย iPhone ${provinceName}`,
    `ขาย iPad ${provinceName}`,
    `ขาย MacBook ${provinceName}`,
    `ขายคอมพิวเตอร์มือสอง ${provinceName}`,
    `ขายคอมบริษัท ${provinceName}`,
    `ขายอุปกรณ์ไอที ${provinceName}`,
    `ขายไอทีหลายชิ้น ${provinceName}`,
    `ขายสินค้าไอทีต่างอำเภอ ${provinceName}`,
    `เช็กราคาไอทีมือสอง ${provinceName}`,
    `ร้านรับซื้อไอทีใกล้ฉัน ${provinceName}`
  ])
});

export const buildArticleKeywordCluster = ({
  title,
  tags = [],
  slug
}: {
  title: string;
  tags?: string[];
  slug: string;
}): KeywordCluster => {
  const topic = detectArticleTopic(title, tags, slug);
  const localIntent = buildArticleIntentKeywords(title, topic);
  const modelIntent = buildArticleTopicKeywords(topic);
  const issueIntent = buildArticleIssueKeywords(title, topic);

  return {
    primary: title,
    secondary: uniquePhrases([
      ...buildArticleSecondaryKeywords(title, topic),
      ...localIntent,
      ...modelIntent,
      ...issueIntent
    ]),
    localIntent,
    modelIntent,
    issueIntent
  };
};

export const buildHomeKeywordCluster = (): KeywordCluster => {
  const localIntent = uniquePhrases([
    'รับซื้อสินค้าไอทีมือสอง ภาคอีสาน',
    'ขายโน๊ตบุ๊คมือสอง ภาคอีสาน',
    'ขาย iPhone มือสอง ภาคอีสาน',
    'ประเมินราคา MacBook ภาคอีสาน'
  ]);
  const modelIntent = uniquePhrases([
    'รับซื้อ MacBook iPhone iPad ภาคอีสาน',
    'รับซื้อคอมพิวเตอร์ โน๊ตบุ๊ค จอคอม ภาคอีสาน',
    'รับซื้อกล้อง เครื่องเกม การ์ดจอ ภาคอีสาน',
    'รับซื้อคอมบริษัท อุปกรณ์สำนักงาน IT ภาคอีสาน'
  ]);
  const issueIntent = uniquePhrases([
    'ขายไอทีมือสองได้ที่ไหน ภาคอีสาน',
    'ส่งรูปเช็กราคาสินค้าไอที ภาคอีสาน',
    'ขายสินค้าไอทีหลายชิ้น ภาคอีสาน',
    'ขายไอทีต่างจังหวัด ภาคอีสาน'
  ]);

  return {
    primary: 'รับซื้อสินค้าไอทีมือสอง ภาคอีสาน',
    secondary: uniquePhrases([...localIntent, ...modelIntent, ...issueIntent]),
    localIntent,
    modelIntent,
    issueIntent
  };
};

export const buildSellHubKeywordCluster = (): KeywordCluster => {
  const localIntent = uniquePhrases([
    'รับซื้อสินค้าไอทีมือสอง',
    'ขายโน๊ตบุ๊คมือสอง',
    'ขายคอมพิวเตอร์มือสอง',
    'ขายมือถือมือสอง'
  ]);
  const modelIntent = uniquePhrases([
    'รับซื้อ MacBook iPhone iPad',
    'รับซื้อการ์ดจอ จอคอม คอมเกมมิ่ง',
    'รับซื้อ AirPods Apple Watch Apple Pencil',
    'รับซื้อคอมบริษัท เครื่องปริ้น อุปกรณ์สำนักงาน IT'
  ]);
  const issueIntent = uniquePhrases([
    'ขายเครื่องมีตำหนิได้ไหม',
    'ขายหลายชิ้นต้องเตรียมอะไร',
    'ส่งรูปเช็กราคาต้องส่งอะไรบ้าง',
    'เลือกหน้ารับซื้อหมวดไหนดี'
  ]);

  return {
    primary: 'รับซื้อสินค้าไอทีมือสอง',
    secondary: uniquePhrases([...localIntent, ...modelIntent, ...issueIntent]),
    localIntent,
    modelIntent,
    issueIntent
  };
};

export const buildAreaHubKeywordCluster = (): KeywordCluster => {
  const localIntent = uniquePhrases([
    'รับซื้อสินค้าไอทีมือสอง ภาคอีสาน',
    'ขาย iPhone ขอนแก่น',
    'ขาย MacBook อุดรธานี',
    'ขายโน๊ตบุ๊ค นครราชสีมา'
  ]);
  const modelIntent = uniquePhrases([
    'รับซื้อ iPad อุบลราชธานี',
    'รับซื้อคอมบริษัท ขอนแก่น',
    'รับซื้อจอคอม บุรีรัมย์',
    'รับซื้อกล้อง ศรีสะเกษ'
  ]);
  const issueIntent = uniquePhrases([
    'ขายไอทีต่างอำเภอ ภาคอีสาน',
    'ขายสินค้าไอทีจังหวัดใกล้เคียง',
    'เช็กราคาสินค้าไอทีต่างจังหวัด',
    'นัดรับสินค้าไอทีภาคอีสาน'
  ]);

  return {
    primary: 'รับซื้อสินค้าไอทีมือสอง ภาคอีสาน',
    secondary: uniquePhrases([...localIntent, ...modelIntent, ...issueIntent]),
    localIntent,
    modelIntent,
    issueIntent
  };
};

export const buildArticleHubKeywordCluster = (): KeywordCluster => {
  const localIntent = uniquePhrases([
    'บทความขายสินค้าไอทีมือสอง',
    'คู่มือก่อนขาย iPhone',
    'คู่มือก่อนขาย MacBook',
    'บทความประเมินราคาโน๊ตบุ๊ค'
  ]);
  const modelIntent = uniquePhrases([
    'ขาย iPhone ต้องออก iCloud ไหม',
    'ขาย MacBook ต้องออก Apple ID ไหม',
    'ขายคอมเกมมิ่งต้องส่งสเปกอะไรบ้าง',
    'ขายคอมบริษัทเก่าต้องทำอย่างไร'
  ]);
  const issueIntent = uniquePhrases([
    'ขายเครื่องเสียได้ไหม',
    'ขายอุปกรณ์ไม่ครบได้ไหม',
    'ต้องล้างข้อมูลก่อนขายไหม',
    'ต้องเตรียมอะไรบ้างก่อนประเมินราคา'
  ]);

  return {
    primary: 'บทความขายสินค้าไอทีมือสอง',
    secondary: uniquePhrases([...localIntent, ...modelIntent, ...issueIntent]),
    localIntent,
    modelIntent,
    issueIntent
  };
};
