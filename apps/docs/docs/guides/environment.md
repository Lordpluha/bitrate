---
sidebar_position: 4
---

# Environment Variables

Полный список переменных окружения API. Валидация происходит при старте через Zod (`apps/api/env.schema.ts`) — приложение не запустится с невалидными значениями.

## Какой файл читается когда

В репозитории два независимых механизма, и они не пересекаются. Значение, положенное не в тот
файл, **молча игнорируется**: приложение упадёт на валидации так, будто переменной нет вовсе.

| Запуск | Читается | Как |
|---|---|---|
| `pnpm dev` нативно | `apps/api/.env*`, `apps/web-player/.env*` | приложение само загружает свой файл |
| `task dev:up`, `task prod:up` в Docker | **только корневой `.env`** | подстановка `${VAR}` в compose |

Per-app файлы до контейнера не доходят по двум причинам сразу: ни один сервис в
`infra/docker-compose.*.yaml` не объявляет `env_file`, а `.dockerignore` исключает `.env`,
`.env.development` и `.env*.local` из сборочного контекста. Внутрь образа попадает только
`.env.example`.

### Почему у контейнеров явный список, а не `env_file`

Каждый сервис перечисляет свои переменные в `environment:` поимённо. Это дороже в
сопровождении, но список видно при ревью, и в контейнер не утекает ничего лишнего — например,
секреты соседнего приложения.

У этого есть следствие, которое стоит помнить: **переменная, отсутствующая в `environment:`
сервиса, не попадёт в него, даже если она есть в корневом `.env`.** Добавляя новую переменную,
её нужно прописать и в `.env`, и в `environment:` нужного сервиса.

### Обязательное и опциональное в compose

Форма записи в `environment:` определяет, что увидит приложение, когда переменная не задана:

| Запись | Задана | Не задана |
|---|---|---|
| `KEY=${KEY}` | значение | **пустая строка** |
| `KEY` (голое имя) | значение из `.env` | не передаётся, в приложении `undefined` |

Разница существенна: Zod-схема пропускает `undefined` для `.optional()`, но пустая строка
провалит `z.url()` и `.min(32)`. Поэтому опциональные переменные (`SMTP_*`, `S3_*`,
`SENTRY_DSN`, `METRICS_TOKEN`, `USER_WEB_HOST`) записаны голыми именами — «опционально»
должно означать «отсутствует», а не «пусто».

## Основные

| Переменная | Обязательна | По умолчанию | Описание |
|---|---|---|---|
| `NODE_ENV` | нет | `local` | `local` / `development` / `production` / `test` |
| `PORT` | нет | `3000` | Порт HTTP-сервера |
| `WEB_HOST` | **да** | — | URL фронтенда (CORS + OAuth redirect). Пример: `http://localhost:3001` |

## Auth / JWT

| Переменная | Обязательна | По умолчанию | Описание |
|---|---|---|---|
| `JWT_SECRET` | **да** | — | Секрет для подписи JWT (минимум 10 символов) |
| `JWT_ACCESS_EXPIRES_IN` | нет | `5m` | Срок действия access token |
| `JWT_REFRESH_EXPIRES_IN` | нет | `30d` | Срок действия refresh token |
| `ACCESS_TOKEN_NAME` | нет | `access_token` | Имя HttpOnly cookie с access token |
| `REFRESH_TOKEN_NAME` | нет | `refresh_token` | Имя HttpOnly cookie с refresh token |

## OAuth

Все опциональны — если не заданы, соответствующий провайдер недоступен.

| Переменная | Описание |
|---|---|
| `OAUTH_GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `OAUTH_GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `OAUTH_FACEBOOK_APP_ID` | Facebook App ID |
| `OAUTH_FACEBOOK_APP_SECRET` | Facebook App Secret |
| `API_BASE_URL` | Базовый URL API для OAuth callback. Пример: `http://localhost:3000` |

## База данных

| Переменная | Обязательна | Описание |
|---|---|---|
| `DATABASE_URL` | **да** | PostgreSQL connection string. Пример: `postgresql://user:pass@localhost:5432/bitrate` |

## Redis

| Переменная | Обязательна | По умолчанию | Описание |
|---|---|---|---|
| `REDIS_HOST` | **да** | — | Хост Redis |
| `REDIS_PORT` | нет | `6379` | Порт Redis |

## Почта

Все опциональны. Если не заданы — письма для сброса пароля логируются в консоль (dev-режим).

| Переменная | По умолчанию | Описание |
|---|---|---|
| `SMTP_HOST` | — | SMTP-сервер |
| `SMTP_PORT` | `587` | SMTP-порт |
| `SMTP_USER` | — | SMTP логин |
| `SMTP_PASS` | — | SMTP пароль |
| `EMAIL_FROM` | — | Адрес отправителя |

## Мониторинг

| Переменная | Обязательна | Описание |
|---|---|---|
| `SENTRY_DSN` | нет | DSN проекта в Sentry. Если не задан — Sentry инициализируется без DSN (ошибки не отправляются) |

## Шаблон `.env`

```env
# Core
NODE_ENV=local
PORT=3000
WEB_HOST=http://localhost:3001

# Auth
JWT_SECRET=your-super-secret-key-min-10-chars
JWT_ACCESS_EXPIRES_IN=5m
JWT_REFRESH_EXPIRES_IN=30d

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bitrate

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# OAuth (optional)
OAUTH_GOOGLE_CLIENT_ID=
OAUTH_GOOGLE_CLIENT_SECRET=
OAUTH_FACEBOOK_APP_ID=
OAUTH_FACEBOOK_APP_SECRET=
API_BASE_URL=http://localhost:3000

# Mail (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

# Sentry (optional)
SENTRY_DSN=
```
