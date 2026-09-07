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

## Какое приложение что читает

| Приложение | Валидация | Что читает |
|---|---|---|
| `apps/api` | Zod, `apps/api/env.schema.ts` — падает на старте | 30 переменных схемы + 3 в обход неё |
| `apps/web-player` | Zod, `apps/web-player/env.schema.ts` — падает на сборке | 6 переменных схемы + 5 сборочных |
| `apps/web-artists` | Zod, `apps/web-artists/env.schema.ts` | 2 переменные схемы + 1 в обход неё |
| `apps/desktop` | нет | только `TAURI_DEV_HOST`, и тот ставит Tauri |
| `apps/mobile` | нет | только `EXPO_OS`, и тот ставит Expo |
| `apps/docs` | нет | ничего |

Дальше — по приложению. «Обязательна» означает: без неё приложение не стартует (API) или не
собирается (фронтенды), потому что схема отвергнет значение.

## `apps/api`

### Обязательные — без них процесс не поднимется

| Переменная | Слой | Формат | Описание |
|---|---|---|---|
| `WEB_HOST` | адреса | URL | Origin фронтенда: CORS и OAuth redirect |
| `DATABASE_URL` | данные | URL | PostgreSQL connection string. `postgresql://user:pass@host:5432/bitrate` |
| `REDIS_HOST` | данные | строка | Хост Redis |
| `JWT_SECRET` | аутентификация | строка ≥10 символов | Секрет для подписи JWT |

### Опциональные с дефолтом

| Переменная | Слой | По умолчанию | Описание |
|---|---|---|---|
| `NODE_ENV` | рантайм | `development` | `development` / `production` / `test` |
| `PORT` | рантайм | `3000` | Порт HTTP-сервера |
| `TRUST_PROXY_HOPS` | рантайм | `0` | Сколько прокси-хопов доверять (0–5). В prod за nginx — `1` |
| `REDIS_PORT` | данные | `6379` | Порт Redis |
| `JWT_ACCESS_EXPIRES_IN` | аутентификация | `5m` | Срок жизни access token (формат `ms`) |
| `JWT_REFRESH_EXPIRES_IN` | аутентификация | `30d` | Срок жизни refresh token |
| `ACCESS_TOKEN_NAME` | аутентификация | `access_token` | Имя HttpOnly-куки с access token |
| `REFRESH_TOKEN_NAME` | аутентификация | `refresh_token` | Имя HttpOnly-куки с refresh token |
| `STORAGE_DRIVER` | файлы | `local` | `local` или `s3` — какая реализация `StorageService` биндится при старте |
| `S3_REGION` | файлы | `us-east-1` | Регион S3 |
| `S3_FORCE_PATH_STYLE` | файлы | `true` | Path-style адресация бакета |
| `SMTP_PORT` | почта | `587` | SMTP-порт |
| `HEALTH_CHECK_TIMEOUT_MS` | наблюдаемость | `2000` | Таймаут health-проверок (100–10000) |
| `DEV_MAIL_LOG_TOKENS` | разработка | `false` | Логировать токены писем. В production обязан быть `false` |

### Опциональные без дефолта

| Переменная | Слой | Описание |
|---|---|---|
| `USER_WEB_HOST` | адреса | Origin плеера, если он отличается от `WEB_HOST` |
| `ARTIST_WEB_HOST` | адреса | Origin портала артистов |
| `API_BASE_URL` | адреса | Origin API для OAuth callback |
| `REDIS_PASSWORD` | данные | Пароль Redis. Локально Redis без auth, в проде `requirepass` |
| `COOKIE_DOMAIN` | аутентификация | Родительский домен сессионных кук, например `.bitrate.me`. Без него куки host-only, и гейты маршрутов на другом поддомене сессию не увидят |
| `OAUTH_GOOGLE_CLIENT_ID` · `OAUTH_GOOGLE_CLIENT_SECRET` | аутентификация | Google OAuth. Без пары провайдер недоступен |
| `OAUTH_FACEBOOK_APP_ID` · `OAUTH_FACEBOOK_APP_SECRET` | аутентификация | Facebook OAuth, то же правило |
| `S3_PUBLIC_URL` | файлы | Публичный origin раздачи файлов |
| `SMTP_HOST` | почта | SMTP-сервер. Без него письма сброса пароля пишутся в лог |
| `METRICS_TOKEN` | наблюдаемость | Токен доступа к метрикам, минимум 32 символа |
| `SENTRY_DSN` | наблюдаемость | DSN проекта API в Sentry. Без него SDK стартует отключённым |

### Условно обязательные

Проверяет `superRefine` в конце схемы — эти правила срабатывают уже после того, как отдельные
поля прошли валидацию:

| Правило | Когда включается |
|---|---|
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` обязательны | `STORAGE_DRIVER=s3` |
| `EMAIL_FROM` обязателен | задан `SMTP_HOST` |
| `SMTP_USER` и `SMTP_PASS` только парой | задан любой из двух |
| `DEV_MAIL_LOG_TOKENS` обязан быть `false` | `NODE_ENV=production` |

### Читаются в обход схемы

Эти переменные схема не описывает и не проверяет — опечатка в них не будет замечена при старте:

| Переменная | Где | Зачем |
|---|---|---|
| `SENTRY_ENVIRONMENT` | `src/instrument.ts` | Окружение события в Sentry. Приоритетнее `NODE_ENV` |
| `SENTRY_RELEASE` | `src/instrument.ts` | Релиз, из которого собран образ |
| `SEED_USER_PASSWORD` | сиды Prisma | Пароль тестовых пользователей |

`instrument.ts` импортируется раньше `ConfigModule`, поэтому читает `process.env` напрямую —
провалидировать эти две через схему нельзя без переноса инициализации Sentry.

## `apps/web-player`

Ни одна переменная не обязательна для обычной сборки. Обязательность включает
`ENFORCE_DEPLOY_ENV`, который выставляет только `Dockerfile` на стадии сборки образа: локальный
`next build`, typecheck и E2E проходят без единой переменной.

| Переменная | Обязательна | Описание |
|---|---|---|
| `NODE_ENV` | нет, `development` | Next выставляет сам |
| `NEXT_PUBLIC_API_URL` | при деплое | Origin API для браузера |
| `API_URL` | при деплое | Origin API для SSR. В Docker — внутренний адрес `http://api:3000` |
| `NEXT_PUBLIC_SITE_URL` | при деплое | Собственный origin. При деплое обязан быть HTTPS, не localhost и без пути |
| `NEXT_PUBLIC_SENTRY_DSN` | нет | DSN проекта `player`. Без него SDK стартует отключённым |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | нет | Окружение событий Sentry |

Сборочные и служебные — вне схемы:

| Переменная | Кто ставит | Зачем |
|---|---|---|
| `ENFORCE_DEPLOY_ENV` | `Dockerfile` | Включает требование трёх URL выше |
| `SENTRY_AUTH_TOKEN` | CI | Загрузка source maps. Секрет, в отличие от DSN |
| `SENTRY_ENVIRONMENT` | деплой | Фолбэк для окружения на сервере |
| `NEXT_RUNTIME` | Next.js | `nodejs` или `edge` — по нему `instrumentation.ts` выбирает конфиг |
| `CI` | CI | Подробность логов Sentry при сборке |
| `BASE_URL` | разработчик | Адрес для Playwright-скриншотов вместо поднятия своего сервера |

Все `NEXT_PUBLIC_*` впекаются в бандл при сборке — значение фиксируется в образе, и переменная
на сервере его уже не изменит.

## `apps/web-artists`

| Переменная | Обязательна | Описание |
|---|---|---|
| `NODE_ENV` | нет, `development` | Next выставляет сам |
| `NEXT_PUBLIC_API_URL` | нет, `http://localhost:3000` | Origin API |

Вне схемы: `REFRESH_TOKEN_NAME` читает `src/middleware.ts`, сравнивая имя куки с фолбэком
`refresh_token`. Схема эту переменную не описывает, а `Dockerfile` не передаёт — то есть на
сервере всегда работает фолбэк. Если в API переименовать куку через `REFRESH_TOKEN_NAME`,
гейт портала перестанет видеть сессию, и ничто об этом не предупредит.

## `apps/desktop`

Собственных переменных нет ни одной. Renderer не обращается к `import.meta.env`, а Rust-сторона
не вызывает `std::env::var` — то есть ни одно значение снаружи в приложение сейчас не попадает.

Единственная переменная, которую читает код, — `TAURI_DEV_HOST` в `vite.config.ts`: её
экспортирует сама `tauri dev`, когда сервер раздаётся на устройство в локальной сети, и по ней
конфиг выбирает host и адрес HMR. Задавать её вручную не нужно.

Механика на будущее, из установленного Vite:

- В renderer попадают **только** переменные с префиксом `VITE_` — `resolveEnvPrefix` в
  `vite/dist/node` подставляет `VITE_` по умолчанию, и этот префикс здесь не переопределён.
  Переменная без него существует лишь в процессе сборки.
- Файлы читаются в порядке `.env`, `.env.local`, `.env.<mode>`, `.env.<mode>.local` — каждый
  следующий перекрывает предыдущий. `mode` — это `development` для `vite dev`, `production` для
  `vite build`, и произвольный при `--mode`.
- Валидации нет: схемы вроде `env.schema.ts` у этого приложения не существует.

## `apps/mobile`

Собственных переменных тоже нет. Код читает единственную — `EXPO_OS` в `external-link.tsx` и
`haptic-tab.tsx`, — но её выставляет рантайм Expo, это платформа (`ios` / `android` / `web`), а
не настройка.

Механика, из исходников `@expo/env`:

- В бандл попадают **только** переменные с префиксом `EXPO_PUBLIC_`; они инлайнятся при
  трансформации Metro. Остальные видны лишь процессу CLI.
- Файлы читаются в порядке `.env.<mode>.local`, `.env.local`, `.env.<mode>`, `.env`, где `mode`
  берётся из `NODE_ENV`. **При `NODE_ENV=test` файл `.env.local` намеренно пропускается.**
  Если `NODE_ENV` не задан, список сокращается до `.env.local` и `.env`.
- Уже существующая переменная процесса **не перезаписывается** значением из файла.
- `EXPO_NO_DOTENV=1` отключает загрузку целиком.
- Валидации нет.

Контейнер Expo в `docker-compose.preprod.yaml` получает `NODE_ENV`,
`EXPO_DEVTOOLS_LISTEN_ADDRESS` и `REACT_NATIVE_PACKAGER_HOSTNAME` — это служебные настройки
Metro, а не конфигурация приложения.

:::note `.env` в `apps/mobile` не в игноре
`apps/mobile/.gitignore` исключает только `.env*.local`, поэтому лежащий там `.env` попадёт в
коммит при первом `git add`. Для публичных `EXPO_PUBLIC_*` это безвредно, но секрету в этом
файле не место — в бандл он всё равно попал бы открытым текстом.
:::

## Инфраструктурные

Приложения их не читают — они существуют только для `infra/docker-compose.*.yaml` и деплоя:

| Переменная | Где | Описание |
|---|---|---|
| `DOMAIN` | prod | Домен для nginx и TLS |
| `IMAGE_TAG` | prod | Тег образов, к которому привязан откат |
| `POSTGRES_USER` · `POSTGRES_PASSWORD` · `POSTGRES_DB` · `POSTGRES_PORT` | все стеки | Параметры контейнера Postgres |
| `SHADOW_DATABASE_URL` | preprod | Shadow-база для миграций Prisma |
| `API_PORT` · `WEB_PORT` · `WEB_ARTISTS_PORT` · `DOCS_PORT` · `DESKTOP_PORT` | preprod | Проброс портов |
| `MOBILE_HOST` · `MOBILE_METRO_PORT` · `MOBILE_METRO_UI_PORT` · `MOBILE_WEB_PORT` · `MOBILE_DEVTOOLS_PORT` | preprod | Сервисы Expo за профилем |
| `NGINX_HTTP_PORT` · `NGINX_HTTPS_PORT` | preprod | Порты reverse-proxy |
| `MAILHOG_SMTP_PORT` · `MAILHOG_UI_PORT` | dev, preprod | Порты MailHog |

## Пустое значение — не то же самое, что отсутствие

Правило, которое стоит запомнить прежде шаблонов: **`.default()` в Zod срабатывает только на
отсутствующую переменную.** Пустая строка — это значение, и она проходит через схему как есть.
Строка `PORT=` в `.env` не даёт 3000.

Замеры на реальной схеме `apps/api/env.schema.ts`:

| Запись | Что получает приложение |
|---|---|
| `PORT=` · `REDIS_PORT=` · `SMTP_PORT=` | `0` — молча, сервер слушает случайный порт |
| `S3_FORCE_PATH_STYLE=` | `false`, при дефолте `true` — молча наоборот |
| `S3_REGION=` | пустая строка вместо `us-east-1` |
| `NODE_ENV=` · `STORAGE_DRIVER=` · `ACCESS_TOKEN_NAME=` · `REFRESH_TOKEN_NAME=` · `HEALTH_CHECK_TIMEOUT_MS=` · `DEV_MAIL_LOG_TOKENS=` | ошибка валидации, старт прерван |
| `JWT_ACCESS_EXPIRES_IN=` · `JWT_REFRESH_EXPIRES_IN=` | исключение внутри `ms()` — падение без внятного сообщения Zod |
| `METRICS_TOKEN=` · `USER_WEB_HOST=` · `ARTIST_WEB_HOST=` · `COOKIE_DOMAIN=` · `API_BASE_URL=` · `EMAIL_FROM=` · `SENTRY_DSN=` · `S3_ENDPOINT=` · `S3_BUCKET=` · `S3_ACCESS_KEY=` · `S3_SECRET_KEY=` · `S3_PUBLIC_URL=` | ошибка валидации, хотя переменная объявлена `.optional()` |

Пустую строку безопасно переживают только `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`,
`REDIS_PASSWORD` и обе пары `OAUTH_*` — у них нет проверки формата.

Отсюда правило для шаблонов ниже: **опциональная переменная либо несёт реальное значение, либо
остаётся закомментированной.** Привычка «оставить пустым, чтобы было видно» здесь ломает старт.

В `apps/web-player` этой ловушки нет: его схема пропускает URL через `optionalUrl`, который
превращает пустую строку в `undefined` — специально ради `ENV X=${X}` в Dockerfile, где
непереданный `ARG` приходит пустым.

## Шаблон `.env` для `apps/api`

Порядок групп: обязательные → необязательные с дефолтом → необязательные без дефолта →
условно обязательные. Внутри каждой группы переменные идут по слоям приложения: рантайм,
адреса, данные, аутентификация, файлы, почта, наблюдаемость, разработка.

```env
# ══════════ 1. REQUIRED ══════════
# The process will not start without any one of these four.

# addresses
WEB_HOST=http://localhost:3001
# data
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bitrate
REDIS_HOST=localhost
# auth
JWT_SECRET=change-me-at-least-10-chars

# ══════════ 2. OPTIONAL, WITH A DEFAULT ══════════
# The values below match the schema defaults: drop a line entirely if you like,
# but never leave it empty — an empty string does not fall back to the default.

# runtime
NODE_ENV=development
PORT=3000
TRUST_PROXY_HOPS=0
# data
REDIS_PORT=6379
# auth
JWT_ACCESS_EXPIRES_IN=5m
JWT_REFRESH_EXPIRES_IN=30d
ACCESS_TOKEN_NAME=access_token
REFRESH_TOKEN_NAME=refresh_token
# files
STORAGE_DRIVER=local
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true
# mail
SMTP_PORT=587
# observability
HEALTH_CHECK_TIMEOUT_MS=2000
# development — must be false in production, or the process refuses to start
DEV_MAIL_LOG_TOKENS=false

# ══════════ 3. OPTIONAL, NO DEFAULT ══════════
# Uncomment only together with a real value.

# addresses — origin with no path; the /api prefix is added by the client
#USER_WEB_HOST=http://localhost:3001
#ARTIST_WEB_HOST=http://localhost:3002
#API_BASE_URL=http://localhost:3000
# data
#REDIS_PASSWORD=
# auth — parent domain for the session cookies when the API and the web apps sit on
# different subdomains
#COOKIE_DOMAIN=.bitrate.me
# auth — OAuth; a provider is enabled only by a complete pair
#OAUTH_GOOGLE_CLIENT_ID=
#OAUTH_GOOGLE_CLIENT_SECRET=
#OAUTH_FACEBOOK_APP_ID=
#OAUTH_FACEBOOK_APP_SECRET=
# files
#S3_PUBLIC_URL=https://cdn.bitrate.me
# mail — enables the whole block below; without it reset emails go to the log
#SMTP_HOST=localhost
# observability
#METRICS_TOKEN=at-least-32-characters-long-token
#SENTRY_DSN=
# observability — the schema does not validate these two; src/instrument.ts reads them directly
#SENTRY_ENVIRONMENT=development
#SENTRY_RELEASE=
# development — password for the seeded users, password123 by default
#SEED_USER_PASSWORD=

# ══════════ 4. CONDITIONALLY REQUIRED ══════════
# Each becomes required as soon as its condition holds.

# files — all four are required when STORAGE_DRIVER=s3
#S3_ENDPOINT=https://s3.eu-central-1.amazonaws.com
#S3_BUCKET=bitrate
#S3_ACCESS_KEY=
#S3_SECRET_KEY=
# mail — required once SMTP_HOST is set
#EMAIL_FROM=no-reply@bitrate.me
# mail — only as a pair: either one alone aborts startup
#SMTP_USER=
#SMTP_PASS=
```

## Шаблон `.env` для `apps/web-player`

Обязательных нет: требование трёх URL включает только `ENFORCE_DEPLOY_ENV`, который выставляет
`Dockerfile` при сборке образа, поэтому они попадают в группу условно обязательных.

```env
# ══════════ 1. OPTIONAL, WITH A DEFAULT ══════════
# runtime — Next.js sets NODE_ENV itself; this line only overrides it
#NODE_ENV=development

# ══════════ 2. OPTIONAL, NO DEFAULT ══════════
# observability — without a DSN the SDK starts disabled; the value is inlined into the bundle
#NEXT_PUBLIC_SENTRY_DSN=
#NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
# build — not needed locally; the Dockerfile and CI supply them
#SENTRY_AUTH_TOKEN=
#ENFORCE_DEPLOY_ENV=1

# ══════════ 3. CONDITIONALLY REQUIRED ══════════
# Required under ENFORCE_DEPLOY_ENV, that is, in the image build.
# Set them locally anyway — without them the client has nowhere to call.

# addresses — for the browser and for SSR; inside Docker API_URL is the internal http://api:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
API_URL=http://localhost:3000
# addresses — on a deploy this must be HTTPS, not localhost, and carry no path
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

## Шаблон `.env` для `apps/web-artists`

Обязательных, необязательных без дефолта и условных здесь нет — обе переменные схемы
имеют дефолт.

```env
# ══════════ 1. OPTIONAL, WITH A DEFAULT ══════════
# addresses
NEXT_PUBLIC_API_URL=http://localhost:3000
# runtime — Next.js sets NODE_ENV itself
#NODE_ENV=development
```

`apps/web-artists/env.schema.ts` объявляет `validateEnv()`, но её никто не вызывает — схема
этого приложения сейчас ничего не проверяет. Пустое значение здесь не уронит сборку, но дойдёт
до API-клиента как пустой origin.

`REFRESH_TOKEN_NAME` в шаблоне отсутствует намеренно: `src/middleware.ts` читает её в обход
схемы, а `Dockerfile` не передаёт, так что задать её здесь можно, но на сервере она всё равно
не примени́тся.

## Шаблон `.env` для `apps/desktop`

Ни одной переменной приложение пока не читает, поэтому весь шаблон — заготовка под будущую
конвенцию. Файла в репозитории сейчас нет.

```env
# ══════════ 1. OPTIONAL, NO DEFAULT ══════════
# Nothing in this app reads a variable of its own yet. Only VITE_* reaches the
# renderer through import.meta.env; the Rust side reads no environment at all.

# addresses — the convention to follow once an API client lands here
#VITE_API_URL=http://localhost:3000

# ══════════ 2. SET BY THE TOOLCHAIN ══════════
# `tauri dev` exports this when serving to a device on the LAN, and
# vite.config.ts reads it to pick the host and the HMR address. Do not set it by hand.
#TAURI_DEV_HOST=192.168.1.100
```

## Шаблон `.env.test` для `apps/desktop`

Vite читает `.env.test` только при `--mode test`, а тестового раннера в этом приложении нет —
файл сейчас никем не используется.

```env
# ══════════ 1. OPTIONAL, NO DEFAULT ══════════
# Read only under `vite --mode test`. There is no test runner in this app yet.
#VITE_API_URL=http://localhost:3000
```

## Шаблон `.env` для `apps/mobile`

```env
# ══════════ 1. OPTIONAL, NO DEFAULT ══════════
# Only EXPO_PUBLIC_* is inlined into the bundle; anything else stays in the CLI
# process and is invisible to the app. Values here ship in plain text — no secrets.

# addresses — the convention to follow once an API client lands here
#EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Шаблон `.env.test` для `apps/mobile`

Expo подхватит этот файл при `NODE_ENV=test`; тестового раннера в приложении пока нет.

```env
# ══════════ 1. OPTIONAL, NO DEFAULT ══════════
# Expo reads this file when NODE_ENV=test — and in that mode it deliberately
# skips .env.local, so anything a developer keeps there will not apply.
#EXPO_PUBLIC_API_URL=http://localhost:3000
```
