---
sidebar_position: 4
---

# Redis

Redis используется в двух ролях: хранение сессий и очереди задач.

## Подключение

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

BullMQ подключается напрямую через эти переменные в `AppModule`:

```typescript
BullModule.forRoot({
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
})
```

## Сессии пользователей и артистов

JWT refresh-токены хранятся в PostgreSQL (`UserSession`, `ArtistSession`), а не в Redis. Redis используется только BullMQ.

## BullMQ очереди

### `audio-processing`

Единственная активная очередь. Содержит задачи конвертации аудио.

**Producer** — `TracksService` при загрузке трека:
```typescript
await this.audioQueue.add('convert-audio', {
  trackId, artistId, sourceFileName, inputPath, outputDir, format, bitrates
})
```

**Consumer** — `AudioProcessor` воркер (NestJS BullMQ processor):
- Берёт задачу из очереди
- Запускает FFmpeg через `@spotify/converter`
- Обновляет `Track.processingStatus` в БД
- При ошибке — BullMQ автоматически повторяет (до 5 раз)

### Мониторинг очереди

```bash
# Запустить Bull Board (UI для мониторинга очередей)
# Доступен через admin-панель или отдельный эндпоинт (если настроен)
```

## Запуск Redis для разработки

```bash
# Через docker-compose (рекомендуется)
docker compose -f infra/docker-compose.dev.yaml up -d

# Redis будет доступен на localhost:6379
```

## Проверка подключения

```bash
docker exec -it <redis-container> redis-cli ping
# PONG
```
