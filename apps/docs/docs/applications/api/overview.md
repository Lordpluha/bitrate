---
sidebar_position: 1
---

# API Overview

NestJS backend — основа всей платформы.

## Стек

- **NestJS 11** + TypeScript
- **PostgreSQL 16** через Prisma ORM
- **Redis** — сессии, BullMQ очереди
- **BullMQ** — фоновая обработка аудио
- **Socket.io** — real-time события
- **Swagger** — авто-документация на `/swagger`
- **Sentry** — мониторинг ошибок

## Структура модулей

```
apps/api/src/
├── modules/
│   ├── users/             # Пользователи
│   ├── users-auth/        # Auth пользователей (JWT, OAuth, 2FA)
│   ├── artists/           # Артисты + подписки
│   ├── artists-auth/      # Auth артистов (JWT, OAuth, 2FA)
│   ├── tracks/            # Треки, стриминг, like
│   ├── albums/            # Альбомы, like
│   ├── playlists/         # Плейлисты, управление треками
│   ├── search/            # Full-text поиск
│   ├── history/           # История прослушиваний
│   └── tokens/            # JWT токены
├── infra/
│   ├── prisma/            # PrismaService + геттеры моделей
│   ├── mail/              # SMTP (сброс пароля)
│   └── seeds/             # Сидинг БД
└── common/
    ├── config/            # Типизированный ConfigService
    ├── filters/           # HttpExceptionFilter + Sentry
    └── middleware/        # PathTraversalMiddleware
```

## Быстрый старт

```bash
# Инфраструктура
docker compose -f infra/docker-compose.dev.yaml up -d

# Миграции + сидинг
pnpm --filter @bitrate/api db:migration:start
pnpm --filter @bitrate/api db:seed

# Dev-сервер
pnpm --filter @bitrate/api start:dev
```

API доступен на `http://localhost:3000`, Swagger — на `http://localhost:3000/swagger`.

## Версионирование

Все маршруты имеют префикс `/api/v1/`. Версия передаётся через URI.

```
http://localhost:3000/api/v1/tracks
http://localhost:3000/api/v1/artists
```

## Аутентификация

Используются **HttpOnly cookies** с JWT-токенами. Два независимых auth-потока:

- `users-auth` — для слушателей (`/api/v1/users/auth/*`)
- `artists-auth` — для артистов (`/api/v1/artists/auth/*`)

Подробнее: [Authentication](./authentication)

## Статические файлы

Раздаются через `ServeStaticModule` по пути `/static/*`:

```
storage/public/
├── tracks/     # Аудио файлы (.opus, CMAF-фрагменты .mp4, HLS-сегменты)
├── covers/     # Обложки треков и альбомов
└── avatars/    # Аватары пользователей и артистов
```

## Обработка ошибок

Глобальный `HttpExceptionFilter` форматирует все ошибки в единый формат и отправляет их в Sentry:

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Track not found",
  "timestamp": "2026-06-21T10:00:00.000Z",
  "path": "/api/v1/tracks/unknown-id"
}
```

## Модули — справочник

| Модуль | Маршрут | Описание |
|---|---|---|
| users-auth | `/api/v1/users/auth` | Регистрация, вход, OAuth, 2FA, сброс пароля |
| artists-auth | `/api/v1/artists/auth` | То же для артистов |
| users | `/api/v1/users` | Профиль пользователя |
| artists | `/api/v1/artists` | Страницы артистов, подписки |
| tracks | `/api/v1/tracks` | Загрузка, CMAF/Range-стриминг (HLS — запасной путь), like |
| albums | `/api/v1/albums` | Альбомы, like |
| playlists | `/api/v1/playlists` | Плейлисты, треки в плейлисте |
| search | `/api/v1/search` | Full-text поиск |
| history | `/api/v1/history` | История прослушиваний |
