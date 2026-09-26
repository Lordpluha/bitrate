import fs from 'node:fs'
import path from 'node:path'
import { glob } from 'glob'
import { convertSvgToComponent, generateIndexFile } from '../core/converter.mjs'
import { processSvgFiles } from '../core/processor.mjs'
import { toPascalCase } from '../utils/naming.mjs'

/**
 * Dev режим - watch за изменениями SVG файлов
 */
export async function dev(inputDir, outputDir, options = {}) {
  console.log('🎨 [SVGR] Watching SVG files for changes...')

  // Первичная сборка
  await processSvgFiles(inputDir, outputDir, {
    clean: true,
    verbose: true,
    ...options,
  })

  const { colorVarNames = [] } = options

  // Используем встроенный fs.watch с рекурсивным режимом
  const watcher = fs.watch(
    inputDir,
    { recursive: true, persistent: true },
    async (eventType, filename) => {
      // Игнорируем не-SVG файлы
      if (!filename?.endsWith('.svg')) {
        return
      }

      const filePath = path.join(inputDir, filename)

      try {
        // Проверяем существует ли файл
        const exists = await fs.promises
          .access(filePath)
          .then(() => true)
          .catch(() => false)

        if (exists) {
          // Файл добавлен или изменен
          if (eventType === 'rename') {
            console.log(`\n📝 [SVGR] New SVG detected: ${filename}`)
          } else {
            console.log(`\n🔄 [SVGR] SVG changed: ${filename}`)
          }

          await convertSvgToComponent(filePath, outputDir, colorVarNames)

          // Обновляем index файл
          const svgFiles = await glob('**/*.svg', {
            cwd: inputDir,
            absolute: true,
          })
          const components = svgFiles.map((svgPath) => {
            const basename = path.basename(svgPath)
            const componentName = toPascalCase(basename)
            return { componentName, outputFilename: `${componentName}.tsx` }
          })
          await generateIndexFile(components, outputDir)

          console.log('✓ [SVGR] Components updated')
        } else {
          // Файл удален
          console.log(`\n🗑️  [SVGR] SVG deleted: ${filename}`)
          const componentName = toPascalCase(path.basename(filename))
          const outputPath = path.join(outputDir, `${componentName}.tsx`)

          await fs.promises.unlink(outputPath).catch(() => {})

          // Обновляем index файл
          const svgFiles = await glob('**/*.svg', {
            cwd: inputDir,
            absolute: true,
          })
          const components = svgFiles.map((svgPath) => {
            const basename = path.basename(svgPath)
            const componentName = toPascalCase(basename)
            return { componentName, outputFilename: `${componentName}.tsx` }
          })
          await generateIndexFile(components, outputDir)

          console.log('✓ [SVGR] Component removed and index updated')
        }
      } catch (error) {
        console.error('❌ [SVGR] Error processing SVG:', error.message)
      }
    },
  )

  // Обработка ошибок watcher
  watcher.on('error', (error) => {
    console.error('❌ [SVGR] Watcher error:', error)
  })

  console.log('👀 [SVGR] Watching for changes... (press Ctrl+C to stop)')
}
