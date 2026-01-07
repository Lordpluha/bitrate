# Music Platform (Spotify Clone)

## Usefull links
- Chromatic - https://www.chromatic.com/library?appId=68787858d0b6a0a00b0ca47f
- Storybook - https://spotify-clone-ui-git-develop-vladyslavs-projects-cc52700b.vercel.app/
- Web: https://spotify-clone-web-olive.vercel.app/

# 🚀 Quick Start

## Prerequisites
- Node.js >= 20
- pnpm 10.27.0
- Docker & Docker Compose (optional)

## Installation

```bash
# Install dependencies
pnpm install
```

## Development

Вы можете запустить проект тремя способами:

### 📦 Option 1: Native (без Docker)

Для локальной разработки без Docker:

```bash
# 1. Запустить только базу данных
docker-compose -f docker-compose.minimal.yaml up -d

# 2. Запустить все приложения
pnpm dev

# Доступ к сервисам:
# - API: http://localhost:3000
# - Web: http://localhost:3001
# - Admin: http://localhost:3002
```

### 🐳 Option 2: Full Docker (рекомендуется)

#### Используя Makefile (Linux/macOS/WSL)

```bash
# Первый запуск (сборка + миграции + seed)
make init

# Последующие запуски
make dev

# Остановка
make stop

# Просмотр логов
make logs

# Миграции БД
make db-migrate

# Заполнить тестовыми данными
make db-seed

# Полный список команд
make help
```

#### Используя pnpm скрипты (кросс-платформенно)

```bash
# Первый запуск
pnpm docker:dev:build
pnpm docker:db:migrate
pnpm docker:db:seed

# Последующие запуски
pnpm docker:dev

# Остановка
pnpm docker:down

# Просмотр логов
pnpm docker:logs          # все логи
pnpm docker:logs:api      # только API
pnpm docker:logs:web      # только Web

# Миграции БД
pnpm docker:db:migrate
pnpm docker:db:seed

# Интерактивное управление
pnpm docker:manage
```

#### Используя Docker Compose напрямую

```bash
# Первый запуск
docker-compose up -d --build
docker-compose exec api pnpm --filter @spotify/api run db:migration:start
docker-compose exec api pnpm --filter @spotify/api run seed

# Последующие запуски
docker-compose up -d

# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f

# Миграции
docker-compose exec api pnpm --filter @spotify/api run db:migration:start
```

### 📱 Mobile & Desktop (опционально)

```bash
# Mobile (Expo)
make mobile-dev              # или pnpm docker:mobile:dev
make mobile-qr               # Показать QR для подключения

# Desktop (Tauri UI)
make desktop-dev             # или pnpm docker:desktop:dev

# Для полноценной разработки рекомендуется нативный запуск:
cd apps/mobile && pnpm start
cd apps/desktop && pnpm dev
```

## 🌐 Доступ к сервисам

| Сервис | URL | Порт |
|--------|-----|------|
| Web Frontend | http://localhost:3001 | 3001 |
| API Backend | http://localhost:3000 | 3000 |
| API Docs (Swagger) | http://localhost:3000/swagger | - |
| Admin Panel | http://localhost:3002 | 3002 |
| PostgreSQL | localhost:5432 | 5432 |
| Redis | localhost:6379 | 6379 |

## 📚 Документация

- **[.github/CICD.md](.github/CICD.md)** - CI/CD pipelines и workflows
- **[Makefile](Makefile)** - Все доступные команды

## 🐛 Troubleshooting

### Порты заняты
```bash
# Найти процесс использующий порт
sudo lsof -i :3000
# или
sudo netstat -tulpn | grep :3000

# Остановить все Docker сервисы
docker-compose down
```

### Проблемы с БД
```bash
# Пересоздать БД
docker-compose down -v
docker-compose up -d postgres
docker-compose exec api pnpm --filter @spotify/api run db:migration:start

# Проверка подключения
docker-compose exec postgres psql -U admin -d spotify
```

### Очистка Docker
```bash
# Удалить неиспользуемые образы
docker image prune -a

# Освободить место (осторожно!)
docker system prune -af --volumes

# Пересобрать без кэша
docker-compose build --no-cache
```

### Ошибки hot reload
```bash
# Перезапустить конкретный сервис
docker-compose restart api

# Пересобрать и перезапустить
docker-compose up -d --build api
```

### Логи и отладка
```bash
# Просмотр логов сервиса
docker-compose logs -f api

# Войти в контейнер
docker-compose exec api sh

# Проверить статус
docker-compose ps
```

## 🛠️ Полезные команды

### Makefile команды

```bash
make dev              # Запустить development
make stop             # Остановить все сервисы
make restart          # Перезапустить
make logs             # Просмотр логов
make db-migrate       # Применить миграции
make db-seed          # Заполнить БД
make db-studio        # Открыть Prisma Studio
make clean            # Очистить volumes
make prod             # Запустить production
```

### npm/pnpm скрипты

```bash
pnpm dev                    # Запустить все приложения (native)
pnpm build                  # Собрать все приложения
pnpm lint                   # Линтинг
pnpm format                 # Форматирование
pnpm docker:dev             # Docker development
pnpm docker:manage          # Интерактивное управление Docker
```

### Database команды

```bash
# Через Makefile
make db-migrate       # Применить миграции
make db-seed          # Заполнить тестовыми данными
make db-studio        # Открыть Prisma Studio
make db-backup        # Создать бэкап

# Через pnpm
pnpm docker:db:migrate
pnpm docker:db:seed
pnpm docker:db:studio

# Напрямую в API
cd apps/api
pnpm run db:migration:start
pnpm run seed
pnpm run db:ui
```

## 📦 Tech Stack

### Client
- Next.js 15 App Router + Server Actions + middleware, TypeScript, PWA
- TurboBuild
- TailwindCSS, Module.css, clsx
- Zustand, React Hook Form + Zod
- i18n, MSW
- @tanstack/react-query (Codegen via openApiTS) + Socket.io
- Storybook, Shadcn UI
- Feature-Sliced Design
- Sentry
#### Testing
- Vitest (Unit)
- RTL (Intergration)
- msw + openapi-msw (mocks)
- Playwright (E2E)

### Android
- React Native, NativeBase, Zustand, Faker
- React Navigation
- i18n
- @tanstack/react-query + AsyncStorage + Persistor + Socket.io
- Sentry
#### Testing
- Jest (Unit)
- RTL/Native (Integration)
- detox (E2E)

### iOS
- Flutter
- Sentry
#### Testing
- Flutter testing utils

### MacOS
- Flutter
- Sentry
#### Testing
- Flutter testing utils

### Windows
- Tauri

### Linux
- Tauri

### Admin Panel
- Kottster app based on postgresql schema

### Backend
- NestJS, TypeScript
- PostgreSQL via Prisma
- REST API, SSE, Socket.io, Long-polling, RabbitMQ
- JWT, OAuth(google, facebook, discord), CORS, CSP, 2FA, Redis
- Swagger + Zod (codegen sync)
- Postfix + NodeMailer, Multer
- @nestjs/throttler, Fingerprint auth
- ConfigModule, @nestjs/schedule (CRON)
- Prometheus + Grafana, nestjs-pino
- Sentry
#### Testing
- Jest
#### Security
- SHA-3
- CSP
- Helmet
- Rate-limitting + Ip-ban
- SSL/TLS
- CSRF
- Global error filters throught `@Catch`
- Files security
- Cloudflare
- RBAC/ACL


### Infrastructure
- Monorepo: TurboRepo + Pnpm
- Linting: Biome
- Git tools: Husky, Lint-staged, Commit-lint, Gitflow
- CI/CD: GitHub Actions, Docker, self-hosted Sentry
- Env: .env per app + .env.schema (Zod-based)
- Backup: `redis-cli --rdb`
- Docs: Mintlify

### Future features
- Microservices, Micro-Frontends
- CDN + S3, Logs, Metrics

## 📄 License

MIT © 2025 Lordpluha
