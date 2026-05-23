import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const brainDir = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\a01082e9-142d-456e-9a7f-58854556d7eb';
const destDir = 'c:\\Users\\User\\Desktop\\project ทั้งหมด\\buyhubthai\\public\\images\\buyback';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// 4 JPG files in brain directory:
// media__1779529088291.jpg (ASUS 2026 laptop)
// media__1779529088296.jpg (Xiaomi Pad)
// media__1779529088308.jpg (ASUS Vivobook OLED)
// media__1779529088314.jpg (iPhone or Samsung - we can inspect/use it for iPhone 15 or premium smartphone)

const imageMapping = {
  'media__1779529088291.jpg': 'buyhub-notebook-asus-2026.webp',
  'media__1779529088296.jpg': 'buyhub-xiaomi-pad-tablet.webp',
  'media__1779529088308.jpg': 'buyhub-notebook-asus-vivobook-oled.webp',
  'media__1779529088314.jpg': 'buyhub-iphone-15-used-box.webp'
};

console.log('Starting image conversion using sharp...');

for (const [srcFile, destFile] of Object.entries(imageMapping)) {
  const srcPath = path.join(brainDir, srcFile);
  const destPath = path.join(destDir, destFile);

  if (fs.existsSync(srcPath)) {
    console.log(`Converting ${srcFile} to ${destFile}...`);
    await sharp(srcPath)
      .webp({ quality: 85 })
      .toFile(destPath);
    console.log(`Saved to ${destPath}`);
  } else {
    console.warn(`Source file not found: ${srcPath}`);
  }
}

console.log('Conversion complete!');
