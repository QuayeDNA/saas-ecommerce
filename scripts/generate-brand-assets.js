import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "../public");
const assetsDir = path.join(__dirname, "../src/assets");
const seoSource = path.join(assetsDir, "asset-og.jpeg");
const iconSource = path.join(assetsDir, "asset.png");

const staleAssets = [
  "favicon.ico",
  "favicon.svg",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "apple-touch-icon.png",
  "mstile-150x150.png",
  "logo-192.png",
  "logo-512.png",
  "logo-192.svg",
  "logo-512.svg",
  "og-image.png",
  "twitter-image.png",
];

const iconTargets = [
  { name: "favicon-16x16.png", width: 16, height: 16 },
  { name: "favicon-32x32.png", width: 32, height: 32 },
  { name: "apple-touch-icon.png", width: 180, height: 180 },
  { name: "mstile-150x150.png", width: 150, height: 150 },
  { name: "android-chrome-192x192.png", width: 192, height: 192 },
  { name: "android-chrome-512x512.png", width: 512, height: 512 },
  { name: "logo-192.png", width: 192, height: 192 },
  { name: "logo-512.png", width: 512, height: 512 },
];

const svgLogoTargets = [
  { name: "logo-192.svg", width: 192, height: 192 },
  { name: "logo-512.svg", width: 512, height: 512 },
];

const seoTargets = [
  { name: "og-image.png", width: 1200, height: 630 },
  { name: "twitter-image.png", width: 1200, height: 628 },
];

async function removeOldAssets() {
  await Promise.all(
    staleAssets.map(async (fileName) => {
      const filePath = path.join(publicDir, fileName);
      try {
        await fs.unlink(filePath);
        console.log(`Removed old asset: ${fileName}`);
      } catch {
        // ignore if it doesn't exist
      }
    }),
  );
}

async function renderAsset(source, target) {
  const sourcePath = path.resolve(source);
  const outputPath = path.join(publicDir, target.name);
  const exists = await fs
    .stat(sourcePath)
    .then(() => true)
    .catch(() => false);

  if (!exists) {
    throw new Error(`Source asset not found: ${sourcePath}`);
  }

  await sharp(sourcePath)
    .resize({
      width: target.width,
      height: target.height,
      fit: target.name.startsWith("og-") ? "cover" : "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ quality: 90 })
    .toFile(outputPath);

  console.log(`Generated ${target.name} from ${path.basename(source)}`);
}

async function renderFaviconSvg(source) {
  const sourcePath = path.resolve(source);
  const outputPath = path.join(publicDir, "favicon.svg");
  const exists = await fs
    .stat(sourcePath)
    .then(() => true)
    .catch(() => false);

  if (!exists) {
    throw new Error(`Source asset not found: ${sourcePath}`);
  }

  const pngBuffer = await sharp(sourcePath)
    .resize({
      width: 32,
      height: 32,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const base64 = pngBuffer.toString("base64");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">\n  <image href="data:image/png;base64,${base64}" width="32" height="32" />\n</svg>`;

  await fs.writeFile(outputPath, svg, "utf8");
  console.log("Generated favicon.svg from icon source");
}

async function renderSvgLogo(source, target) {
  const sourcePath = path.resolve(source);
  const outputPath = path.join(publicDir, target.name);
  const exists = await fs
    .stat(sourcePath)
    .then(() => true)
    .catch(() => false);

  if (!exists) {
    throw new Error(`Source asset not found: ${sourcePath}`);
  }

  const pngBuffer = await sharp(sourcePath)
    .resize({
      width: target.width,
      height: target.height,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const base64 = pngBuffer.toString("base64");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${target.width}" height="${target.height}" viewBox="0 0 ${target.width} ${target.height}">\n  <image href="data:image/png;base64,${base64}" width="${target.width}" height="${target.height}" />\n</svg>`;

  await fs.writeFile(outputPath, svg, "utf8");
  console.log(`Generated ${target.name} from ${path.basename(source)}`);
}

async function renderFaviconIco(source) {
  const sourcePath = path.resolve(source);
  const outputPath = path.join(publicDir, "favicon.ico");
  const tempPath = path.join(publicDir, "favicon-temp.png");
  const exists = await fs
    .stat(sourcePath)
    .then(() => true)
    .catch(() => false);

  if (!exists) {
    throw new Error(`Source asset not found: ${sourcePath}`);
  }

  await sharp(sourcePath)
    .resize({
      width: 32,
      height: 32,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ quality: 90 })
    .toFile(tempPath);

  const icoBuffer = await pngToIco(tempPath);
  await fs.writeFile(outputPath, icoBuffer);
  await fs.unlink(tempPath);

  console.log("Generated favicon.ico from icon source");
}

async function generateAssets() {
  await fs.mkdir(publicDir, { recursive: true });
  await removeOldAssets();

  await Promise.all(seoTargets.map((target) => renderAsset(seoSource, target)));
  await Promise.all(
    iconTargets.map((target) => renderAsset(iconSource, target)),
  );
  await Promise.all(
    svgLogoTargets.map((target) => renderSvgLogo(iconSource, target)),
  );
  await Promise.all([
    renderFaviconSvg(iconSource),
    renderFaviconIco(iconSource),
  ]);

  console.log("Brand asset generation complete.");
}

generateAssets().catch((error) => {
  console.error("Asset generation failed:", error);
  process.exit(1);
});
