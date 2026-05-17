import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUTPUT_DIR = path.resolve('public/images/og');
const WIDTH = 1200;
const HEIGHT = 630;
const TILE_GAP = 18;

const photo = (relativePath) => path.resolve(relativePath);

const escapeXml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const createOverlaySvg = ({ eyebrow, title, subtitle }) => Buffer.from(
  `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#06111f" stop-opacity="0.92" />
        <stop offset="56%" stop-color="#06111f" stop-opacity="0.84" />
        <stop offset="100%" stop-color="#06111f" stop-opacity="0.16" />
      </linearGradient>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#fade)" />
    <rect x="52" y="48" width="540" height="534" rx="30" fill="rgba(6,17,31,0.42)" stroke="rgba(255,255,255,0.14)" />
    <rect x="84" y="88" width="220" height="48" rx="24" fill="rgba(16,185,129,0.14)" stroke="rgba(52,211,153,0.45)" />
    <circle cx="112" cy="112" r="7" fill="#F5B84B" />
    <text x="132" y="118" fill="#D1FAE5" font-family="Segoe UI, Tahoma, sans-serif" font-size="22" font-weight="700" letter-spacing="2.8">${escapeXml(eyebrow)}</text>
    <text x="84" y="210" fill="#FFFFFF" font-family="Tahoma, Segoe UI, sans-serif" font-size="66" font-weight="800">${escapeXml(title)}</text>
    <text x="84" y="274" fill="#E2E8F0" font-family="Tahoma, Segoe UI, sans-serif" font-size="30" font-weight="500">${escapeXml(subtitle)}</text>
    <text x="84" y="520" fill="#34D399" font-family="Segoe UI, Tahoma, sans-serif" font-size="34" font-weight="800">LINE @buyhub</text>
    <text x="84" y="560" fill="#FFFFFF" font-family="Tahoma, Segoe UI, sans-serif" font-size="26" font-weight="500">ประเมินฟรี • ใช้รูปสินค้าจริงประกอบหน้าเว็บ</text>
  </svg>`
);

const createPhotoOg = async ({ source, output, eyebrow, title, subtitle, position = 'center' }) => {
  const background = await sharp(source)
    .resize(WIDTH, HEIGHT, { fit: 'cover', position })
    .modulate({ brightness: 0.9, saturation: 1.05 })
    .toBuffer();

  await sharp(background)
    .composite([{ input: createOverlaySvg({ eyebrow, title, subtitle }) }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUTPUT_DIR, output));
};

const createTileBuffer = async (source) =>
  sharp(source)
    .resize(250, 250, { fit: 'cover', position: 'center' })
    .composite([
      {
        input: Buffer.from(
          `<svg width="250" height="250" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.75" y="0.75" width="248.5" height="248.5" rx="26" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>
          </svg>`
        )
      }
    ])
    .png()
    .toBuffer();

const createCollageOg = async ({ sources, output, eyebrow, title, subtitle }) => {
  const background = await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: '#07111F'
    }
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="a" cx="18%" cy="18%" r="62%">
                <stop offset="0%" stop-color="#0F766E" stop-opacity="0.28" />
                <stop offset="100%" stop-color="#0F766E" stop-opacity="0" />
              </radialGradient>
              <radialGradient id="b" cx="82%" cy="76%" r="44%">
                <stop offset="0%" stop-color="#F5B84B" stop-opacity="0.18" />
                <stop offset="100%" stop-color="#F5B84B" stop-opacity="0" />
              </radialGradient>
            </defs>
            <rect width="${WIDTH}" height="${HEIGHT}" fill="#07111F" />
            <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#a)" />
            <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#b)" />
            <rect x="52" y="48" width="540" height="534" rx="30" fill="rgba(6,17,31,0.5)" stroke="rgba(255,255,255,0.14)" />
          </svg>`
        )
      }
    ])
    .png()
    .toBuffer();

  const tileBuffers = await Promise.all(sources.map((source) => createTileBuffer(source)));
  const startX = 662;
  const startY = 62;
  const tileSize = 250;

  const composites = tileBuffers.map((input, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    return {
      input,
      left: startX + col * (tileSize + TILE_GAP),
      top: startY + row * (tileSize + TILE_GAP)
    };
  });

  composites.unshift({ input: createOverlaySvg({ eyebrow, title, subtitle }) });

  await sharp(background)
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUTPUT_DIR, output));
};

await fs.mkdir(OUTPUT_DIR, { recursive: true });

await createCollageOg({
  sources: [
    photo('public/images/buyback/buyhub-iphone-15-128gb-black.webp'),
    photo('public/images/buyback/buyhub-xiaomi-pad-7-8-128.webp'),
    photo('public/images/buyback/buyhub-macbook-air-real-box.webp'),
    photo('public/images/buyback/buyhub-asus-tuf-f16-rtx4050.webp')
  ],
  output: 'buyhub-home-share.png',
  eyebrow: 'BUYHUBTHAI.COM',
  title: 'BuyHub รับซื้อไอทีมือสอง',
  subtitle: 'ภาคอีสาน • iPhone • iPad • MacBook • Notebook'
});

await createCollageOg({
  sources: [
    photo('public/images/buyback/buyhub-xiaomi-pad-7-8-128.webp'),
    photo('public/images/buyback/buyhub-huawei-notebook-real.webp'),
    photo('public/images/buyback/buyhub-acer-notebook-real.webp'),
    photo('public/images/buyback/buyhub-asus-rog-strix-gaming-laptop.webp')
  ],
  output: 'buyhub-sell-share.png',
  eyebrow: 'SELL HUB',
  title: 'รับซื้อสินค้าไอทีมือสอง',
  subtitle: 'รวมหมวดสินค้าและรูปจริงสำหรับประเมินก่อนขาย'
});

await createCollageOg({
  sources: [
    photo('public/images/buyback/buyhub-iphone-15-128gb-black.webp'),
    photo('public/images/buyback/buyhub-macbook-air-real-box.webp'),
    photo('public/images/buyback/buyhub-xiaomi-pad-7-8-128.webp'),
    photo('public/images/buyback/buyhub-asus-rog-strix-gaming-laptop.webp')
  ],
  output: 'buyhub-portfolio-share.png',
  eyebrow: 'REAL CASES',
  title: 'ผลงานรับซื้อจริง',
  subtitle: 'ใช้รูปสินค้าจริงประกอบความน่าเชื่อถือของหน้าเว็บ'
});

await createPhotoOg({
  source: photo('public/images/buyback/buyhub-iphone-15-128gb-black.webp'),
  output: 'buyhub-reviews-share.png',
  eyebrow: 'TRUST & REVIEW',
  title: 'รีวิวลูกค้า BuyHub',
  subtitle: 'ประกอบด้วยรีวิวและหลักฐานแบบปิดข้อมูลส่วนตัว'
});

await createPhotoOg({
  source: photo('public/images/buyback/buyhub-iphone-15-128gb-black.webp'),
  output: 'buyhub-iphone-share.png',
  eyebrow: 'IPHONE',
  title: 'รับซื้อ iPhone มือสอง',
  subtitle: 'ใช้รูปสินค้าจริงช่วยให้หน้าแชร์ดูน่าเชื่อถือขึ้น'
});

await createPhotoOg({
  source: photo('public/images/buyback/buyhub-ipad-mini-starlight-box.webp'),
  output: 'buyhub-ipad-share.png',
  eyebrow: 'IPAD',
  title: 'รับซื้อ iPad มือสอง',
  subtitle: 'ประเมินฟรีตามรุ่น ความจุ และสภาพใช้งานจริง'
});

await createPhotoOg({
  source: photo('public/images/buyback/buyhub-xiaomi-pad-7-8-128.webp'),
  output: 'buyhub-tablet-share.png',
  eyebrow: 'TABLET',
  title: 'รับซื้อแท็บเล็ตมือสอง',
  subtitle: 'Android Tablet และ Xiaomi Pad ใช้รูปจริงประกอบหน้าเว็บ'
});

await createPhotoOg({
  source: photo('public/images/buyback/buyhub-macbook-air-real-box.webp'),
  output: 'buyhub-macbook-share.png',
  eyebrow: 'MACBOOK',
  title: 'รับซื้อ MacBook มือสอง',
  subtitle: 'ใช้ภาพเครื่องจริงในการแชร์และแสดงผลบนหน้าเว็บ'
});

await createPhotoOg({
  source: photo('public/images/buyback/buyhub-huawei-notebook-real.webp'),
  output: 'buyhub-notebook-share.png',
  eyebrow: 'NOTEBOOK',
  title: 'รับซื้อโน๊ตบุ๊คมือสอง',
  subtitle: 'ทั้งสายทำงานและสายเกมมิ่ง ประเมินจากรูปจริง'
});

console.log('Generated OG images in public/images/og');
