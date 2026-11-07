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
- `jobId` детерминирован, поэтому повторная загрузка не ставит дубль. Перед постановкой
  завершённая задача (`completed`/`failed`) с тем же id удаляется: иначе BullMQ молча
  игнорирует `add`, и reprocess или retry релиза оставлял трек в `PROCESSING` без задачи.
  Задачу, которая ещё ждёт или выполняется, не трогаем.
- Задача считается окончательно упавшей, когда BullMQ выставил ей `finishedOn`, а не когда
  потрачены все 5 попыток. Задача, которую трижды «задушили» (процесс убит посреди
  конвертации, `maxStalledCount: 2`), падает как неисправимая после одной засчитанной попытки,
  и трек тоже переводится в `FAILED`.

### Зачистка зависших треков

Раз в 10 минут задача `stuck-tracks` (только в процессе, который конвертирует, то есть в
`worker`) ищет треки, которые дольше 90 минут в `PROCESSING` и у которых нет живой задачи в
очереди (`waiting`, `active`, `delayed` и т. п.). Такой трек переводится в `FAILED` с
ошибкой «Processing stopped without a result…», релиз получает сигнал `track-settled`, а в
Sentry уходит событие с fingerprint `audio-processing / STUCK`. Сама зачистка ничего не
ставит в очередь заново: повтор остаётся решением артиста или оператора.

## Статусы обработки

Трек может находиться в одном из состояний:

| Статус | Описание |
|---|---|
| `PROCESSING` | Задача в очереди или выполняется (дольше 90 минут без задачи — зачистка переведёт в `FAILED`) |
| `READY` | Конвертация завершена, стриминг доступен |
| `FAILED` | BullMQ окончательно провалил задачу, или трек завис без задачи |

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
