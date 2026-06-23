import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { processSvgFiles } from './processor.mjs'

// Biome is not available in test environment — stub it out
vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}))

const MONOCHROME_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="#000000" d="M12 2C6.48 2 2 6.48 2 12z"/>
</svg>`

const MULTICOLOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle fill="#1ed760" cx="12" cy="12" r="10"/>
  <path fill="#191414" d="M12 6v6l4 2"/>
</svg>`

let inputDir
let outputDir

beforeEach(() => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'svgr-proc-test-'))
  inputDir = path.join(base, 'input')
  outputDir = path.join(base, 'output')
  fs.mkdirSync(inputDir, { recursive: true })
})

afterEach(() => {
  const base = path.dirname(inputDir)
  fs.rmSync(base, { recursive: true, force: true })
})

describe('processSvgFiles', () => {
  it('generates a component file for each SVG', async () => {
    fs.writeFileSync(path.join(inputDir, 'arrow.svg'), MONOCHROME_SVG)
    fs.writeFileSync(path.join(inputDir, 'logo.svg'), MULTICOLOR_SVG)

    await processSvgFiles(inputDir, outputDir)

    expect(fs.existsSync(path.join(outputDir, 'Arrow.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(outputDir, 'Logo.tsx'))).toBe(true)
  })

  it('generates an index.ts with exports for all components', async () => {
    fs.writeFileSync(path.join(inputDir, 'arrow.svg'), MONOCHROME_SVG)
    fs.writeFileSync(path.join(inputDir, 'logo.svg'), MULTICOLOR_SVG)

    await processSvgFiles(inputDir, outputDir)

    const indexPath = path.join(outputDir, 'index.ts')
    expect(fs.existsSync(indexPath)).toBe(true)

    const content = fs.readFileSync(indexPath, 'utf-8')
    expect(content).toContain("export * from './Arrow'")
    expect(content).toContain("export * from './Logo'")
  })

  it('cleans the output directory before processing when clean=true', async () => {
    fs.mkdirSync(outputDir, { recursive: true })
    const staleFile = path.join(outputDir, 'Stale.tsx')
    fs.writeFileSync(staleFile, '// stale')

    fs.writeFileSync(path.join(inputDir, 'arrow.svg'), MONOCHROME_SVG)

    await processSvgFiles(inputDir, outputDir, { clean: true })

    expect(fs.existsSync(staleFile)).toBe(false)
  })

  it('keeps existing files when clean=false', async () => {
    fs.mkdirSync(outputDir, { recursive: true })
    const existingFile = path.join(outputDir, 'Existing.tsx')
    fs.writeFileSync(existingFile, '// existing')

    fs.writeFileSync(path.join(inputDir, 'arrow.svg'), MONOCHROME_SVG)

    await processSvgFiles(inputDir, outputDir, { clean: false })

    expect(fs.existsSync(existingFile)).toBe(true)
  })

  it('handles nested SVG files', async () => {
    const subDir = path.join(inputDir, 'sub')
    fs.mkdirSync(subDir)
    fs.writeFileSync(path.join(subDir, 'nested-icon.svg'), MONOCHROME_SVG)

    await processSvgFiles(inputDir, outputDir)

    expect(fs.existsSync(path.join(outputDir, 'NestedIcon.tsx'))).toBe(true)
  })

  it('passes colorVarNames to the converter', async () => {
    fs.writeFileSync(path.join(inputDir, 'logo.svg'), MULTICOLOR_SVG)

    await processSvgFiles(inputDir, outputDir, { colorVarNames: ['primaryColor', 'bgColor'] })

    const content = fs.readFileSync(path.join(outputDir, 'Logo.tsx'), 'utf-8')
    expect(content).toContain('primaryColor')
    expect(content).toContain('bgColor')
  })

  it('does not throw when the input directory has no SVG files', async () => {
    await expect(processSvgFiles(inputDir, outputDir)).resolves.not.toThrow()
  })

  it('creates the output directory if it does not exist', async () => {
    fs.writeFileSync(path.join(inputDir, 'arrow.svg'), MONOCHROME_SVG)

    await processSvgFiles(inputDir, outputDir)

    expect(fs.existsSync(outputDir)).toBe(true)
  })
})
