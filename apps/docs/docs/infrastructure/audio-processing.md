---
sidebar_position: 3
---

# Audio Processing Pipeline

Путь аудиофайла от загрузки до стриминга.

## Общий flow

```
Artist uploads MP3/WAV/FLAC
        ↓
POST /api/v1/tracks
        ↓
Файл сохраняется во временное хранилище
        ↓
Задача добавляется в BullMQ очередь "audio-processing"
        ↓
AudioProcessor worker (BullMQ)
        ↓
FFmpeg конвертирует в Opus: 128 / 192 / 320 kbps
        ↓
HLS сегментация (10-секундные .m4s сегменты)
        ↓
Файлы сохраняются в storage/public/tracks/:trackId/
        ↓
TrackFile записи создаются в БД
        ↓
Track.processingStatus → "READY"
        ↓
GET /api/v1/tracks/stream/:id/hls/master.m3u8
```

## BullMQ очередь

Очередь `audio-processing` настроена с retry-механизмом:

```typescript
{
  jobId: `convert-audio-${trackId}-${sourceFileName}`,
  attempts: 5,
  backoff: { type: 'exponential', delay: 5_000 },
  removeOnComplete: { age: 3_600, count: 1_000 },
  removeOnFail:     { age: 604_800, count: 5_000 },
}
```

- **5 попыток** с экспоненциальной задержкой (5с → 10с → 20с → ...)
- Завершённые задачи хранятся 1 час
- Упавшие задачи хранятся 7 дней для диагностики

## Статусы обработки

Трек может находиться в одном из состояний:

| Статус | Описание |
|---|---|
| `PROCESSING` | Задача в очереди или выполняется |
| `READY` | Конвертация завершена, стриминг доступен |
| `FAILED` | Все попытки исчерпаны |

Поля в БД: `processingStatus`, `processingError`, `processingAttempts`, `processingStartedAt`, `processingFinishedAt`.

## Битрейты

Генерируются только те битрейты, которые **не превышают** битрейт исходного файла:

```typescript
const TARGET_AUDIO_BITRATES = [128, 192, 320] // kbps
```

Если исходный файл 192 kbps — генерируются только варианты 128 и 192.

## Структура файлов

```
storage/public/tracks/:trackId/
├── hls/
│   ├── master.m3u8         # Master playlist
│   ├── 128/
│   │   ├── index.m3u8
│   │   ├── init.mp4
│   │   ├── segment_00000.m4s
│   │   └── segment_00001.m4s
│   ├── 192/
│   │   └── ...
│   └── 320/
│       └── ...
└── original/               # Исходный файл (временно)
```

## HLS стриминг

```http
# Master playlist (список качеств)
GET /api/v1/tracks/stream/:id/hls/master.m3u8

# Плейлист конкретного качества
GET /api/v1/tracks/stream/:id/hls/:bitrate/index.m3u8

# Сегмент
GET /api/v1/tracks/stream/:id/hls/:bitrate/segment_00000.m4s
```

Подробнее о стриминге на клиенте: [Audio Streaming](../applications/audio-streaming)

## Конвертация

Использует пакет `@spotify/converter` (FFmpeg wrapper). Поддерживаемые входные форматы: MP3, WAV, FLAC, M4A, OGG, OPUS.
