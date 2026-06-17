# Tailwind Tokens Generator

Generator of Tailwind v4 CSS tokens from `tokens.json`.

## Installation

```bash
pnpm add -D @spotify/tokens-generator
```

## CLI

```bash
tokens-generator --tokens ./tokens.json --output ./src/styles
```

### Options

- `--tokens <path>` — path to `tokens.json` (required)
- `--output <path>` — output directory (optional, defaults to `./styles`)
- `--help, -h` — help

No config file is used: the generator works only with a fixed Tailwind preset.

## What Gets Generated

The output directory will contain the following files:

- `palette.css`
- `layout.css`
- `typography.css`
- `themes.css`

Files use `@theme` and are compatible with Tailwind CSS v4.

## Programmatic API

```javascript
import { generateTokens } from '@spotify/tokens-generator'

await generateTokens({
  tokensPath: './tokens.json',
  outputDir: './src/styles',
})
```

## JSON Schema

```json
{
  "$schema": "node_modules/@spotify/tokens-generator/src/tokens.schema.json"
}
```

## Exports

- `@spotify/tokens-generator` — generation function
- `@spotify/tokens-generator/schema` — JSON schema for tokens

## License

MIT
