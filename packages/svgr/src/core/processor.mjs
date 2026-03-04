import { execSync } from 'node:child_process'
import fs from 'node:fs'
import { glob } from 'glob'
import { convertSvgToComponent, generateIndexFile } from './converter.mjs'

/**
 * Очищает выходную директорию
 */
async function cleanOutputDir(outputDir) {
  try {
    await fs.promises.rm(outputDir, { recursive: true, force: true })
  } catch (_error) {
    // Директория может не существовать
  }
}

/**
 * Обрабатывает все SVG файлы из указанной директории
 */
export async function processSvgFiles(inputDir, outputDir, options = {}) {
  const { clean = true, verbose = false, colorVarNames = [] } = options

  // Очистка выходной директории
  if (clean) {
    await cleanOutputDir(outputDir)
  }

  // Поиск всех SVG файлов
  const svgFiles = await glob('**/*.svg', {
    cwd: inputDir,
    absolute: true,
  })

  if (svgFiles.length === 0) {
    console.log(`⚠️  No SVG files found in ${inputDir}`)
    return
  }

  if (verbose) {
    console.log(`📦 Found ${svgFiles.length} SVG files`)
    if (colorVarNames.length > 0) {
      console.log(`🎨 Color variables: ${colorVarNames.join(', ')}`)
    }
  }

  // Конвертация всех SVG файлов
  const components = []
  for (const svgPath of svgFiles) {
    const component = await convertSvgToComponent(svgPath, outputDir, colorVarNames)
    components.push(component)

    if (verbose) {
      const colorType = component.isMonochrome ? 'monochrome' : 'multicolor'
      console.log(`✓ ${component.componentName} (${colorType})`)
    }
  }

  // Генерация index файла
  await generateIndexFile(components, outputDir)

  // Автоматическое форматирование сгенерированных файлов
  if (verbose) {
    console.log('🔧 Formatting generated files with Biome...')
  }
  try {
    execSync(`pnpm exec biome check --write "${outputDir}"`, {
      stdio: verbose ? 'inherit' : 'pipe',
    })
  } catch (_error) {
    console.warn('⚠️  Biome formatting failed, files may need manual formatting')
  }

  console.log(`✅ Generated ${components.length} components in ${outputDir}`)
}
