const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [192, 512];
const publicDir = path.join(__dirname, '..', 'public');

// Create a simple icon with the app's gradient colors
async function generateIcon(size) {
  // Create SVG with gradient background and toilet emoji
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1"/>
          <stop offset="50%" style="stop-color:#8b5cf6"/>
          <stop offset="100%" style="stop-color:#3b82f6"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#bg)"/>
      <text x="50%" y="58%" font-size="${size * 0.5}" text-anchor="middle" dominant-baseline="middle">🚽</text>
    </svg>
  `;

  const outputPath = path.join(publicDir, `pwa-${size}x${size}.png`);
  
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outputPath);
  
  console.log(`Generated ${outputPath}`);
}

async function main() {
  for (const size of sizes) {
    await generateIcon(size);
  }
  console.log('PWA icons generated successfully!');
}

main().catch(console.error);
