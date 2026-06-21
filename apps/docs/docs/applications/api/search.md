---
sidebar_position: 4
---

# Search

Full-text поиск по всем типам контента.

## Эндпоинт

```http
GET /api/v1/search?q=<query>&types[]=<type>&limit=<n>
```

| Параметр | Тип | Обязателен | По умолчанию | Описание |
|---|---|---|---|---|
| `q` | string | да | — | Поисковый запрос |
| `types[]` | string[] | нет | все типы | `tracks`, `artists`, `albums`, `playlists` |
| `limit` | number | нет | 10 | Макс. результатов на тип |

## Пример запроса

```http
GET /api/v1/search?q=radiohead&types[]=tracks&types[]=artists&limit=5
```

## Пример ответа

```json
{
  "tracks": [
    {
      "id": "uuid",
      "title": "Creep",
      "cover": "/static/covers/uuid.jpg",
      "artistId": "uuid",
      "rank": 0.0759909
    }
  ],
  "artists": [
    {
      "id": "uuid",
      "username": "Radiohead",
      "avatar": "/static/avatars/uuid.jpg",
      "bio": "British rock band...",
      "rank": 0.759909
    }
  ]
}
```

Если тип не запрошен — ключ в ответе отсутствует.

## Как работает поиск

### PostgreSQL Full-Text Search

Поиск использует встроенный FTS в PostgreSQL:

```sql
SELECT id, title, cover, "artistId",
  ts_rank(to_tsvector('english', title), plainto_tsquery('english', $1)) AS rank
FROM "Track"
WHERE to_tsvector('english', title) @@ plainto_tsquery('english', $1)
   OR title ILIKE $2
ORDER BY rank DESC
LIMIT $3
```

- `to_tsvector` — разбивает текст на лексемы
- `plainto_tsquery` — парсит пользовательский запрос в tsquery
- `ts_rank` — определяет релевантность
- `ILIKE` — fallback для поиска подстрок (если FTS ничего не нашёл)

### GIN-индексы

Для ускорения FTS в БД созданы GIN-индексы:

```sql
CREATE INDEX idx_track_fts  ON "Track"    USING GIN (to_tsvector('english', title));
CREATE INDEX idx_artist_fts ON "Artist"   USING GIN (to_tsvector('english', username));
CREATE INDEX idx_album_fts  ON "Album"    USING GIN (to_tsvector('english', title));
CREATE INDEX idx_playlist_fts ON "Playlist" USING GIN (to_tsvector('english', title))
  WHERE "isPublic" = true;
```

Индекс на плейлистах — partial: индексируются только публичные.

### Параллельное выполнение

Запросы по всем запрошенным типам выполняются через `Promise.all` — без последовательного ожидания.

## Особенности

- **Плейлисты** — поиск только по публичным (`isPublic = true`)
- **Язык** — `english` конфигурация для лексематизации; для не-английских слов работает ILIKE fallback
- **Ранжирование** — результаты отсортированы по `ts_rank` по убыванию
