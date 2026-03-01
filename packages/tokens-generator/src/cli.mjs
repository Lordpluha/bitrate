#!/usr/bin/env node

/**
 * CLI for Design Tokens Generator
 * Supports custom tokens and configuration
 */

import { existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'
import defaultConfig from './generate-tokens.config.mjs'
import { generateTokens } from './generate-tokens.mjs'

const USAGE = `
Usage: tokens-generator [options]

Options:
  --tokens <path>       Path to tokens.json file (required)
  --config <path>       Path to config file (optional, uses default if not provided)
  --output <path>       Output directory for generated CSS files (optional)
  --init                Generate a default config file
  --help, -h            Show this help message

Examples:
  # Generate with custom tokens
  tokens-generator --tokens ./tokens.json --output ./styles

  # Generate with custom tokens and config
  tokens-generator --tokens ./tokens.json --config ./tokens.config.mjs

  # Initialize config file
  tokens-generator --init

  # Use from external package
  tokens-generator --tokens @my-scope/tokens/tokens.json --output ./src/styles
`

const DEFAULT_CONFIG_TEMPLATE = `/**
 * Token Generator Configuration
 * Customize how tokens are transformed into CSS
 */

export default {
  // Output path (can be overridden via CLI)
  paths: {
    output: './src/styles',
  },

  // Color palette configuration
  palette: {
    scales: [
      { name: 'Primary', key: 'primary' },
      { name: 'Neutral', key: 'neutral' },
    ],
    pureColors: ['white', 'black'],
  },

  // Layout sections
  layout: {
    sections: [
      {
        name: 'Spacing',
        tokenKey: 'spacing',
        prefix: 'spacing',
      },
      {
        name: 'Border Radius',
        tokenKey: 'border-radius',
        prefix: 'radius',
      },
    ],
  },

  // Typography sections
  typography: {
    sections: [
      {
        name: 'Font Families',
        tokenKey: 'font-family',
        prefix: 'font',
      },
      {
        name: 'Font Sizes',
        tokenKey: 'font-size',
        prefix: 'text',
      },
    ],
    semantic: {
      enabled: true,
      prefix: 'typography',
      transformKey: 'none',
    },
  },

  // Theme configuration
  themes: {
    imports: [
      './palette.css',
      './typography.css',
      './layout.css',
    ],
    groups: {
      'Background': ['background', 'background-elevated'],
      'Text': ['text', 'text-secondary'],
      'Primary': ['primary', 'primary-hover'],
    },
    prefix: 'color',
  },

  // Files to generate
  files: {
    'palette.css': {
      header: {
        title: 'Color Palette',
        description: 'Base color tokens',
      },
      generator: 'palette',
    },
    'layout.css': {
      header: {
        title: 'Layout System',
        description: 'Spacing and layout tokens',
      },
      generator: 'layout',
    },
    'typography.css': {
      header: {
        title: 'Typography',
        description: 'Font tokens',
      },
      generator: 'typography',
    },
    'themes.css': {
      generator: 'themes',
    },
  },
};
`

async function main() {
  try {
    const { values, positionals } = parseArgs({
      options: {
        tokens: { type: 'string' },
        config: { type: 'string' },
        output: { type: 'string' },
        init: { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
      allowPositionals: true,
    })

    // Show help
    if (values.help) {
      console.log(USAGE)
      process.exit(0)
    }

    // Initialize config
    if (values.init) {
      const configPath = resolve(process.cwd(), 'tokens.config.mjs')
      if (existsSync(configPath)) {
        console.error(`❌ Config file already exists: ${configPath}`)
        process.exit(1)
      }
      writeFileSync(configPath, DEFAULT_CONFIG_TEMPLATE, 'utf-8')
      console.log(`✅ Created config file: ${configPath}`)
      console.log('\nEdit this file to customize token generation.')
      process.exit(0)
    }

    // Validate required arguments
    if (!values.tokens) {
      console.error('❌ Error: --tokens argument is required\n')
      console.log(USAGE)
      process.exit(1)
    }

    // Resolve paths
    const tokensPath = resolve(process.cwd(), values.tokens)

    if (!existsSync(tokensPath)) {
      console.error(`❌ Tokens file not found: ${tokensPath}`)
      process.exit(1)
    }

    // Load config
    let config = { ...defaultConfig }
    if (values.config) {
      const configPath = resolve(process.cwd(), values.config)
      if (!existsSync(configPath)) {
        console.error(`❌ Config file not found: ${configPath}`)
        process.exit(1)
      }
      const imported = await import(`file://${configPath}`)
      config = imported.default
      console.log(`📝 Using config from: ${configPath}`)
    } else {
      console.log('📝 Using default configuration')
    }

    // Override output path if provided
    if (values.output) {
      config.paths = {
        ...config.paths,
        output: values.output,
      }
    }

    // Set tokens path
    config.paths.tokens = tokensPath

    // Generate tokens
    console.log(`🎨 Reading tokens from: ${tokensPath}\n`)
    await generateTokens(config)
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.stack && process.env.DEBUG) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

main()
