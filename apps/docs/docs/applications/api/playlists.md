---
sidebar_position: 6
---

# Playlists

Управление плейлистами пользователя.

## Эндпоинты

| Метод | Маршрут | Auth | Описание |
|---|---|---|---|
| GET | `/api/v1/playlists` | — | Все публичные плейлисты |
| GET | `/api/v1/playlists/me` | User | Мои плейлисты |
| GET | `/api/v1/playlists/:id` | — | Плейлист с треками |
| POST | `/api/v1/playlists` | User | Создать плейлист |
| PUT | `/api/v1/playlists/:id` | User (владелец) | Обновить плейлист |
| DELETE | `/api/v1/playlists/:id` | User (владелец) | Удалить плейлист |
| POST | `/api/v1/playlists/:id/tracks` | User (владелец) | Добавить треки |
| DELETE | `/api/v1/playlists/:id/tracks/:trackId` | User (владелец) | Убрать трек |
| POST | `/api/v1/playlists/:id/like` | User | Лайкнуть |
| DELETE | `/api/v1/playlists/:id/like` | User | Убрать лайк |

## Создание плейлиста

```http
POST /api/v1/playlists
Content-Type: application/json

{
  "title": "My Chill Mix",
  "description": "Evening vibes",
  "isPublic": true
}
```

`isPublic` — по умолчанию `false`.

## Мои плейлисты

```http
GET /api/v1/playlists/me
```

Возвращает плейлисты текущего пользователя с кратким списком треков и счётчиком, отсортированные по дате обновления.

```json
[
  {
    "id": "uuid",
    "title": "My Chill Mix",
    "cover": null,
    "isPublic": true,
    "tracks": [
      { "id": "uuid", "title": "Creep", "cover": "/static/covers/uuid.jpg" }
    ],
    "_count": { "tracks": 12 }
  }
]
```

## Добавление треков

```http
POST /api/v1/playlists/:id/tracks
Content-Type: application/json

{
  "trackIds": ["uuid1", "uuid2", "uuid3"]
}
```

Минимум 1 трек. Возвращает обновлённый плейлист с полным списком треков.

## Удаление трека

```http
DELETE /api/v1/playlists/:id/tracks/:trackId
```

## Права доступа

Изменять, удалять, добавлять и убирать треки может только **владелец** плейлиста. При попытке другого пользователя — `403 Forbidden`.
