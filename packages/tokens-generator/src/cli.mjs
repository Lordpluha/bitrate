#!/usr/bin/env node

/**
 * CLI for Tailwind tokens generator
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { generateTokens } from './generate-tokens.mjs'

const USAGE = `
Usage: tokens-generator [options]

Options:
  --tokens <path>       Path to tokens.json file (required)
  --output <path>       Output directory for generated Tailwind CSS files (optional)
  --help, -h            Show this help message

Examples:
  # Generate Tailwind tokens
  tokens-generator --tokens ./tokens.json --output ./styles

  # Use from external package
  tokens-generator --tokens @my-scope/tokens/tokens.json --output ./src/styles
`

async function main() {
  try {
    const { values } = parseArgs({
      options: {
        tokens: { type: 'string' },
        output: { type: 'string' },
        help: { type: 'boolean', short: 'h', default: false },
      },
      allowPositionals: false,
    })

    // Show help
    if (values.help) {
      console.log(USAGE)
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

    // Generate tokens
    console.log(`🎨 Reading tokens from: ${tokensPath}\n`)
    await generateTokens({
      tokensPath,
      outputDir: values.output ? resolve(process.cwd(), values.output) : undefined,
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.stack && process.env.DEBUG) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

main()
