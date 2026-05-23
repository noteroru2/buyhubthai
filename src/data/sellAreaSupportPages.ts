import { getAreaCoverageProfile } from './areaCoverageProfiles';
import {
  buildSellSupportPageData,
  getSellSupportTopic,
  SELL_SUPPORT_TOPICS,
  type SellSupportPageData
} from './sellSupportPages';
import { areaThaiHref } from '../lib/thaiRoutes';

type LinkItem = {
  href: string;
  label: string;
};

type KeywordGroup = {
  title: string;
  blurb?: string;
  items: string[];
};

type SupportedProvinceId =
  | 'amnat-charoen'
  | 'bueng-kan'
  | 'buriram'
  | 'chaiyaphum'
  | 'kalasin'
  | 'khon-kaen'
  | 'loei'
  | 'maha-sarakham'
  | 'mukdahan'
  | 'nakhon-phanom'
  | 'nakhon-ratchasima'
  | 'nong-bua-lamphu'
  | 'nong-khai'
  | 'roi-et'
  | 'sakon-nakhon'
  | 'sisaket'
  | 'surin'
  | 'ubon-ratchathani'
  | 'udon-thani'
  | 'yasothon';

type SupportedSellId = 'iphone' | 'ipad' | 'macbook' | 'notebook' | 'corporate-it';

type AreaSupportTarget = {
  sellId: SupportedSellId;
  productName: string;
  shortLabel: string;
  provinceId: SupportedProvinceId;
  provinceName: string;
  areaPath: string;
  mainPath: string;
  mainLabel: string;
  districts: string[];
};

const withProduct = (prefix: string, productName: string) =>
  /^[A-Za-z0-9]/.test(productName) ? `${prefix} ${productName}` : `${prefix}${productName}`;

const dedupeLinks = (links: LinkItem[]) => {
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = `${link.href}::${link.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const PROVINCES: Record<SupportedProvinceId, { name: string }> = {
  'amnat-charoen': { name: 'อำนาจเจริญ' },
  'bueng-kan': { name: 'บึงกาฬ' },
  'buriram': { name: 'บุรีรัมย์' },
  'chaiyaphum': { name: 'ชัยภูมิ' },
  'kalasin': { name: 'กาฬสินธุ์' },
  'khon-kaen': { name: 'ขอนแก่น' },
  'loei': { name: 'เลย' },
  'maha-sarakham': { name: 'มหาสารคาม' },
  'mukdahan': { name: 'มุกดาหาร' },
  'nakhon-phanom': { name: 'นครพนม' },
  'nakhon-ratchasima': { name: 'นครราชสีมา' },
  'nong-bua-lamphu': { name: 'หนองบัวลำภู' },
  'nong-khai': { name: 'หนองคาย' },
  'roi-et': { name: 'ร้อยเอ็ด' },
  'sakon-nakhon': { name: 'สกลนคร' },
  'sisaket': { name: 'ศรีสะเกษ' },
  'surin': { name: 'สุรินทร์' },
  'ubon-ratchathani': { name: 'อุบลราชธานี' },
  'udon-thani': { name: 'อุดรธานี' },
  'yasothon': { name: 'ยโสธร' }
};

const buildMainPaths = (prefix: string) => {
  return Object.fromEntries(
    (Object.entries(PROVINCES) as [SupportedProvinceId, { name: string }][]).map(([id, prov]) => [
      id,
      `${prefix}${prov.name}`
    ])
  ) as Record<SupportedProvinceId, string>;
};

const PRODUCTS: Record<
  SupportedSellId,
  {
    productName: string;
    shortLabel: string;
    mainPaths: Record<SupportedProvinceId, string>;
  }
> = {
  iphone: {
    productName: 'iPhone',
    shortLabel: 'iPhone',
    mainPaths: buildMainPaths('/รับซื้อ-iphone-')
  },
  ipad: {
    productName: 'iPad',
    shortLabel: 'iPad',
    mainPaths: buildMainPaths('/รับซื้อ-ipad-')
  },
  macbook: {
    productName: 'MacBook',
    shortLabel: 'MacBook',
    mainPaths: buildMainPaths('/รับซื้อ-macbook-')
  },
  notebook: {
    productName: 'โน๊ตบุ๊ค',
    shortLabel: 'โน๊ตบุ๊ค',
    mainPaths: buildMainPaths('/รับซื้อโน๊ตบุ๊ค-')
  },
  'corporate-it': {
    productName: 'คอมบริษัทและอุปกรณ์ IT สำนักงาน',
    shortLabel: 'คอมบริษัท',
    mainPaths: buildMainPaths('/รับซื้อคอมบริษัท-')
  }
};

export const buildSellAreaSupportPath = (
  sellId: SupportedSellId,
  provinceName: string,
  topicSlug: string
) => `/รับซื้อ/${sellId}/${provinceName}/${topicSlug}`;

export const SELL_AREA_SUPPORT_TARGETS: AreaSupportTarget[] = (
  Object.entries(PRODUCTS) as [SupportedSellId, (typeof PRODUCTS)[SupportedSellId]][]
).flatMap(([sellId, product]) =>
  (Object.entries(PROVINCES) as [SupportedProvinceId, (typeof PROVINCES)[SupportedProvinceId]][]).map(
    ([provinceId, province]) => ({
      sellId,
      productName: product.productName,
      shortLabel: product.shortLabel,
      provinceId,
      provinceName: province.name,
      areaPath: areaThaiHref(provinceId),
      mainPath: product.mainPaths[provinceId],
      mainLabel: `${withProduct('รับซื้อ', product.shortLabel)} ${province.name}`,
      districts: getAreaCoverageProfile(provinceId)?.districts ?? []
    })
  )
);

const MAIN_PATH_TO_TARGET = Object.fromEntries(
  SELL_AREA_SUPPORT_TARGETS.map((target) => [target.mainPath, target])
) as Record<string, AreaSupportTarget>;

const findAreaSupportTarget = (sellId: string, provinceName: string) =>
  SELL_AREA_SUPPORT_TARGETS.find(
    (target) => target.sellId === sellId && target.provinceName === provinceName
  ) ?? null;

const buildLocalSupportLinks = (target: AreaSupportTarget, excludeTopicSlug?: string) =>
  SELL_SUPPORT_TOPICS.filter((topic) => topic.slug !== excludeTopicSlug).map((topic) => ({
    href: buildSellAreaSupportPath(target.sellId, target.provinceName, topic.slug),
    label: `${target.mainLabel} ${topic.label}`
  }));

const buildProvinceSentence = (
  target: AreaSupportTarget,
  topicLabel: string,
  productName: string,
  index: number
) => {
  const districtHead = target.districts.slice(0, 3).join(', ');
  const districtTail = target.districts.slice(3, 6).join(', ');

  switch (index % 6) {
    case 0:
      return `ในบริบทของ${target.provinceName} คนที่อยู่แถว${districtHead}มักเริ่มจากคำถามเรื่อง ${topicLabel} ก่อน เพราะต้องชั่งทั้งราคาและความสะดวกของขั้นตอนถัดไปไปพร้อมกัน`;
    case 1:
      return `ถ้าคุณอยู่ใน${target.provinceName}และสะดวกโซน${districtTail} การบอกพื้นที่โดยประมาณตั้งแต่ต้นจะช่วยให้คำตอบเรื่อง ${topicLabel} ของ ${productName} ใช้งานต่อได้ง่ายขึ้น`;
    case 2:
      return `หน้าชุดนี้ตั้งใจเชื่อมจากหน้าหลัก ${target.mainLabel} ไปยังคำถามย่อยที่คนขายใน${target.provinceName}ใช้จริงก่อนทัก LINE`;
    case 3:
      return `สำหรับ${productName}ใน${target.provinceName} หัวข้อ ${topicLabel} มักไม่ได้จบที่ราคาอย่างเดียว แต่รวมถึงการเตรียมข้อมูลให้พอสำหรับคุยต่อในพื้นที่จริงด้วย`;
    case 4:
      return `ถ้ามีหลายชิ้นจาก${target.provinceName} การแยกข้อมูลตามรุ่นและสภาพตั้งแต่ต้นจะทำให้คำตอบในหัวข้อ ${topicLabel} ตรงกับหน้างานมากกว่าเดิม`;
    default:
      return `ลูกค้าใน${target.provinceName}ที่เริ่มจากหน้านี้สามารถย้อนกลับไปดูหน้าหลักบริการและหน้าพื้นที่ให้บริการของจังหวัดได้ทันที เพื่อไม่ให้การคุยเรื่อง ${topicLabel} หลุดจากบริบทพื้นที่`;
  }
};

const formatSupportTopicLabel = (linkLabel: string, mainLabel: string) =>
  linkLabel.startsWith(`${mainLabel} `) ? linkLabel.slice(mainLabel.length + 1) : linkLabel;

const localizeParagraphs = (
  paragraphs: string[] | undefined,
  target: AreaSupportTarget,
  topicLabel: string,
  productName: string
) =>
  (paragraphs ?? []).map(
    (paragraph, index) =>
      `${paragraph} ${buildProvinceSentence(target, topicLabel, productName, index)}`
  );

const buildKeywordGroups = (
  target: AreaSupportTarget,
  topicLabel: string,
  productName: string
): KeywordGroup[] => {
  const sellProduct = withProduct('ขาย', productName);
  const buyProduct = withProduct('รับซื้อ', productName);
  const districtKeywords = target.districts.slice(0, 4);

  return [
    {
      title: 'คีย์หลักในจังหวัด',
      blurb: 'เกาะกับคำค้นหลักของสินค้าและจังหวัดนี้โดยตรง',
      items: [
        `${buyProduct} ${target.provinceName}`,
        `${sellProduct} ${target.provinceName}`,
        `${buyProduct} ${target.provinceName} ${topicLabel}`,
        `${sellProduct} ${topicLabel} ${target.provinceName}`
      ]
    },
    {
      title: 'คีย์ตามอำเภอหรือโซน',
      blurb: 'รองรับคนที่ค้นแบบระบุพื้นที่ย่อยก่อนทักจริง',
      items: districtKeywords.map((district, index) =>
        index % 2 === 0
          ? `${sellProduct} ${district}`
          : `${buyProduct} ${district} ${topicLabel}`
      )
    },
    {
      title: 'คีย์ตามสถานการณ์ก่อนขาย',
      blurb: 'จับคำถามย่อยที่เชื่อมกลับหน้าหลักจังหวัดได้ดี',
      items: [
        `${sellProduct} ด่วน ${target.provinceName}`,
        `${sellProduct} เช็กราคาก่อนขาย ${target.provinceName}`,
        `${sellProduct} ประเมินออนไลน์ ${target.provinceName}`,
        `${buyProduct} ${target.provinceName} ส่งข้อมูลอะไรบ้าง`
      ]
    }
  ];
};

export const getSellAreaSupportLinksByMainPath = (path: string) => {
  const target = MAIN_PATH_TO_TARGET[path];
  if (!target) return null;

  return {
    provinceName: target.provinceName,
    productName: target.productName,
    links: SELL_SUPPORT_TOPICS.map((topic) => ({
      href: buildSellAreaSupportPath(target.sellId, target.provinceName, topic.slug),
      label: `${target.mainLabel} ${topic.label}`
    }))
  };
};

export const buildSellAreaSupportPageData = (params: {
  sellId: string;
  sellTitle: string;
  sellDescription: string;
  provinceName: string;
  topicSlug: string;
}): SellSupportPageData | null => {
  const topic = getSellSupportTopic(params.topicSlug);
  const target = findAreaSupportTarget(params.sellId, params.provinceName);

  if (!topic || !target) return null;

  const basePage = buildSellSupportPageData({
    sellId: params.sellId,
    sellTitle: params.sellTitle,
    sellDescription: params.sellDescription,
    topicSlug: params.topicSlug
  });

  if (!basePage) return null;

  const districtHead = target.districts.slice(0, 3).join(', ');
  const districtTail = target.districts.slice(3, 6).join(', ');
  const buyProduct = withProduct('รับซื้อ', target.shortLabel);
  const sellProduct = withProduct('ขาย', target.shortLabel);
  const serviceName = `${buyProduct} ${target.provinceName} ${topic.label}`;
  const path = buildSellAreaSupportPath(target.sellId, target.provinceName, topic.slug);
  const localSupportLinks = buildLocalSupportLinks(target, topic.slug);
  const districtFocus = districtTail || districtHead || target.provinceName;
  const followupTopics =
    localSupportLinks
      .slice(0, 3)
      .map((link) => formatSupportTopicLabel(link.label, target.mainLabel))
      .join(', ') || `หน้าหลัก ${target.mainLabel}`;

  const sections = [
    {
      heading: `${sellProduct} ใน${target.provinceName} ถ้าติดเรื่อง ${topic.label} ควรเริ่มยังไง`,
      paragraphs: [
        `หน้านี้ตั้งใจตอบคนที่ค้นว่า “${serviceName}” ซึ่งมักกำลัง${topic.userNeed} มากกว่าจะอ่านข้อมูลกว้างของ ${target.productName} อย่างเดียว เราจึงโฟกัสให้เห็นว่าถ้าอยู่ใน${target.provinceName} ควรเริ่มจาก ${topic.actionAngle} และต้องจัดข้อมูลแบบไหนจึงจะพาไปสู่คำตอบที่ใช้ต่อได้จริง`,
        `สำหรับคนที่อยู่แถว${districtHead} การเริ่มจากหัวข้อ ${topic.label} จะช่วยคุมบทสนทนาให้ตรงขึ้น เพราะรู้ตั้งแต่ต้นว่าต้องใช้กรอบคิดแบบ ${topic.prepAngle} และต้องส่งข้อมูลของ ${target.productName} เรื่องสภาพ รุ่น อุปกรณ์ และบริบทพื้นที่แบบไหนถึงจะได้คำตอบที่เอาไปใช้ต่อได้จริง`,
        `ถ้าคุณอยู่โซน${districtFocus}หรืออยู่ต่างอำเภอของ${target.provinceName} หน้านี้จะช่วยย่นทางจากคำถามว่า “${topic.scenarioAngle}” ไปสู่หน้าหลัก ${target.mainLabel} หน้าพื้นที่ให้บริการของจังหวัด และหน้าคำค้นรองอย่าง ${followupTopics} เพื่อให้ตัดสินใจต่อได้ง่ายขึ้น`
      ],
      list: [
        `${sellProduct} แต่ยังไม่แน่ใจว่าควรเริ่มจากเช็กราคาหรือคุยขายเลย`,
        `ต้องการคำตอบเรื่อง ${topic.label} ในบริบทของ${target.provinceName}`,
        `อยู่ต่างอำเภอและอยากเริ่มจากรูปกับข้อมูลก่อนนัด`,
        `มีหลายชิ้นและต้องการจัดข้อมูลให้ทีมประเมินอ่านง่ายตั้งแต่รอบแรก`
      ],
      links: [
        { href: target.mainPath, label: `${target.mainLabel} หน้าหลัก` },
        { href: target.areaPath, label: `พื้นที่ให้บริการ ${target.provinceName}` }
      ]
    },
    ...basePage.sections.map((section, sectionIndex) => ({
      ...section,
      heading:
        sectionIndex === basePage.sections.length - 1
          ? `${section.heading} สำหรับ${target.provinceName}`
          : `${section.heading} ใน${target.provinceName}`,
      paragraphs: localizeParagraphs(section.paragraphs, target, topic.label, target.productName),
      links: section.links?.length
        ? dedupeLinks([
            { href: target.mainPath, label: `${target.mainLabel} หน้าหลัก` },
            { href: target.areaPath, label: `พื้นที่ให้บริการ ${target.provinceName}` },
            ...section.links,
            ...localSupportLinks.slice(0, 4)
          ])
        : section.links
    }))
  ];

  const faqs = [
    {
      question: `${sellProduct} ใน${target.provinceName} ถ้าติดเรื่อง ${topic.label} ต้องส่งอะไรบ้าง`,
      answer: `อย่างน้อยควรมีรุ่นหรือสเปกหลักของ ${target.productName} สภาพใช้งานจริง ตำหนิ อุปกรณ์ที่มี และอำเภอหรือโซนใน${target.provinceName} ที่สะดวกคุยงาน เช่น ${districtHead} โดยยึดแนวทาง ${topic.prepAngle} เพื่อให้คำตอบในหัวข้อ ${topic.label} ตรงกับเคสของคุณมากขึ้น`
    },
    {
      question: `อยู่ต่างอำเภอใน${target.provinceName} เริ่มคุย ${target.productName} แบบ ${topic.label} ได้ไหม`,
      answer: `ได้ เริ่มจากส่งรูป ${target.productName} และข้อมูลหลักผ่าน LINE ก่อน แล้วระบุพื้นที่โดยประมาณใน${target.provinceName} ทีมงานจะช่วยแนะนำว่าควรเดินต่อด้วยการประเมินออนไลน์ การรวมรายการ หรือการคุยขั้นถัดไปแบบไหนให้เหมาะกับหัวข้อ ${topic.label} โดยอิงสถานการณ์ที่ว่า ${topic.scenarioAngle}`
    },
    {
      question: `${buyProduct} ${target.provinceName} เรื่อง ${topic.label} ดูอะไรเป็นพิเศษ`,
      answer: `ดูทั้งรุ่น สเปก สภาพ อุปกรณ์ และบริบทพื้นที่ควบคู่กัน โดยเฉพาะตัวแปรที่เกี่ยวกับ ${topic.pricingAngle} เพื่อให้คำตอบใน${target.provinceName} ใช้ต่อได้จริง ไม่ใช่แค่ตัวเลขกว้าง ๆ แบบไม่ผูกกับข้อมูลจริงของ ${target.productName}`
    },
    {
      question: `ถ้ามี ${target.productName} หลายชิ้นใน${target.provinceName} ควรส่งยังไง`,
      answer: `ควรแยก ${target.productName} เป็นชุดตามรุ่น สภาพ หรือสถานะอุปกรณ์ แล้วแนบรูปให้สัมพันธ์กัน โดยเฉพาะเคสจาก${target.provinceName}ที่เป็นงานหลายรายการ การจัดข้อมูลเป็นระบบจะช่วยให้คุณใช้แนวคิด ${topic.decisionAngle} ได้ง่ายขึ้นเมื่อคุยเรื่อง ${topic.label}`
    },
    {
      question: `ควรอ่านหน้าไหนต่อหลังจากดู ${serviceName}`,
      answer: `แนะนำให้อ่านต่อทั้งหน้าหลัก ${target.mainLabel} เพื่อดูภาพรวมของบริการ และหน้าพื้นที่ให้บริการ ${target.provinceName} เพื่อเช็กบริบทพื้นที่ จากนั้นค่อยดูหน้าคำค้นรองอย่าง ${followupTopics} หากยังต้องการคำตอบต่อยอดจากหัวข้อ ${topic.label} ให้ลึกขึ้นอีกขั้น`
    },
    {
      question: `ถ้าพร้อมคุยจริงแล้วใน${target.provinceName} ควรทำขั้นตอนไหนก่อน`,
      answer: `เริ่มจากส่งรูป ${target.productName} พร้อมข้อมูลหลักในกรอบของหัวข้อ ${topic.label} และระบุพื้นที่ใน${target.provinceName} ที่สะดวก โดยยึดลำดับแบบ ${topic.actionAngle} จากนั้นทีมงานจะช่วยจัดคำตอบให้ตรงกับเคสของคุณมากที่สุดก่อนคุยขั้นถัดไป`
    }
  ];

  return {
    ...basePage,
    path,
    title: `${serviceName} | BuyHub`,
    description: `${serviceName} พร้อมคำตอบเรื่อง ${topic.userNeed} ในบริบทของ${target.provinceName} ช่วยให้เช็กราคา ส่งข้อมูล และตัดสินใจขาย ${target.productName} ได้ตรงกับพื้นที่จริงมากขึ้น`,
    h1: serviceName,
    serviceName,
    breadcrumbs: [
      { href: '/', label: 'หน้าแรก' },
      { href: '/รับซื้อ', label: 'รับซื้ออะไรบ้าง' },
      { href: target.areaPath, label: target.provinceName },
      { href: target.mainPath, label: target.mainLabel },
      { href: path, label: serviceName }
    ],
    intro: [
      `คนที่ค้นหา “${serviceName}” มักกำลังชั่งทั้งเรื่องราคาและเรื่องพื้นที่พร้อมกัน ไม่ใช่แค่หาว่า ${target.productName} ยังขายได้ไหม แต่ยังอยากรู้ว่าถ้าอยู่ใน${target.provinceName}ควรเริ่มยังไงให้ไม่เสียรอบ`,
      `สำหรับโซน${districtHead} รวมถึงอำเภอรอบนอกของ${target.provinceName} การเริ่มจากหัวข้อ ${topic.label} จะช่วยให้คุณรู้เร็วขึ้นว่าควรถ่ายรูป ${target.productName} มุมไหน แจ้งสภาพแบบไหน และควรใช้มุม ${topic.prepAngle} ก่อนถึงจะคุยงานต่อได้ลื่น`,
      `เราจึงทำหน้านี้ให้เชื่อมกลับทั้งหน้าหลัก ${target.mainLabel}, หน้าพื้นที่ให้บริการ ${target.provinceName}, และหน้าคำค้นรองอย่าง ${followupTopics} เพื่อให้คีย์หลักของหน้าจังหวัดแข็งขึ้นจากคำถามย่อยที่ผู้ใช้ค้นจริงและเชื่อมกับเรื่อง ${topic.decisionAngle}`
    ],
    heroPoints: [
      `${serviceName} ใช้ตอบคำถามเรื่อง ${topic.label} แบบผูกกับพื้นที่จริง`,
      `อำเภอที่มักใช้เริ่มคุยงานใน${target.provinceName}: ${districtHead}`,
      `ก่อนคุยจริงควรโฟกัสเรื่อง ${topic.prepAngle}`,
      `ย้อนกลับหน้าหลัก ${target.mainLabel} ได้ทันทีถ้าต้องการดูภาพรวมบริการ`
    ],
    trustNotes: [
      `หน้านี้ออกแบบสำหรับคนที่ค้นแบบ “สินค้า + จังหวัด + ${topic.label}” โดยตรง`,
      `มีลิงก์กลับทั้งหน้าหลัก ${target.mainLabel} และหน้าพื้นที่ให้บริการ ${target.provinceName}`,
      `เนื้อหาเน้นทั้งคนขายเดี่ยวและงานหลายชิ้นในบริบทของ${target.provinceName}`
    ],
    keywordIntro: [
      `คีย์เวิร์ดของหน้านี้ไม่ได้เกาะแค่คำว่า “${buyProduct}” แต่ขยายไปยังคำค้นที่คนใช้จริงใน${target.provinceName} เช่น ${sellProduct} ${topic.label} หรือการค้นแบบระบุอำเภอและโซนก่อนทัก`,
      `การมีหน้าคำค้นรองที่ลงลึกถึงระดับจังหวัดช่วยให้หน้าหลัก ${target.mainLabel} ได้ topical coverage แน่นขึ้น และทำให้คนที่กำลังตัดสินใจขาย ${target.productName} ใน${target.provinceName} ได้คำตอบตรงสถานการณ์ของหัวข้อ ${topic.label} โดยเฉพาะเรื่อง ${topic.pricingAngle} และ ${topic.decisionAngle}`
    ],
    keywordGroups: buildKeywordGroups(target, topic.label, target.shortLabel),
    sections,
    ctaHeading: `พร้อม${sellProduct}ใน${target.provinceName} เรื่อง ${topic.label} แล้วหรือยัง`,
    ctaSub: `ส่งรูป ${target.productName} พร้อมรุ่น สภาพ อุปกรณ์ และพื้นที่ใน${target.provinceName} ที่สะดวกคุยงานในกรอบของหัวข้อ ${topic.label} ให้ BuyHub ประเมินเบื้องต้นได้เลย โดยยึดแนวทาง ${topic.actionAngle} และ ${topic.prepAngle} ยิ่งข้อมูลครบตั้งแต่ต้น คำตอบยิ่งใกล้เคียงกับเคสจริงมากขึ้น`,
    faqs
  };
};
