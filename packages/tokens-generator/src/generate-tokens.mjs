#!/usr/bin/env node

/**
 * Tailwind CSS tokens generator
 * Auto-detects all tokens from tokens.json — no manual registration needed.
 * Just add keys to tokens.json and re-run.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'

import { cssBuilder } from './css-builder.mjs'
import { generateLayout } from './generators/layout.mjs'
import { generatePalette } from './generators/palette.mjs'
import { generateThemes } from './generators/themes.mjs'
import { generateTypography } from './generators/typography.mjs'

const FILES = [
  {
    filename: 'palette.css',
    title: 'Base Color Palette',
    description: 'These are the raw colors without semantic meaning. Use theme tokens for actual implementation.',
    generate: (tokens) => generatePalette(tokens),
  },
  {
    filename: 'layout.css',
    title: 'Layout System',
    description: 'Spacing, sizing, borders, shadows, and layout utilities',
    generate: (tokens) => generateLayout(tokens),
  },
  {
    filename: 'typography.css',
    title: 'Typography System',
    description: 'Font families, sizes, weights, line heights, and letter spacing',
    generate: (tokens) => generateTypography(tokens),
  },
  {
    filename: 'themes.css',
    generate: (tokens) => generateThemes(tokens),
    isRaw: true,
  },
]

/**
 * Main generation function - can be used as module export
 * @param {Object} config - Configuration object
 */
export async function generateTokens(config) {
  const options = config ?? {}

  const rawTokensPath = options.tokensPath ?? options.paths?.tokens
  if (!rawTokensPath) throw new Error('tokensPath is required')

  const rawOutputDir = options.outputDir ?? options.output ?? options.paths?.output ?? './styles'

  const tokensPath = isAbsolute(rawTokensPath)
    ? rawTokensPath
    : resolve(process.cwd(), rawTokensPath)

  const outputDir = isAbsolute(rawOutputDir)
    ? rawOutputDir
    : resolve(process.cwd(), rawOutputDir)

  const tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'))

  console.log('🎨 Generating CSS files from tokens...\n')
  mkdirSync(outputDir, { recursive: true })

  for (const file of FILES) {
    const raw = file.generate(tokens)

    const content = file.isRaw
      ? raw
      : cssBuilder.build([cssBuilder.header(file.title, file.description), raw, cssBuilder.close()])

    writeFileSync(join(outputDir, file.filename), content, 'utf-8')
    console.log(`✅ Generated ${file.filename}`)
  }

  console.log(`\n✨ All CSS files generated successfully in ${outputDir}`)
}
