# @spotify/esbuild-bundler

ESBuild-based bundler for React libraries with TypeScript support.

## Features

- 🚀 Fast builds with ESBuild
- 📦 Dual format output (ESM + CJS)
- 🎨 Tailwind CSS compilation
- 🔧 TypeScript type definitions generation
- 🔄 Watch mode for development
- 🔗 Path alias resolution (@/ → relative paths)
- 🎯 Configurable entry points and ignore patterns

## Installation

```bash
npm install @spotify/esbuild-bundler
# или
pnpm add @spotify/esbuild-bundler
# или
yarn add @spotify/esbuild-bundler
```

## Usage

### CLI

#### Build for production

```bash
react-bundler build
```

#### Development mode with watch

```bash
react-bundler dev
```

#### Custom options

```bash
# Build with custom working directory
react-bundler build --cwd ./packages/ui-react

# Build with custom entry pattern
react-bundler build --entry "lib/**/*.ts"

# Custom output directory
react-bundler build --outdir ./build

# Custom CSS paths
react-bundler build --css-input ./styles/main.css --css-output ./dist/styles.css

# Custom ignore patterns
react-bundler build --ignore "**/*.test.*,**/*.spec.*"
```

### In npm scripts

```json
{
  "scripts": {
    "build": "react-bundler build",
    "dev": "react-bundler dev"
  }
}
```

### As a module

```javascript
import { runBuild } from '@spotify/esbuild-bundler/build';
import { runDev } from '@spotify/esbuild-bundler/dev';

// Build
await runBuild({
  cwd: process.cwd(),
  entry: 'src/**/*.{ts,tsx}',
  ignore: ['**/*.test.*', '**/*.stories.*'],
  outdir: 'dist',
  cssInput: './src/styles/index.css',
  cssOutput: './dist/globals.css',
});

// Dev
await runDev({
  // same options as runBuild
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--cwd` | string | `process.cwd()` | Working directory |
| `--entry` | string | `src/**/*.{ts,tsx}` | Entry points glob pattern |
| `--ignore` | string | `**/*.test.*,**/*.stories.*,**/__tests__/**` | Comma-separated patterns to ignore |
| `--outdir` | string | `dist` | Output directory |
| `--css-input` | string | `./src/styles/index.css` | CSS input file for Tailwind |
| `--css-output` | string | `./dist/globals.css` | CSS output file |

## Requirements

- Node.js 18+
- pnpm (for Tailwind CLI execution)
- `tsconfig.build.json` in your project root
- esbuild, glob, typescript as peer dependencies

## What it does

### Build mode

1. Finds all TypeScript/TSX files matching the entry pattern
2. Builds ESM and CJS versions in parallel
3. Resolves `@/` path aliases to relative paths
4. Compiles Tailwind CSS to a single minified file
5. Generates TypeScript type definitions

### Dev mode

1. Same as build mode, but in watch mode
2. Rebuilds on file changes
3. Runs TypeScript compiler in watch mode
4. Runs Tailwind CSS in watch mode

## License

MIT
