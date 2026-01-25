---
sidebar_position: 1
---

# CLI Tools

Custom command-line utilities built for the Spotify Clone project.

## 📦 Overview

The project includes several reusable CLI tools built as standalone packages:

| Package | Command | Purpose |
|---------|---------|---------|
| `@spotify/tokens-generator` | `tokens-generator` | Design tokens → CSS variables |
| `@spotify/esbuild-bundler` | `react-bundler` | Fast React library bundling |
| `@spotify/svgr` | `react-svgr` | SVG → React components |
| `@spotify/converter` | `media-converter` | Audio/video conversion |

All tools follow the same pattern:
- ✅ CLI with `--help` flag
- ✅ Programmatic API
- ✅ TypeScript support
- ✅ Fast execution

## 🎨 tokens-generator

Generate CSS variables from design tokens (JSON).

### Installation

```bash
pnpm add @spotify/tokens-generator
```

### CLI Usage

```bash
# Basic usage
tokens-generator \
  --tokens ./tokens.json \
  --config ./tokens.config.mjs \
  --output ./src/styles

# Initialize config file
tokens-generator --init
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--tokens` | Path to tokens JSON file | Required |
| `--config` | Path to config file | `tokens.config.mjs` |
| `--output` | Output directory | `./styles` |
| `--init` | Create default config | - |

### Configuration

**tokens.config.mjs:**

```javascript
export default {
  output: {
    palette: 'palette.css',
    layout: 'layout.css',
    typography: 'typography.css',
    themes: 'themes.css'
  },
  themes: ['light', 'dark'],
  prefix: '--sp'
}
```

### Input Format

**tokens.json:**

```json
{
  "colors": {
    "primary": {
      "50": "#eff6ff",
      "500": "#3b82f6",
      "900": "#1e3a8a"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px"
  }
}
```

### Output

Generates CSS files with custom properties:

```css
/* palette.css */
:root {
  --sp-color-primary-50: #eff6ff;
  --sp-color-primary-500: #3b82f6;
  --sp-color-primary-900: #1e3a8a;
}

/* layout.css */
:root {
  --sp-spacing-xs: 4px;
  --sp-spacing-sm: 8px;
  --sp-spacing-md: 16px;
}
```

### Programmatic API

```javascript
import { generateTokens } from '@spotify/tokens-generator'

const config = {
  tokensPath: './tokens.json',
  output: './styles',
  themes: ['light', 'dark']
}

await generateTokens(config)
```

## ⚡ esbuild-bundler

Ultra-fast bundler for React libraries using ESBuild.

### Installation

```bash
pnpm add @spotify/esbuild-bundler
```

### CLI Usage

```bash
# Build mode
react-bundler build

# Development mode (watch)
react-bundler dev

# Custom options
react-bundler build \
  --cwd ./packages/ui \
  --entry "src/**/*.{ts,tsx}" \
  --outdir dist \
  --css-input ./src/styles/index.css \
  --css-output ./dist/globals.css
```

### Commands

#### build

Build for production (ESM + CJS + Types + CSS).

```bash
react-bundler build [options]
```

#### dev

Watch mode with hot reload.

```bash
react-bundler dev [options]
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--cwd` | Working directory | `process.cwd()` |
| `--entry` | Entry glob pattern | `src/**/*.{ts,tsx}` |
| `--ignore` | Ignore patterns | `**/*.test.*` |
| `--outdir` | Output directory | `dist` |
| `--css-input` | CSS entry file | `./src/styles/index.css` |
| `--css-output` | CSS output file | `./dist/globals.css` |

### Features

- ✅ **Dual builds**: ESM and CJS
- ✅ **TypeScript**: Type generation with tsc
- ✅ **Tailwind CSS v4**: Rust-based, ultra-fast
- ✅ **Path aliases**: Automatic `@/` resolution
- ✅ **Watch mode**: Incremental rebuilds

### Build Output

```
dist/
├── esm/          # ES Modules
│   ├── index.js
│   └── components/
├── cjs/          # CommonJS
│   ├── index.js
│   └── components/
├── types/        # TypeScript definitions
│   ├── index.d.ts
│   └── components/
└── globals.css   # Compiled CSS
```

### Programmatic API

```javascript
import { runBuild, runDev } from '@spotify/esbuild-bundler'

// Build
await runBuild({
  cwd: process.cwd(),
  entry: 'src/**/*.{ts,tsx}',
  outdir: 'dist'
})

// Dev mode
await runDev({
  cwd: process.cwd(),
  entry: 'src/**/*.{ts,tsx}',
  outdir: 'dist'
})
```

## 🎨 svgr

Convert SVG files to React components with dynamic color support.

### Installation

```bash
pnpm add @spotify/svgr
```

### CLI Usage

```bash
# Build mode
react-svgr build \
  -i @spotify/tokens/icons \
  -o src/icons/svgr \
  --variables "primaryColor,secondaryColor"

# Watch mode
react-svgr dev \
  -i @spotify/tokens/icons \
  -o src/icons/svgr
```

### Options

| Flag | Short | Description | Required |
|------|-------|-------------|----------|
| `--input` | `-i` | Input directory/package | ✅ |
| `--output` | `-o` | Output directory | ✅ |
| `--variables` | - | Color variable names | ❌ |

### Input

SVG files with `fill` or `stroke` attributes:

```xml
<!-- icons/music.svg -->
<svg viewBox="0 0 24 24">
  <path fill="#000000" d="M12 3v10.55..."/>
  <circle fill="#FF0000" cx="9" cy="17" r="3"/>
</svg>
```

### Output

React components with props:

```typescript
// src/icons/svgr/Music.tsx
export interface MusicProps {
  primaryColor?: string
  secondaryColor?: string
  className?: string
}

export const Music: React.FC<MusicProps> = ({
  primaryColor = '#000000',
  secondaryColor = '#FF0000',
  className
}) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path fill={primaryColor} d="M12 3v10.55..."/>
    <circle fill={secondaryColor} cx="9" cy="17" r="3"/>
  </svg>
)
```

### Usage in Code

```tsx
import { Music } from './icons/svgr/Music'

<Music
  primaryColor="#3b82f6"
  secondaryColor="#f59e0b"
  className="w-6 h-6"
/>
```

## 🎵 media-converter

Convert media files using FFmpeg (Audio → OGG Opus, Video → AAC).

### Installation

```bash
pnpm add @spotify/converter
```

### Prerequisites

**FFmpeg must be installed:**

```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### CLI Usage

#### Audio Conversion

```bash
# Default (128k CBR)
media-converter audio -i song.mp3

# Custom bitrate with VBR
media-converter audio -i song.mp3 -b 192k -v

# Voice optimization
media-converter audio -i podcast.mp3 --application voip -b 64k

# High quality
media-converter audio -i song.flac -b 256k -v -q 10
```

#### Video Conversion

```bash
# Extract audio from video
media-converter video -i movie.mp4

# Custom bitrate
media-converter video -i movie.mp4 -b 192k -q 2

# HE-AAC for low bitrates
media-converter video -i video.avi -b 64k --profile aac_he
```

### Audio Options

| Flag | Description | Default |
|------|-------------|---------|
| `-i, --input` | Input file | Required |
| `-o, --output` | Output file | `input.opus` |
| `-b, --bitrate` | Bitrate (64k-320k) | `128k` |
| `-q, --quality` | Compression (0-10) | `10` |
| `-v, --vbr` | Enable VBR | `false` |
| `--application` | audio/voip/lowdelay | `audio` |

### Video Options

| Flag | Description | Default |
|------|-------------|---------|
| `-i, --input` | Input file | Required |
| `-o, --output` | Output file | `input.m4a` |
| `-b, --bitrate` | Bitrate | `128k` |
| `-q, --quality` | Quality (0.1-2) | `1` |
| `--profile` | AAC profile | `aac_low` |

### Programmatic API

```javascript
import { convertAudio, convertVideo } from '@spotify/converter'

// Audio conversion
const result = await convertAudio({
  input: 'song.mp3',
  output: 'song.opus',
  bitrate: '192k',
  quality: 10,
  vbr: true,
  application: 'audio'
})

console.log(result)
// {
//   input: 'song.mp3',
//   output: 'song.opus',
//   inputSize: '5.2 MB',
//   outputSize: '3.1 MB'
// }

// Video conversion
const videoResult = await convertVideo({
  input: 'movie.mp4',
  output: 'audio.m4a',
  bitrate: '192k',
  quality: 1.5,
  profile: 'aac_low'
})
```

## 🔄 Using in npm Scripts

### package.json Example

```json
{
  "scripts": {
    "tokens": "tokens-generator --tokens ../tokens/tokens.json --output ./src/styles",
    "icons": "react-svgr build -i @spotify/tokens/icons -o src/icons",
    "icons:watch": "react-svgr dev -i @spotify/tokens/icons -o src/icons",
    "build": "react-bundler build",
    "dev": "react-bundler dev",
    "convert": "media-converter audio -i input.mp3 -o output.opus"
  }
}
```

### Running Scripts

```bash
# Generate tokens
pnpm tokens

# Build icons
pnpm icons

# Watch icons
pnpm icons:watch

# Build package
pnpm build

# Development
pnpm dev
```

## 📝 Best Practices

### 1. **Version Control**

Add generated files to `.gitignore`:

```gitignore
# Generated files
/dist
/src/styles/palette.css
/src/styles/layout.css
/src/icons/svgr/
```

### 2. **CI/CD Integration**

```yaml
# .github/workflows/build.yml
- name: Generate tokens
  run: pnpm tokens

- name: Generate icons
  run: pnpm icons

- name: Build packages
  run: pnpm build
```

### 3. **Type Safety**

Import generated types:

```typescript
import type { MusicProps } from './icons/svgr/Music'
```

### 4. **Performance**

Use watch mode during development:

```bash
# Terminal 1: Watch icons
pnpm icons:watch

# Terminal 2: Watch build
pnpm dev
```

## 🐛 Troubleshooting

### Command Not Found

```bash
# Install package
pnpm install

# Or use pnpm exec
pnpm exec tokens-generator --help
```

### FFmpeg Not Found

```bash
# Verify installation
ffmpeg -version

# Install if missing (see Prerequisites)
```

### Build Errors

```bash
# Clean and rebuild
rm -rf dist node_modules
pnpm install
pnpm build
```

---

**Next:** [Deployment](/deployment) - Deploy to production