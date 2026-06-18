# Using @spotify/tokens-generator in Other Applications

## Quick Start

### 1. Add the dependency

```bash
pnpm add -D @spotify/tokens-generator
```

### 2. Add a script to package.json

```json
{
  "scripts": {
    "gen:tokens": "tokens-generator --tokens ./path/to/tokens.json --output ./styles"
  }
}
```

### 3. Run generation

```bash
pnpm gen:tokens
```

## Usage Examples in a Monorepo

### In apps/web

```json
{
  "scripts": {
    "gen:tokens": "tokens-generator --tokens ../../packages/tokens/tokens.json --output ./src/styles"
  }
}
```

### In apps/mobile

```json
{
  "scripts": {
    "gen:tokens": "tokens-generator --tokens @spotify/tokens/tokens.json --output ./styles"
  }
}
```

## Using as a Module

```javascript
// scripts/build-tokens.mjs
import { generateTokens } from '@spotify/tokens-generator'

await generateTokens({
  tokensPath: './tokens.json',
  outputDir: './dist/styles',
})
```

## JSON Schema

Add to your `tokens.json`:

```json
{
  "$schema": "../../node_modules/@spotify/tokens-generator/src/tokens.schema.json",
  "palette": {
    // ...
  }
}
```

This gives you autocompletion and validation in VSCode.

## Important

- The generator only works with Tailwind CSS v4.
- External `tokens.config.mjs` is not supported.
