import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { convertSvgToComponent, generateIndexFile } from './converter.mjs'

// Uses white fill — SVGO removes the default black fill entirely, so it has
// nothing to replace with currentColor. White is non-default, so it survives.
const MONOCHROME_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="#ffffff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
</svg>`

const MULTICOLOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle fill="#1ed760" cx="12" cy="12" r="10"/>
  <path fill="#191414" d="M12 6v6l4 2"/>
</svg>`

let tmpDir

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svgr-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('convertSvgToComponent', () => {
  it('creates the output file', async () => {
    const svgPath = path.join(tmpDir, 'arrow.svg')
    fs.writeFileSync(svgPath, MONOCHROME_SVG)

    await convertSvgToComponent(svgPath, tmpDir)

    expect(fs.existsSync(path.join(tmpDir, 'Arrow.tsx'))).toBe(true)
  })

  it('returns the component name derived from the filename', async () => {
    const svgPath = path.join(tmpDir, 'my-icon.svg')
    fs.writeFileSync(svgPath, MONOCHROME_SVG)

    const result = await convertSvgToComponent(svgPath, tmpDir)

    expect(result.componentName).toBe('MyIcon')
  })

  it('returns the correct output filename', async () => {
    const svgPath = path.join(tmpDir, 'arrow.svg')
    fs.writeFileSync(svgPath, MONOCHROME_SVG)

    const result = await convertSvgToComponent(svgPath, tmpDir)

    expect(result.outputFilename).toBe('Arrow.tsx')
  })

  describe('monochrome SVG', () => {
    it('detects the icon as monochrome', async () => {
      const svgPath = path.join(tmpDir, 'icon.svg')
      fs.writeFileSync(svgPath, MONOCHROME_SVG)

      const result = await convertSvgToComponent(svgPath, tmpDir)

      expect(result.isMonochrome).toBe(true)
    })

    it('generated file contains currentColor for a monochrome icon', async () => {
      const svgPath = path.join(tmpDir, 'icon.svg')
      fs.writeFileSync(svgPath, MONOCHROME_SVG)

      await convertSvgToComponent(svgPath, tmpDir)

      const content = fs.readFileSync(path.join(tmpDir, 'Icon.tsx'), 'utf-8')
      expect(content).toContain('currentColor')
    })

    it('generated file exports a named component', async () => {
      const svgPath = path.join(tmpDir, 'icon.svg')
      fs.writeFileSync(svgPath, MONOCHROME_SVG)

      await convertSvgToComponent(svgPath, tmpDir)

      const content = fs.readFileSync(path.join(tmpDir, 'Icon.tsx'), 'utf-8')
      expect(content).toMatch(/export const Icon/)
    })
  })

  describe('multicolor SVG', () => {
    it('detects the icon as non-monochrome', async () => {
      const svgPath = path.join(tmpDir, 'logo.svg')
      fs.writeFileSync(svgPath, MULTICOLOR_SVG)

      const result = await convertSvgToComponent(svgPath, tmpDir)

      expect(result.isMonochrome).toBe(false)
    })

    it('generated file does not replace colors with currentColor', async () => {
      const svgPath = path.join(tmpDir, 'logo.svg')
      fs.writeFileSync(svgPath, MULTICOLOR_SVG)

      await convertSvgToComponent(svgPath, tmpDir)

      const content = fs.readFileSync(path.join(tmpDir, 'Logo.tsx'), 'utf-8')
      expect(content).not.toContain('currentColor')
    })

    it('injects color props when colorVarNames are provided', async () => {
      const svgPath = path.join(tmpDir, 'logo.svg')
      fs.writeFileSync(svgPath, MULTICOLOR_SVG)

      await convertSvgToComponent(svgPath, tmpDir, ['primaryColor', 'secondaryColor'])

      const content = fs.readFileSync(path.join(tmpDir, 'Logo.tsx'), 'utf-8')
      expect(content).toContain('primaryColor')
      expect(content).toContain('secondaryColor')
    })

    it('generates a Props interface when colorVarNames are provided', async () => {
      const svgPath = path.join(tmpDir, 'logo.svg')
      fs.writeFileSync(svgPath, MULTICOLOR_SVG)

      await convertSvgToComponent(svgPath, tmpDir, ['primaryColor', 'secondaryColor'])

      const content = fs.readFileSync(path.join(tmpDir, 'Logo.tsx'), 'utf-8')
      expect(content).toMatch(/interface LogoProps/)
    })

    it('uses color values as default prop values', async () => {
      const svgPath = path.join(tmpDir, 'logo.svg')
      fs.writeFileSync(svgPath, MULTICOLOR_SVG)

      await convertSvgToComponent(svgPath, tmpDir, ['primaryColor', 'secondaryColor'])

      const content = fs.readFileSync(path.join(tmpDir, 'Logo.tsx'), 'utf-8')
      // Default value should be the hex color from the SVG
      expect(content).toMatch(/primaryColor\s*=\s*"#[0-9a-f]{6}"/)
    })
  })

  describe('JSX attribute normalization', () => {
    it('replaces stroke-width with strokeWidth', async () => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path stroke="#000000" stroke-width="2" d="M12 2z"/>
      </svg>`
      const svgPath = path.join(tmpDir, 'stroke.svg')
      fs.writeFileSync(svgPath, svg)

      await convertSvgToComponent(svgPath, tmpDir)

      const content = fs.readFileSync(path.join(tmpDir, 'Stroke.tsx'), 'utf-8')
      expect(content).not.toContain('stroke-width=')
      expect(content).toContain('strokeWidth=')
    })

    it('replaces fill-rule with fillRule', async () => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path fill="#000000" fill-rule="evenodd" d="M12 2z"/>
      </svg>`
      const svgPath = path.join(tmpDir, 'fillrule.svg')
      fs.writeFileSync(svgPath, svg)

      await convertSvgToComponent(svgPath, tmpDir)

      const content = fs.readFileSync(path.join(tmpDir, 'Fillrule.tsx'), 'utf-8')
      expect(content).not.toContain('fill-rule=')
    })
  })

  it('throws when the SVG file does not exist', async () => {
    await expect(
      convertSvgToComponent(path.join(tmpDir, 'nonexistent.svg'), tmpDir),
    ).rejects.toThrow()
  })
})

describe('generateIndexFile', () => {
  it('creates an index.ts file', async () => {
    const components = [{ outputFilename: 'Arrow.tsx' }, { outputFilename: 'Logo.tsx' }]

    await generateIndexFile(components, tmpDir)

    expect(fs.existsSync(path.join(tmpDir, 'index.ts'))).toBe(true)
  })

  it('exports each component by module path', async () => {
    const components = [{ outputFilename: 'Arrow.tsx' }, { outputFilename: 'Logo.tsx' }]

    await generateIndexFile(components, tmpDir)

    const content = fs.readFileSync(path.join(tmpDir, 'index.ts'), 'utf-8')
    expect(content).toContain("export * from './Arrow'")
    expect(content).toContain("export * from './Logo'")
  })

  it('strips .tsx extension from the module path', async () => {
    await generateIndexFile([{ outputFilename: 'Icon.tsx' }], tmpDir)

    const content = fs.readFileSync(path.join(tmpDir, 'index.ts'), 'utf-8')
    expect(content).not.toContain('.tsx')
  })

  it('ends the file with a newline', async () => {
    await generateIndexFile([{ outputFilename: 'Icon.tsx' }], tmpDir)

    const content = fs.readFileSync(path.join(tmpDir, 'index.ts'), 'utf-8')
    expect(content.endsWith('\n')).toBe(true)
  })

  it('generates an empty file for an empty component list', async () => {
    await generateIndexFile([], tmpDir)

    const content = fs.readFileSync(path.join(tmpDir, 'index.ts'), 'utf-8')
    expect(content.trim()).toBe('')
  })
})
