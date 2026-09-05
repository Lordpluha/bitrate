---
sidebar_position: 4
---

# Environment Variables

Полный список переменных окружения API. Валидация происходит при старте через Zod (`apps/api/env.schema.ts`) — приложение не запустится с невалидными значениями.

## Адреса API — origin без пути

`NEXT_PUBLIC_API_URL`, `API_BASE_URL` и `API_URL` содержат **только origin**: `https://bitrate.me`,
не `https://bitrate.me/api`. Префикс добавляют сами клиенты — `apps/api` объявляет
`setGlobalPrefix('api')`, и оба fetch-клиента строят путь как `${base}/api/v1/…`.

Указав префикс в переменной, получишь `/api/api/v1/…` и 404 на каждом запросе. Ошибка коварна
тем, что приложение стартует нормально и падает только при обращении к API.

`NEXT_PUBLIC_*` впекаются в бандл при сборке — их изменение требует пересборки приложения,
перезапуска контейнера недостаточно.

## Откуда берётся значение

Три источника, и только три. **Корневого `.env` в репозитории нет** — и заводить его не нужно.

| Что запускается | Откуда значения |
|---|---|
| Деплой и CI | GitHub environment secrets и variables; в шаг они передаются через `env:` |
| Одно приложение нативно (`pnpm dev`) | Собственный `.env` приложения, из его же шаблона в `apps/<app>/` |
| Docker-стеки (`task infra:up`, `task dev:up`) | Значения `:-default`, зашитые в `infra/docker-compose.*.yaml` |

В `docker-compose.dev.yaml` и `docker-compose.preprod.yaml` **у каждой** переменной объявлен
default, поэтому оба стека поднимаются на чистом клоне без единого env-файла. Чтобы
переопределить значение, экспортируй его в шелле — переменная окружения выигрывает у default:

```bash
POSTGRES_PORT=5433 task infra:up
```

Именно поэтому `infra:*` и `dev:*` в `Taskfile.yml` не передают `--env-file`: при отсутствующем
файле compose завершается с ошибкой `couldn't find env file`, и этот флаг ломал все `task dev:*`
на свежем клоне.

`docker-compose.prod.yaml` — сознательное исключение по обоим пунктам. Default'ов у него нет ни
у одной переменной (`DOMAIN`, `DATABASE_URL`, `JWT_SECRET`, `POSTGRES_*`, `REDIS_PASSWORD`,
`WEB_HOST`, `NEXT_PUBLIC_*`), и `prod:*` **сохраняет** `--env-file .env`. Противоречия здесь
нет: этот `.env` живёт только на сервере, его пишет `deploy_reusable.yml` из GitHub environment
secrets в `$HOME/bitrate/.env` с правами 600, и запускается всё оттуда же. Это артефакт
деплоя на целевой машине, а не файл репозитория. То, что `config` падает на `DOMAIN` вне
деплоя, — работающая защита, а не баг.

:::warning Корневой `.env` compose всё равно не прочитает
При `-f infra/...` директорией проекта становится `infra/`, поэтому compose ищет `infra/.env`
и корневой файл игнорирует полностью. Положенный в корень `.env` — включая созданный шагом
CI — не даёт **ничего**. Для CI задавай значения через `env:` на уровне job или step:
переменная шелла подставляется в `${VAR}` надёжно.
:::

Per-app файлы до контейнера тоже не доходят: ни один сервис в `infra/docker-compose.*.yaml`
не объявляет `env_file`, а `.dockerignore` исключает `.env`, `.env.development` и `.env*.local`
из сборочного контекста.

### Почему у контейнеров явный список, а не `env_file`

Каждый сервис перечисляет свои переменные в `environment:` поимённо. Это дороже в
сопровождении, но список видно при ревью, и в контейнер не утекает ничего лишнего — например,
секреты соседнего приложения.

У этого есть следствие, которое стоит помнить: **переменная, отсутствующая в `environment:`
сервиса, не попадёт в него, даже если она экспортирована в шелле.** Добавляя новую переменную,
её нужно прописать в `environment:` нужного сервиса — вместе с её `:-default`.

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
