---
sidebar_position: 5
---

# Listening History

История прослушиваний пользователя. Все эндпоинты требуют авторизации пользователя.

## Эндпоинты

| Метод | Маршрут | Описание |
|---|---|---|
| POST | `/api/v1/history/tracks/:trackId` | Записать прослушивание |
| GET | `/api/v1/history` | Получить историю |
| DELETE | `/api/v1/history` | Очистить всю историю |
| DELETE | `/api/v1/history/tracks/:trackId` | Удалить трек из истории |

## Запись прослушивания

```http
POST /api/v1/history/tracks/:trackId
```

Вызывается клиентом при начале или завершении воспроизведения трека. Создаёт новую запись с текущим временем.

```json
{
  "id": "uuid",
  "listenedAt": "2026-06-21T14:30:00.000Z"
}
```

## Получение истории

```http
GET /api/v1/history?page=1&limit=20
```

| Параметр | По умолчанию | Описание |
|---|---|---|
| `page` | 1 | Номер страницы |
| `limit` | 20 | Записей на страницу |

Ответ содержит записи с вложенными данными трека и артиста, отсортированные от новых к старым. **Дедупликация**: если трек прослушан несколько раз, он появится один раз (самое свежее вхождение).

```json
[
  {
    "id": "uuid",
    "listenedAt": "2026-06-21T14:30:00.000Z",
    "track": {
      "id": "uuid",
      "title": "Creep",
      "cover": "/static/covers/uuid.jpg",
      "duration": 238,
      "artistId": "uuid",
      "artist": {
        "id": "uuid",
        "username": "Radiohead",
        "avatar": "/static/avatars/uuid.jpg"
      }
    }
  }
]
```

## Очистка истории

```http
DELETE /api/v1/history
```

Удаляет все записи истории текущего пользователя. Возвращает `204 No Content`.

## Удаление трека из истории

```http
DELETE /api/v1/history/tracks/:trackId
```

Удаляет **все** записи конкретного трека из истории (все прослушивания). Возвращает `200 OK`.

## Схема БД

```prisma
model ListeningHistory {
  id         String   @id @default(uuid(7))
  userId     String
  trackId    String
  listenedAt DateTime @default(now())

  user  User  @relation(...)
  track Track @relation(...)

  @@index([userId, listenedAt(sort: Desc)])
  @@index([trackId])
}
```

Составной индекс `(userId, listenedAt DESC)` оптимизирует основной запрос — выборку истории по пользователю с сортировкой по времени.
