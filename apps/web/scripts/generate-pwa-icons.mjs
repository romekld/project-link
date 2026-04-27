import sharp from "sharp"
import { mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const svgPath = join(root, "public", "link.svg")
const iconsDir = join(root, "public", "icons")

mkdirSync(iconsDir, { recursive: true })

const bg = { r: 255, g: 255, b: 255, alpha: 1 }

// icon-192x192.png — purpose: "any", white background, logo fills the space
await sharp(svgPath)
  .resize(192, 192, { fit: "contain", background: bg })
  .flatten({ background: bg })
  .png()
  .toFile(join(iconsDir, "icon-192x192.png"))

console.log("✓ icon-192x192.png")

// icon-512x512.png — purpose: "maskable"
// Logo is scaled to 80% of 512 (= 410px) so it sits within the safe zone,
// then padded with white to fill the 512×512 canvas.
const logoSize = Math.round(512 * 0.8) // 410
const padding = Math.floor((512 - logoSize) / 2) // 51

await sharp(svgPath)
  .resize(logoSize, logoSize, { fit: "contain", background: bg })
  .flatten({ background: bg })
  .extend({
    top: padding,
    bottom: 512 - logoSize - padding,
    left: padding,
    right: 512 - logoSize - padding,
    background: bg,
  })
  .png()
  .toFile(join(iconsDir, "icon-512x512.png"))

console.log("✓ icon-512x512.png (maskable, 80% safe zone)")
console.log(`\nDone → ${iconsDir}`)
