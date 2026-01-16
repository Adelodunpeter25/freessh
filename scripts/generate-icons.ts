import sharp from 'sharp'
import { mkdirSync, rmSync } from 'fs'
import { execSync } from 'child_process'
import { join } from 'path'

const sizes = [16, 32, 64, 128, 256, 512, 1024]
const inputSvg = 'src/renderer/src/assets/icon.svg'
const iconsetDir = 'build/icon.iconset'
const outputIcns = 'build/icon.icns'
const outputPng = 'build/icon.png'

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

  // Generate .ico for Windows
  await sharp(inputSvg)
    .resize(256, 256)
    .png()
    .toFile('build/icon.ico')

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
  console.log('Done!')
}

generateIcons().catch(console.error)
