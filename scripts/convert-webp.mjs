import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = 'public/images/category';
const files = fs.readdirSync(dir);

async function convert() {
  for (const file of files) {
    if (file.endsWith('.png')) {
      const inputPath = path.join(dir, file);
      const outputPath = path.join(dir, file.replace('.png', '.webp'));
      
      await sharp(inputPath)
        .webp({ quality: 80, effort: 6 })
        .toFile(outputPath);
      
      console.log(`Converted ${file} to WebP`);
      
      // Remove original png
      fs.unlinkSync(inputPath);
    }
  }
}

convert().catch(console.error);
