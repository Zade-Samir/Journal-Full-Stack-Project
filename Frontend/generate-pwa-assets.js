import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputSvg = path.join(__dirname, 'public', 'favicon.svg');

async function generateAssets() {
  console.log('Generating PWA assets from favicon.svg...');
  try {
    // 1. Generate 192x192 PNG
    await sharp(inputSvg)
      .resize(192, 192)
      .png()
      .toFile(path.join(__dirname, 'public', 'pwa-192x192.png'));
    console.log('✔ Generated public/pwa-192x192.png');

    // 2. Generate 512x512 PNG
    await sharp(inputSvg)
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, 'public', 'pwa-512x512.png'));
    console.log('✔ Generated public/pwa-512x512.png');

    // 3. Generate Apple Touch Icon (180x180)
    await sharp(inputSvg)
      .resize(180, 180)
      .png()
      .toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));
    console.log('✔ Generated public/apple-touch-icon.png');

    // 4. Generate Maskable Icon (512x512 with 384x384 resized logo inside and #0f172a background)
    await sharp(inputSvg)
      .resize(384, 384)
      .extend({
        top: 64,
        bottom: 64,
        left: 64,
        right: 64,
        background: { r: 15, g: 23, b: 42, alpha: 1 } // #0f172a (Slate 900)
      })
      .png()
      .toFile(path.join(__dirname, 'public', 'maskable-icon.png'));
    console.log('✔ Generated public/maskable-icon.png');

    console.log('All PWA assets generated successfully!');
  } catch (error) {
    console.error('Error generating assets:', error);
    process.exit(1);
  }
}

generateAssets();
