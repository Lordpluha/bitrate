---
sidebar_position: 7
---

# Artists

Публичные страницы артистов и система подписок.

## Эндпоинты

| Метод | Маршрут | Auth | Описание |
|---|---|---|---|
| GET | `/api/v1/artists` | — | Список артистов |
| GET | `/api/v1/artists/:id` | — | Артист по ID |
| GET | `/api/v1/artists/by-username/:username` | — | Артист по username |
| PUT | `/api/v1/artists/:id` | Artist (владелец) | Обновить профиль |
| DELETE | `/api/v1/artists/:id` | Artist (владелец) | Удалить аккаунт |
| GET | `/api/v1/artists/me/following` | User | Мои подписки |
| POST | `/api/v1/artists/:id/follow` | User | Подписаться |
| DELETE | `/api/v1/artists/:id/follow` | User | Отписаться |
| POST | `/api/v1/artists/:id/like` | User | Лайкнуть |
| DELETE | `/api/v1/artists/:id/like` | User | Убрать лайк |

## Получение артиста

```http
GET /api/v1/artists/:id
```

```json
{
  "id": "uuid",
  "username": "radiohead",
  "bio": "British rock band from Abingdon, Oxfordshire.",
  "avatar": "/static/avatars/uuid.jpg",
  "backgroundImage": "/static/covers/uuid.jpg",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

Поля `password` и `email` никогда не возвращаются.

## Подписка на артиста

```http
POST /api/v1/artists/:id/follow
```

Если артист не найден — `404 Not Found`. Ответ содержит обновлённый профиль артиста и актуальный счётчик подписчиков:

```json
{
  "id": "uuid",
  "username": "radiohead",
  "_count": { "followers": 1024 }
}
```

## Отписка

```http
DELETE /api/v1/artists/:id/follow
```

Аналогично — возвращает профиль с обновлённым счётчиком.

## Мои подписки

```http
GET /api/v1/artists/me/following?page=1&limit=20
```

Пагинированный список артистов, на которых подписан текущий пользователь. Каждый элемент включает `_count.followers`.

## Схема подписок

Реализована через implicit M2M в Prisma:

```prisma
model User {
  followedArtists Artist[] @relation("UserFollowedArtists")
}

model Artist {
  followers User[] @relation("UserFollowedArtists")
}
```

Prisma создаёт таблицу `_UserFollowedArtists` автоматически.
