---
sidebar_position: 5
---

# @bitrate/converter

CLI и Node.js обёртка над FFmpeg: CMAF-качества для стриминга, аудио из видео и изображения.

## Требования

FFmpeg поставляется через `ffmpeg-static` — системная установка не нужна.

## CLI

### Извлечение аудио из видео в AAC

```bash
media-converter video -i video.mp4
media-converter video -i video.mp4 -b 256k
```

### Конвертация изображений в WebP

```bash
media-converter image -i cover.jpg
media-converter image -i cover.png -q 85  # качество 0-100
```

## Программный API

```typescript
import { convertAudioToCmaf, convertImage } from '@bitrate/converter'

// CMAF: один файл на качество, выровненные фрагменты и байтовый индекс
const { timescale, durationTicks, renditions } = await convertAudioToCmaf({
  input: './song.wav',
  outputDir: './song.cmaf',
  bitrates: [128, 192, 320],
})

// Изображение
await convertImage({
  input: './cover.jpg',
  output: './cover.webp',
  quality: 85,
})
```

## Использование в API

Воркер `audio-processing` вызывает `convertAudioToCmaf` — единственный аудиоформат хранения
([ADR-0065](../architecture/0065-single-cmaf-aac-delivery-format.md)). Все качества кодируются
одним запуском FFmpeg: AAC-LC, 48 кГц, стерео, фрагменты по 469 AAC-фреймов (10,005 с).
`assertAlignedRenditions` проваливает задачу, если границы фрагментов разошлись.

Подробнее: [Audio Processing Pipeline](../infrastructure/audio-processing)
