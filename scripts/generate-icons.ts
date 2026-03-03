import sharp from 'sharp'
import { mkdirSync, rmSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { join } from 'path'

const sizes = [16, 32, 64, 128, 256, 512, 1024]
const inputSvg = 'src/renderer/src/assets/icon.svg'
const iconsetDir = 'build/icon.iconset'
const outputIcns = 'build/icon.icns'
const outputPng = 'build/icon.png'
const outputIco = 'build/icon.ico'

function buildIcoFromPng(png: Buffer): Buffer {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(1, 4) // image count

  const entry = Buffer.alloc(16)
  entry.writeUInt8(0, 0) // width: 0 means 256
  entry.writeUInt8(0, 1) // height: 0 means 256
  entry.writeUInt8(0, 2) // color count
  entry.writeUInt8(0, 3) // reserved
  entry.writeUInt16LE(1, 4) // planes
  entry.writeUInt16LE(32, 6) // bits per pixel
  entry.writeUInt32LE(png.length, 8) // image size
  entry.writeUInt32LE(6 + 16, 12) // image offset

  return Buffer.concat([header, entry, png])
}

async function generateIcons() {
  // Clean and create iconset directory
  rmSync(iconsetDir, { recursive: true, force: true })
  mkdirSync(iconsetDir, { recursive: true })
  mkdirSync('build', { recursive: true })

  // Generate PNGs for iconset
  for (const size of sizes) {
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(join(iconsetDir, `icon_${size}x${size}.png`))

    // @2x versions for Retina
    if (size <= 512) {
      await sharp(inputSvg)
        .resize(size * 2, size * 2)
        .png()
        .toFile(join(iconsetDir, `icon_${size}x${size}@2x.png`))
    }
  }

  // Generate main icon.png for electron-builder
  await sharp(inputSvg)
    .resize(512, 512)
    .png()
    .toFile(outputPng)

  // Generate .ico for Windows (valid ICO container with PNG payload)
  const png256 = await sharp(inputSvg)
    .resize(256, 256)
    .png()
    .toBuffer()
  writeFileSync(outputIco, buildIcoFromPng(png256))

  // Generate .icns using iconutil (macOS only)
  try {
    execSync(`iconutil -c icns ${iconsetDir} -o ${outputIcns}`)
    console.log('Generated:', outputIcns)
  } catch (e) {
    console.log('iconutil failed (not on macOS?), skipping .icns generation')
  }

  // Cleanup iconset folder
  rmSync(iconsetDir, { recursive: true, force: true })

  console.log('Generated:', outputPng)
  console.log('Generated:', outputIco)
  console.log('Done!')
}

generateIcons().catch(console.error)
