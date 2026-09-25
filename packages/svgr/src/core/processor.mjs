import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { glob } from 'glob'
import { convertSvgToComponent, generateIndexFile } from './converter.mjs'

const CACHE_FILE = '.svgr-cache.json'

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
 * Хеш источника: содержимое каждого SVG плюс имена цветовых переменных, которые тоже
 * влияют на сгенерированный код. Пути сортируются, чтобы хеш не зависел от порядка,
 * в котором glob обошёл файловую систему.
 */
async function hashSource(svgFiles, colorVarNames) {
  const hash = createHash('sha256')
  for (const filePath of [...svgFiles].sort()) {
    hash.update(filePath)
    hash.update(await fs.promises.readFile(filePath))
  }
  hash.update(JSON.stringify([...colorVarNames].sort()))
  return hash.digest('hex')
}

async function readCachedHash(outputDir) {
  try {
    const raw = await fs.promises.readFile(path.join(outputDir, CACHE_FILE), 'utf-8')
    return JSON.parse(raw).hash
  } catch (_error) {
    return null
  }
}

async function writeCachedHash(outputDir, hash) {
  const payload = { hash, generatedAt: new Date().toISOString() }
  await fs.promises.writeFile(
    path.join(outputDir, CACHE_FILE),
    `${JSON.stringify(payload, null, 2)}\n`,
    'utf-8',
  )
}

/**
 * Обрабатывает все SVG файлы из указанной директории
 */
export async function processSvgFiles(inputDir, outputDir, options = {}) {
  const { clean = true, verbose = false, colorVarNames = [] } = options

  // Поиск всех SVG файлов — до кэш-проверки и до очистки, иначе нечего было бы хешировать
  // и нечего было бы оставить нетронутым при попадании в кэш.
  const svgFiles = await glob('**/*.svg', {
    cwd: inputDir,
    absolute: true,
  })

  if (svgFiles.length === 0) {
    console.log(`⚠️  No SVG files found in ${inputDir}`)
    return
  }

  const sourceHash = await hashSource(svgFiles, colorVarNames)
  const cachedHash = await readCachedHash(outputDir)

  if (cachedHash === sourceHash) {
    if (verbose) {
      console.log(`⚡ Icons unchanged (${sourceHash.slice(0, 8)}) — skipping regeneration`)
    }
    return
  }

  if (clean) {
    await cleanOutputDir(outputDir)
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

  // Committed source, so it has to read like source: this only runs on an actual SVG
  // change now (the cache hit above skips it otherwise), not on every build.
  if (verbose) {
    console.log('🔧 Formatting generated files with Biome...')
  }
  try {
    // execFileSync, not execSync: the output directory is resolved from workspace
    // configuration and reaches this call as a path. Interpolated into a shell string it
    // would be one quote away from running whatever the rest of that path said; passed as
    // its own argument it is never parsed by a shell at all.
    execFileSync('pnpm', ['exec', 'biome', 'check', '--write', outputDir], {
      stdio: verbose ? 'inherit' : 'pipe',
    })
  } catch (_error) {
    console.warn('⚠️  Biome formatting failed, files may need manual formatting')
  }

  await writeCachedHash(outputDir, sourceHash)

  console.log(`✅ Generated ${components.length} components in ${outputDir}`)
}
