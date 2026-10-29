# @bitrate/converter

FFmpeg wrapper for Bitrate: CMAF audio renditions for streaming (ADR-0065), audio extraction from
video to AAC, and image conversion to WebP.

## Installation

```bash
pnpm add @bitrate/converter
```

## Requirements

- FFmpeg is bundled via `ffmpeg-static`, so no system install is required.
- If you prefer system FFmpeg, ensure it’s available in PATH and replace `ffmpeg-static` usage accordingly.

## CLI Usage

### Video Conversion (AAC)

Extract audio from video files and convert to AAC format.

```bash
# Extract audio from video
media-converter video -i movie.mp4

# Custom bitrate and output
media-converter video -i movie.mp4 -o audio.m4a -b 192k

# High quality AAC
media-converter video -i movie.mp4 -b 256k -q 2

# HE-AAC for lower bitrates
media-converter video -i movie.mp4 -b 64k --profile aac_he
```

#### Video Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--input` | `-i` | Input video file (required) | - |
| `--output` | `-o` | Output file path | `input.m4a` |
| `--bitrate` | `-b` | Audio bitrate | `128k` |
| `--quality` | `-q` | AAC quality (0.1-2) | `1` |
| `--profile` | - | AAC profile | `aac_low` |

**AAC profiles:**
- `aac_low` - LC-AAC, best quality (default)
- `aac_he` - HE-AAC, good for low bitrates
- `aac_he_v2` - HE-AAC v2, optimized for very low bitrates

### Image Conversion (WebP)

Convert images to WebP with configurable quality and lossless mode.

```bash
# Convert image to WebP (default quality 80)
media-converter image -i cover.png

# Custom output and quality
media-converter image -i cover.jpg -o cover.webp -q 85

# Lossless WebP
media-converter image -i logo.png --lossless
```

#### Image Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--input` | `-i` | Input image file (required) | - |
| `--output` | `-o` | Output file path | `input.webp` |
| `--quality` | `-q` | WebP quality (1-100) | `80` |
| `--lossless` | - | Enable lossless WebP | `false` |

## Programmatic Usage

You can also use the converter in your Node.js code:

```javascript
import { convertAudioToCmaf, convertImage, convertVideo } from '@bitrate/converter'

// Encode CMAF renditions in one FFmpeg run, with the byte index Range playback needs
const cmaf = await convertAudioToCmaf({
  input: 'song.wav',
  outputDir: 'song.cmaf',
  bitrates: [128, 192, 320],
})

console.log(cmaf.renditions[0])
// {
//   bitrate: 128,
//   path: 'song.cmaf/128.m4a',
//   initRange: [0, 708],
//   fragments: [{ startTicks: 0, durationTicks: 479232, offset: 709, length: 160436 }, ...],
//   ...
// }

// Convert video audio
const videoResult = await convertVideo({
  input: 'movie.mp4',
  output: 'audio.m4a',
  bitrate: '192k',
  quality: 1.5,
  profile: 'aac_low'
})

console.log(videoResult)
// {
//   input: 'movie.mp4',
//   output: 'audio.m4a',
//   inputSize: '150 MB',
//   outputSize: '12 MB'
// }

// Convert image
const imageResult = await convertImage({
  input: 'cover.png',
  output: 'cover.webp',
  quality: 85,
  lossless: false
})

console.log(imageResult)
// {
//   input: 'cover.png',
//   output: 'cover.webp',
//   inputSize: '1.4 MB',
//   outputSize: '420 KB'
// }
```

## Technical Details

### CMAF

- **Codec:** AAC-LC (`mp4a.40.2`), 48 kHz, stereo — pinned on every rendition
- **Container:** fragmented MP4 with a global `sidx`, one file per bitrate
- **Fragments:** 469 AAC frames (10.005 s); renditions share boundaries and
  `assertAlignedRenditions` fails the run when they drift

### AAC

- **Codec:** AAC (Advanced Audio Coding)
- **Container:** M4A
- **Bitrate range:** 8-529 kbps (recommended: 64-320k)
- **Quality range:** 0.1-2 (1 recommended, 2 = best quality)
- **Profiles:** LC-AAC (most compatible), HE-AAC (low bitrates), HE-AAC v2 (very low bitrates)

## License

ISC
