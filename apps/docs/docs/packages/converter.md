---
sidebar_position: 5
---

# @spotify/converter

CLI и Node.js обёртка над FFmpeg для конвертации аудио и изображений.

## Требования

FFmpeg поставляется через `ffmpeg-static` — системная установка не нужна.

## CLI

### Конвертация аудио в OGG Opus

```bash
# Базовая конвертация (128k CBR)
media-converter audio -i song.mp3

# Кастомный битрейт
media-converter audio -i song.mp3 -b 192k

# VBR (Variable Bitrate)
media-converter audio -i song.mp3 --vbr

# Указать выходной файл
media-converter audio -i song.mp3 -o song.opus
```

### Извлечение аудио из видео в AAC

```bash
media-converter video-to-audio -i video.mp4
media-converter video-to-audio -i video.mp4 -b 256k
```

### Конвертация изображений в WebP

```bash
media-converter image -i cover.jpg
media-converter image -i cover.png -q 85  # качество 0-100
```

## Программный API

```typescript
import { convertAudio, convertImage } from '@spotify/converter'

// Аудио
await convertAudio({
  inputPath: './song.mp3',
  outputPath: './song.opus',
  bitrate: '192k',
  format: 'opus',
})

// Изображение
await convertImage({
  inputPath: './cover.jpg',
  outputPath: './cover.webp',
  quality: 85,
})
```

## Использование в API

`AudioProcessor` (BullMQ воркер) использует `@spotify/converter` для создания progressive
Opus fallback и единого multi-bitrate HLS-пакета AAC/fMP4. HLS-варианты кодируются совместно,
чтобы границы сегментов совпадали при адаптивном переключении.

Подробнее: [Audio Processing Pipeline](../infrastructure/audio-processing)
