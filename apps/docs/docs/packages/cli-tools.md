---
sidebar_position: 1
---

# CLI Tools

Custom command-line utilities built for the Bitrate project.

## 📦 Overview

The project includes several reusable CLI tools built as standalone packages:

| Package | Command | Purpose |
|---------|---------|---------|
| `@bitrate/svgr` | `react-svgr` | SVG → React components |
| `@bitrate/vite-svgr` | — | Vite plugin: SVG generation in build pipeline |
| `@bitrate/converter` | `media-converter` | Audio/video conversion |

All tools follow the same pattern:
- ✅ CLI with `--help` flag
- ✅ Programmatic API
- ✅ TypeScript support
- ✅ Fast execution

## ⚡ vite-svgr

Vite plugin that integrates `@bitrate/svgr` into the Vite build pipeline — no separate pre-build step needed.

### Installation

```bash
pnpm add @bitrate/vite-svgr
```

### Usage

Add to `vite.config.ts` **before** other plugins so SVG components are generated before transforms run:

```typescript
import { svgrPlugin } from '@bitrate/vite-svgr'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    svgrPlugin({
      input: './assets/icons',   // supports @scope/pkg/subpath
      output: 'src/icons/svgr',
      variables: ['primaryColor', 'secondaryColor'],
    }),
    // ... other plugins
  ],
})
```

### Options

| Option | Type | Description | Required |
|--------|------|-------------|----------|
| `input` | `string` | SVG source directory (supports `@scope/pkg/subpath`, relative, or absolute paths) | ✅ |
| `output` | `string` | Output directory for generated React components | ✅ |
| `variables` | `string[]` | Color variable names for multicolor icons | ❌ |

### Features

- ✅ **Build mode**: runs once in `buildStart`, before any module transforms
- ✅ **Watch mode** (`vite build --watch`): re-generates on any `.svg` change
- ✅ **Dev server** (`vite dev` / Storybook): attaches to chokidar, triggers full-reload on SVG changes
- ✅ **Package path resolution**: `@scope/package/subpath` resolved via pnpm workspace
- ✅ **Automatic cleanup**: cleans output dir before each generation

## 🎨 svgr

Convert SVG files to React components with dynamic color support.

### Installation

```bash
pnpm add @bitrate/svgr
```

### CLI Usage

```bash
# Build mode
react-svgr build \
  -i ./assets/icons \
  -o src/icons/svgr \
  --variables "primaryColor,secondaryColor"

# Watch mode
react-svgr dev \
  -i ./assets/icons \
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
pnpm add @bitrate/converter
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
import { convertAudio, convertVideo } from '@bitrate/converter'

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
    "icons": "react-svgr build -i ./assets/icons -o src/icons",
    "icons:watch": "react-svgr dev -i ./assets/icons -o src/icons",
    "build": "vite build",
    "dev": "vite build --watch",
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

# Build package (SVG generation + Vite build, all in one)
pnpm build

# Watch mode
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

**Next:** [Deployment](/docs/infrastructure/deployment) - Deploy to production