# Using @spotify/esbuild-bundler

## Quick Start

### 1. Add the dependency

```bash
pnpm add -D @spotify/esbuild-bundler
```

### 2. Configure package.json

```json
{
  "scripts": {
    "build": "react-bundler build",
    "dev": "react-bundler dev"
  }
}
```

### 3. Make sure tsconfig.build.json exists

The package uses `tsconfig.build.json` for type generation.

### 4. Run the build

```bash
pnpm build    # Production build
pnpm dev      # Development mode
```

## Project Structure Requirements

```
your-package/
├── src/
│   ├── index.ts          # Entry point
│   ├── components/       # Your code
│   └── styles/
│       └── index.css     # CSS entry (default)
├── tsconfig.build.json   # TypeScript config
└── package.json
```

## Configuration Options

### Via CLI flags

```bash
# Custom entry pattern
react-bundler build --entry "lib/**/*.ts"

# Custom output directory
react-bundler build --outdir ./build

# Custom CSS paths
react-bundler build \
  --css-input ./styles/main.css \
  --css-output ./dist/bundle.css
```

### Via code

```javascript
// build.mjs
import { runBuild } from '@spotify/esbuild-bundler/build';

runBuild({
  cwd: process.cwd(),
  entry: 'src/**/*.{ts,tsx}',
  outdir: 'dist',
});
```

## What's Included in the Build

### Build (Production)

✅ ESM bundle (`dist/esm/`)
✅ CJS bundle (`dist/cjs/`)
✅ Type definitions (`dist/types/`)
✅ Compiled CSS (`dist/globals.css`)
✅ Path aliases resolved (`@/` → `./`)

### Dev (Watch mode)

🔄 Automatic rebuild on changes
🔄 TypeScript watch mode
🔄 Tailwind CSS watch mode
⚡ Fast incremental builds

## Usage Examples

### In a monorepo

```json
{
  "scripts": {
    "build": "react-bundler build",
    "dev": "react-bundler dev"
  }
}
```

### With custom settings

```json
{
  "scripts": {
    "build": "react-bundler build --outdir ./build",
    "build:lib": "react-bundler build --entry 'lib/**/*.ts' --ignore '**/*.test.*'",
    "dev": "react-bundler dev --css-input ./src/theme.css"
  }
}
```

## Path Aliases

The bundler automatically replaces `@/` imports with relative paths:

```typescript
// Source code
import { Button } from '@/components/ui/button';

// After build in dist/esm/index.js
import { Button } from './components/ui/button.js';
```

This makes built files independent of tsconfig paths.

## Troubleshooting

### "Cannot find module tsconfig.build.json"

Create a `tsconfig.build.json` file:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist/types"
  },
  "include": ["src"],
  "exclude": ["**/*.test.*", "**/*.stories.*"]
}
```

### "pnpm: command not found"

The bundler uses `pnpm dlx` to run the Tailwind CLI. Install pnpm or change the command in the code.

### Slow build

In dev mode, use only `pnpm dev` without pre-cleaning the dist directory.
