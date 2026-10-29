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
Один FFmpeg-процесс создаёт CMAF (fMP4, AAC-LC): по файлу на 128 / 192 / 320 kbps
с выровненными фрагментами и байтовым индексом
        ↓
Файлы загружаются в S3-compatible object storage
        ↓
TrackFile записи создаются в БД
        ↓
Track.processingStatus → "READY"
        ↓
GET /api/v1/tracks/:id/manifest + GET /api/v1/tracks/:id/cmaf/:bitrate (Range)
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

CMAF — единственный формат хранения ([ADR-0065](../architecture/0065-single-cmaf-aac-delivery-format.md)).
Каждая загрузка пишется в собственное неизменяемое поколение:

```
tracks/:trackId/generations/:generation/
└── cmaf/
    ├── 128.m4a
    ├── 192.m4a
    └── 320.m4a
```

## Стриминг

```http
# Список качеств и индекс фрагментов
GET /api/v1/tracks/:id/manifest

# Байтовый диапазон файла одного качества
GET /api/v1/tracks/:id/cmaf/:bitrate
Range: bytes=0-1048575
```

Подробнее о стриминге на клиенте: [Audio Streaming](../applications/audio-streaming)

## Конвертация

Использует пакет `@bitrate/converter` (FFmpeg wrapper). Поддерживаемые входные форматы: MP3, WAV, FLAC, M4A, OGG, OPUS.
