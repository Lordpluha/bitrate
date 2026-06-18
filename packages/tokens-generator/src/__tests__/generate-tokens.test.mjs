import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { generateTokens } from '../generate-tokens.mjs'

// Minimal but representative tokens fixture
const FIXTURE_TOKENS = {
  palette: {
    green: {
      '50': '#f0fdf4',
      '100': '#dcfce7',
      '200': '#bbf7d0',
      '300': '#86efac',
      '400': '#4ade80',
      '500': '#1DB954',
      '600': '#16a34a',
      '700': '#15803d',
      '800': '#166534',
      '900': '#14532d',
    },
    pure: {
      white: '#ffffff',
      black: '#000000',
    },
  },
  spacing: {
    '0': '0',
    px: '1px',
    '4': '1rem',
    '2.5': '0.625rem',
  },
  'border-radius': {
    none: '0',
    sm: '0.25rem',
    full: '9999px',
  },
  'z-index': {
    base: 0,
    modal: 50,
  },
  breakpoints: {
    sm: 640,
    md: 768,
  },
  typography: {
    'font-family': {
      sans: 'Inter, system-ui, sans-serif',
    },
    'font-size': {
      sm: '0.875rem',
      base: '1rem',
      xl: '1.25rem',
    },
    'font-weight': {
      normal: 400,
      bold: 700,
    },
    'line-height': {
      tight: 1.25,
      normal: 1.5,
    },
    'letter-spacing': {
      tight: '-0.025em',
      normal: '0em',
    },
    semantic: {
      h1: { size: '2.25rem', weight: '700', 'line-height': '1.1', 'letter-spacing': '-0.025em' },
      body: { size: '1rem', weight: '400', 'line-height': '1.5', 'letter-spacing': '0em' },
    },
  },
  themes: {
    dark: {
      background: 'var(--color-black)',
      'background-elevated': '#121212',
      text: 'var(--color-white)',
      primary: 'var(--color-green-500)',
    },
    light: {
      background: 'var(--color-white)',
      'background-elevated': '#f9fafb',
      text: 'var(--color-black)',
      primary: 'var(--color-green-500)',
    },
  },
}

let tmpDir
let tokensPath
let outputDir

function readOutput(filename) {
  return readFileSync(join(outputDir, filename), 'utf-8')
}

describe('generateTokens — integration', () => {
  before(() => {
    tmpDir = join(tmpdir(), `tokens-generator-test-${Date.now()}`)
    mkdirSync(tmpDir, { recursive: true })
    tokensPath = join(tmpDir, 'tokens.json')
    outputDir = join(tmpDir, 'styles')
    writeFileSync(tokensPath, JSON.stringify(FIXTURE_TOKENS), 'utf-8')
  })

  after(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  it('throws when tokensPath is not provided', async () => {
    await assert.rejects(() => generateTokens({}), /tokensPath is required/)
  })

  it('throws when config is null/undefined', async () => {
    await assert.rejects(() => generateTokens(null), /tokensPath is required/)
  })

  it('generates all four CSS files', async () => {
    await generateTokens({ tokensPath, outputDir })

    for (const file of ['palette.css', 'layout.css', 'typography.css', 'themes.css']) {
      const content = readOutput(file)
      assert.ok(content.length > 0, `${file} should not be empty`)
    }
  })

  describe('palette.css', () => {
    it('wraps output in @theme block', () => {
      const css = readOutput('palette.css')
      assert.ok(css.includes('@theme {'))
      assert.ok(css.endsWith('}'))
    })

    it('contains color scale variables for green', () => {
      const css = readOutput('palette.css')
      assert.ok(css.includes('--color-green-500: #1DB954;'))
      assert.ok(css.includes('--color-green-50: #f0fdf4;'))
      assert.ok(css.includes('--color-green-900: #14532d;'))
    })

    it('emits pure colors without scale prefix', () => {
      const css = readOutput('palette.css')
      assert.ok(css.includes('--color-white: #ffffff;'))
      assert.ok(css.includes('--color-black: #000000;'))
      assert.ok(!css.includes('--color-pure-'))
    })

    it('includes section comments', () => {
      const css = readOutput('palette.css')
      assert.ok(css.includes('/* green */'))
      assert.ok(css.includes('/* pure */'))
    })
  })

  describe('layout.css', () => {
    it('wraps output in @theme block', () => {
      const css = readOutput('layout.css')
      assert.ok(css.includes('@theme {'))
      assert.ok(css.endsWith('}'))
    })

    it('generates spacing variables with px comments', () => {
      const css = readOutput('layout.css')
      assert.ok(css.includes('--spacing-0: 0;'))
      assert.ok(css.includes('--spacing-px: 1px;'))
      assert.ok(css.includes('--spacing-4: 1rem;') && css.includes('/* 16px */'))
      assert.ok(css.includes('--spacing-2_5: 0.625rem;') && css.includes('/* 10px */'))
    })

    it('generates border-radius with radius prefix', () => {
      const css = readOutput('layout.css')
      assert.ok(css.includes('--radius-none: 0;'))
      assert.ok(css.includes('--radius-sm: 0.25rem;') && css.includes('/* 4px */'))
      assert.ok(css.includes('--radius-full: 9999px;'))
    })

    it('generates z-index with z prefix', () => {
      const css = readOutput('layout.css')
      assert.ok(css.includes('--z-base: 0;'))
      assert.ok(css.includes('--z-modal: 50;'))
    })

    it('generates breakpoints with px appended', () => {
      const css = readOutput('layout.css')
      assert.ok(css.includes('--breakpoint-sm: 640px;'))
      assert.ok(css.includes('--breakpoint-md: 768px;'))
    })

    it('does not include palette, typography or themes keys', () => {
      const css = readOutput('layout.css')
      assert.ok(!css.includes('--palette-'))
      assert.ok(!css.includes('--typography-'))
      assert.ok(!css.includes('--themes-'))
    })
  })

  describe('typography.css', () => {
    it('wraps output in @theme block', () => {
      const css = readOutput('typography.css')
      assert.ok(css.includes('@theme {'))
      assert.ok(css.endsWith('}'))
    })

    it('generates font-family variables with font prefix', () => {
      const css = readOutput('typography.css')
      assert.ok(css.includes('--font-sans: Inter, system-ui, sans-serif;'))
    })

    it('generates font-size variables with text prefix and px comments', () => {
      const css = readOutput('typography.css')
      assert.ok(css.includes('--text-sm: 0.875rem;') && css.includes('/* 14px */'))
      assert.ok(css.includes('--text-base: 1rem;') && css.includes('/* 16px */'))
      assert.ok(css.includes('--text-xl: 1.25rem;') && css.includes('/* 20px */'))
    })

    it('generates line-height with leading prefix', () => {
      const css = readOutput('typography.css')
      assert.ok(css.includes('--leading-tight: 1.25;'))
      assert.ok(css.includes('--leading-normal: 1.5;'))
    })

    it('generates letter-spacing with tracking prefix', () => {
      const css = readOutput('typography.css')
      assert.ok(css.includes('--tracking-tight: -0.025em;'))
    })

    it('generates semantic typography tokens as --typography-{element}-{prop}', () => {
      const css = readOutput('typography.css')
      assert.ok(css.includes('--typography-h1-size: 2.25rem;'))
      assert.ok(css.includes('--typography-h1-weight: 700;'))
      assert.ok(css.includes('--typography-body-size: 1rem;'))
    })

    it('emits Semantic Typography Tokens section header', () => {
      const css = readOutput('typography.css')
      assert.ok(css.includes('/* Semantic Typography Tokens */'))
    })
  })

  describe('themes.css', () => {
    it('starts with @import statements for all base CSS files', () => {
      const css = readOutput('themes.css')
      assert.ok(css.includes('@import "./palette.css";'))
      assert.ok(css.includes('@import "./typography.css";'))
      assert.ok(css.includes('@import "./layout.css";'))
    })

    it('first theme (dark) uses @theme selector as default', () => {
      const css = readOutput('themes.css')
      assert.ok(css.includes('@theme {'))
      assert.ok(css.includes('* Dark Theme (Default)'))
    })

    it('second theme (light) uses :root.light selector', () => {
      const css = readOutput('themes.css')
      assert.ok(css.includes(':root.light {'))
      assert.ok(css.includes('* Light Theme'))
    })

    it('generates @custom-variant for the non-default theme', () => {
      const css = readOutput('themes.css')
      assert.ok(css.includes('@custom-variant light (&:is(.light *));'))
      assert.ok(!css.includes('@custom-variant dark'))
    })

    it('emits theme color variables as --color-{key}', () => {
      const css = readOutput('themes.css')
      assert.ok(css.includes('--color-background: var(--color-black);'))
      assert.ok(css.includes('--color-text: var(--color-white);'))
      assert.ok(css.includes('--color-primary: var(--color-green-500);'))
    })

    it('emits Semantic Theme Tokens header comment', () => {
      const css = readOutput('themes.css')
      assert.ok(css.includes('* Semantic Theme Tokens'))
    })
  })

  describe('path resolution', () => {
    it('supports paths.tokens / paths.output config shape', async () => {
      const altOutput = join(tmpDir, 'styles-alt')
      await generateTokens({ paths: { tokens: tokensPath, output: altOutput } })
      const css = readOutput.bind(null)
      const content = readFileSync(join(altOutput, 'palette.css'), 'utf-8')
      assert.ok(content.includes('--color-green-500'))
    })

    it('supports legacy output / outputDir aliases', async () => {
      const altOutput = join(tmpDir, 'styles-legacy')
      await generateTokens({ tokensPath, output: altOutput })
      const content = readFileSync(join(altOutput, 'palette.css'), 'utf-8')
      assert.ok(content.includes('--color-white'))
    })
  })
})
