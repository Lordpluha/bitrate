# @spotify/converter

CLI tool for media conversion using FFmpeg. Convert audio files to OGG Opus and extract audio from video files to AAC format.

## Installation

```bash
pnpm add @spotify/converter
```

## Requirements

- **FFmpeg** must be installed on your system
- Install FFmpeg:
  - Ubuntu/Debian: `sudo apt install ffmpeg`
  - macOS: `brew install ffmpeg`
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

## CLI Usage

### Audio Conversion (OGG Opus)

Convert audio files to OGG Opus format with customizable bitrate and quality settings.

```bash
# Basic conversion with default settings (128k CBR)
media-converter audio -i song.mp3

# Custom bitrate
media-converter audio -i song.mp3 -b 192k

# Enable Variable Bitrate (VBR)
media-converter audio -i song.mp3 -b 192k -v

# Custom output file and quality
media-converter audio -i song.mp3 -o output.opus -q 10

# Voice optimization
media-converter audio -i podcast.mp3 --application voip -b 64k
```

#### Audio Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--input` | `-i` | Input audio file (required) | - |
| `--output` | `-o` | Output file path | `input.opus` |
| `--bitrate` | `-b` | Audio bitrate | `128k` |
| `--quality` | `-q` | Compression level (0-10) | `10` |
| `--vbr` | `-v` | Enable Variable Bitrate | `false` (CBR) |
| `--application` | - | Application type | `audio` |

**Bitrate options:** `64k`, `96k`, `128k`, `192k`, `256k`, `320k`

**Application types:**
- `audio` - Music and general audio (default)
- `voip` - Voice optimization
- `lowdelay` - Low latency for real-time

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

## Programmatic Usage

You can also use the converter in your Node.js code:

```javascript
import { convertAudio, convertVideo } from '@spotify/converter'

// Convert audio
const audioResult = await convertAudio({
  input: 'song.mp3',
  output: 'song.opus',
  bitrate: '192k',
  quality: 10,
  vbr: true,
  application: 'audio'
})

console.log(audioResult)
// {
//   input: 'song.mp3',
//   output: 'song.opus',
//   inputSize: '5.2 MB',
//   outputSize: '3.1 MB'
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
```

## Examples

### Music Conversion

```bash
# Standard quality music (128k CBR)
media-converter audio -i album/*.mp3 -b 128k

# High quality music (192k VBR)
media-converter audio -i song.flac -b 192k -v

# Maximum quality (256k VBR, highest compression)
media-converter audio -i song.wav -b 256k -v -q 10
```

### Voice/Podcast Conversion

```bash
# Voice optimized, low bandwidth
media-converter audio -i podcast.mp3 --application voip -b 64k

# Voice with better quality
media-converter audio -i podcast.mp3 --application voip -b 96k -v
```

### Video Audio Extraction

```bash
# Extract audio from video
media-converter video -i movie.mp4

# High quality extraction
media-converter video -i movie.mkv -b 256k -q 2

# Low bitrate with HE-AAC
media-converter video -i video.avi -b 64k --profile aac_he
```

## Technical Details

### OGG Opus

- **Codec:** libopus
- **Container:** OGG
- **Bitrate range:** 6-510 kbps (recommended: 64-256k)
- **Compression levels:** 0-10 (10 = highest quality, slower)
- **VBR vs CBR:** VBR provides better quality at same bitrate but variable file size

### AAC

- **Codec:** AAC (Advanced Audio Coding)
- **Container:** M4A
- **Bitrate range:** 8-529 kbps (recommended: 64-320k)
- **Quality range:** 0.1-2 (1 recommended, 2 = best quality)
- **Profiles:** LC-AAC (most compatible), HE-AAC (low bitrates), HE-AAC v2 (very low bitrates)

## License

ISC
