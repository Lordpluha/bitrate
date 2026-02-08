#!/usr/bin/env node

/**
 * CLI for React ESBuild Bundler
 * Supports build and dev modes
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const USAGE = `
Usage: react-bundler [command] [options]

Commands:
  build                 Build the package for production
  dev                   Start development mode with watch
  help, -h, --help      Show this help message

Options:
  --cwd <path>          Working directory (default: current directory)
  --entry <pattern>     Entry points glob pattern (default: src/**/*.{ts,tsx})
  --ignore <patterns>   Comma-separated patterns to ignore (default: **/*.test.*,**/*.stories.*,**/__tests__/**)
  --outdir <path>       Output directory (default: dist)
  --css-input <path>    CSS input file for Tailwind (default: ./src/styles/index.css)
  --css-output <path>   CSS output file (default: ./dist/globals.css)

Examples:
  # Build for production
  react-bundler build

  # Start development mode
  react-bundler dev

  # Build with custom working directory
  react-bundler build --cwd ./packages/ui-react

  # Build with custom entry pattern
  react-bundler build --entry "lib/**/*.ts"
`;

async function main() {
  try {
    const { values, positionals } = parseArgs({
      args: process.argv.slice(2),
      options: {
        help: { type: 'boolean', short: 'h' },
        cwd: { type: 'string' },
        entry: { type: 'string' },
        ignore: { type: 'string' },
        outdir: { type: 'string' },
        'css-input': { type: 'string' },
        'css-output': { type: 'string' },
      },
      allowPositionals: true,
    });

    const command = positionals[0];

    if (values.help || !command || command === 'help') {
      console.log(USAGE);
      process.exit(0);
    }

    // Get working directory
    const cwd = values.cwd ? path.resolve(values.cwd) : process.cwd();

    // Prepare options
    const options = {
      cwd,
      entry: values.entry || 'src/**/*.{ts,tsx}',
      ignore: values.ignore
        ? values.ignore.split(',').map(p => p.trim())
        : ['**/*.test.*', '**/*.stories.*', '**/__tests__/**'],
      outdir: values.outdir || 'dist',
      cssInput: values['css-input'] || './src/styles/index.css',
      cssOutput: values['css-output'] || './dist/globals.css',
    };

    // Import and run the appropriate command
    if (command === 'build') {
      const { runBuild } = await import('../src/build.mjs');
      await runBuild(options);
    } else if (command === 'dev') {
      const { runDev } = await import('../src/dev.mjs');
      await runDev(options);
    } else {
      console.error(`❌ Unknown command: ${command}`);
      console.log(USAGE);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
