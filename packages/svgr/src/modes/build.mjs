import { processSvgFiles } from '../core/processor.mjs'

/**
 * Build режим - одноразовая конвертация всех SVG
 */
export async function build(inputDir, outputDir, options = {}) {
  console.log('🎨 [SVGR] Building SVG components...')

  try {
    await processSvgFiles(inputDir, outputDir, {
      clean: true,
      verbose: true,
      ...options,
    })
  } catch (error) {
    console.error('❌ [SVGR] Build failed:', error)
    process.exit(1)
  }
}
