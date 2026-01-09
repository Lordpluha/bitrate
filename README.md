# Music Platform (Spotify Clone)

## 📚 Документация

- **[README.md](README.md)** - основная документация (вы здесь)
- **[MOBILE.md](docs/MOBILE.md)** - детальная документация Mobile
- **[DESKTOP.md](docs/DESKTOP.md)** - детальная документация Desktop

## 🔗 Полезные ссылки

- Chromatic - https://www.chromatic.com/library?appId=68787858d0b6a0a00b0ca47f
- Storybook - https://spotify-clone-ui-git-develop-vladyslavs-projects-cc52700b.vercel.app/
- Web: https://spotify-clone-web-olive.vercel.app/

---

# 🚀 Quick Start

## 💻 Системные требования

### Минимальные требования

- **CPU:** 4 ядра (рекомендуется 8+)
- **RAM:** 8 GB (рекомендуется 16+ GB для Docker)
- **Диск:** 80+ GB свободного места (для всех Docker образов)
- **ОС:** Linux, macOS, Windows 10/11 с WSL2

---

## 📦 Зависимости по приложениям

### 🌐 Общие зависимости (для всех приложений)

Необходимы для работы с любой частью проекта:

| Инструмент | Версия | Установка |
|------------|--------|-----------|
| **Node.js** | >= 20.x | [Linux](#linux-nodejs) • [Windows](#windows-nodejs) • [macOS](#macos-nodejs) |
| **pnpm** | 10.27.0 | `npm install -g pnpm@10.27.0` |
| **Git** | >= 2.x | [git-scm.com](https://git-scm.com/) |
| **Docker** | >= 24.x | [Linux](#linux-docker) • [Windows](#windows-docker) • [macOS](#macos-docker) |
| **Docker Compose** | >= 2.x | Включен в Docker |

---

## 📲 Дополнительные зависимости

### 📱 Mobile App (React Native + Expo)

<details>
<summary><b>Для Android разработки</b></summary>

**Все платформы:**

1. **Android Studio**
   - Linux: [developer.android.com/studio](https://developer.android.com/studio)
   - Windows: [developer.android.com/studio](https://developer.android.com/studio)
   - macOS: `brew install --cask android-studio`

2. **Java Development Kit 17**
   - Linux: `sudo apt install -y openjdk-17-jdk`
   - Windows: [adoptium.net](https://adoptium.net/)
   - macOS: `brew install openjdk@17`

3. **Android SDK** (устанавливается через Android Studio)

4. **Эмулятор Android** (через Android Studio) или физическое устройство
</details>

<details>
<summary><b>Для iOS разработки (только macOS)</b></summary>

1. **Xcode** (из App Store)
   ```bash
   xcode-select --install
   ```

2. **iOS Simulator** (включен в Xcode)

3. **CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```
</details>

**Для тестирования на физическом устройстве:**

- Установите **Expo Go** на телефон:
  - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

**Способы запуска:**

1. **Docker (только Metro Bundler + tunnel):**
   ```bash
   docker compose --profile mobile up -d mobile
   # Откройте http://localhost:19000 для QR-кода
   ```

2. **Нативно (рекомендуется):**
   ```bash
   cd apps/mobile
   pnpm install
   pnpm start
   ```

**⚠️ Рекомендация:** Для Mobile разработки используйте нативный запуск, Docker только для демонстрации.

---

### 🖥️ Desktop App (Tauri + React)

<details>
<summary><b>Linux (Ubuntu/Debian)</b></summary>

```bash
# Системные библиотеки для WebView
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  pkg-config

# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Tauri CLI (устанавливается автоматически при pnpm install)
```
</details>

<details>
<summary><b>Windows</b></summary>

**⚠️ Для Windows разработчиков настоятельно рекомендуется использовать WSL2!**

**Быстрая установка WSL2:**

```powershell
# PowerShell как Администратор
wsl --install
# Перезагрузить компьютер
```

**В WSL2 (после установки):**

```bash
# Установить зависимости (как в Linux)
sudo apt update
sudo apt install -y build-essential libwebkit2gtk-4.1-dev curl

# Установить Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

<details>
<summary><i>Альтернатива: Нативная Windows (не рекомендуется)</i></summary>

1. **Visual Studio 2022 Build Tools**
   - Скачайте с [visualstudio.microsoft.com](https://visualstudio.microsoft.com/downloads/)
   - Выберите "Desktop development with C++"

2. **WebView2 Runtime** (обычно уже установлен в Windows 11)
   - Скачайте с [microsoft.com](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

3. **Rust**
   ```powershell
   # Скачайте rustup-init.exe с https://rustup.rs/
   # Запустите установщик и следуйте инструкциям
   ```

4. **После установки проверьте:**
   ```powershell
   rustc --version
   cargo --version
   ```
</details>

</details>

<details>
<summary><b>macOS</b></summary>

```bash
# Xcode Command Line Tools
xcode-select --install

# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Tauri CLI (устанавливается автоматически при pnpm install)
```
</details>

**Способы запуска:**

1. **Нативно (рекомендуется):**
   ```bash
   cd apps/desktop
   pnpm install
   pnpm dev  # Запустит Tauri приложение с нативным окном
   ```

2. **Docker UI only (без Tauri backend):**
   ```bash
   docker compose --profile desktop up -d desktop
   # Откройте http://localhost:1420 в браузере
   ```

3. **Docker с VNC (полное GUI через браузер):**
   ```bash
   cd apps/desktop
   docker compose -f docker-compose.vnc.yml up --build
   # Откройте http://localhost:6080/vnc.html
   # Пароль: spotify
   ```

**⚠️ Рекомендация:** Для Desktop разработки используйте нативный запуск. Docker VNC полезен для CI/CD или демонстрации.

---

## 📥 Installation

После установки всех необходимых системных зависимостей, установите зависимости проекта:

```bash
# Install dependencies
pnpm install
```

### 🪟 Windows разработчики

**Рекомендуется использовать WSL2** для лучшей совместимости и производительности:

1. Установите WSL2: `wsl --install` (PowerShell как Администратор)
2. Клонируйте проект **внутри WSL**: `cd ~ && git clone ...`
3. Работайте в WSL терминале - все команды будут работать как в Linux

**Если НЕ используете WSL2:**
- Перед git push удаляйте dist через Docker: `docker compose down && docker compose run --rm api sh -c "find /app -type d -name 'dist' -exec rm -rf {} +"`

---

## ✅ Проверка установки

После установки необходимых зависимостей для вашего приложения, проверьте версии:

### Общие инструменты (для всех)

```bash
node --version          # >= v20.x
pnpm --version          # 10.27.0
git --version           # >= 2.x
docker --version        # >= 24.x
docker compose version  # >= 2.x
```

### Для Mobile приложения

```bash
java --version          # 17.x (для Android)
```

### Для Desktop приложения

```bash
rustc --version         # любая стабильная версия
cargo --version         # любая стабильная версия
```

Если все необходимые команды выполняются успешно, вы готовы к разработке! ✨

---

## 🛠️ Development

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

#### 📱 Mobile (React Native + Expo)

**⚠️ Важно:** Для мобильной разработки рекомендуется нативный запуск.

**Быстрый запуск:**

```bash
# Docker (Metro Bundler + Tunnel)
docker compose --profile mobile up -d mobile
# Откройте http://localhost:19000 для QR-кода

# Нативно (рекомендуется)
cd apps/mobile && pnpm start
```

**Подключение:**
- Установите [Expo Go](https://expo.dev/client) на телефон
- Отсканируйте QR-код с http://localhost:19000
- Или введите tunnel URL из логов

📚 **[Подробная документация →](docs/MOBILE.md)**

---

#### 🖥️ Desktop (Tauri + React)

**3 способа запуска:**

**1. Локально (рекомендуется):**
```bash
cd apps/desktop && pnpm dev
```

**2. Docker UI only:**
```bash
docker compose --profile desktop up -d desktop
# Откройте http://localhost:1420
```

**3. Docker VNC (полное GUI):**
```bash
cd apps/desktop
docker compose -f docker-compose.vnc.yml up --build
# Откройте http://localhost:6080/vnc.html (пароль: spotify)
```

📚 **[Подробная документация →](docs/DESKTOP.md)** • **[VNC Guide →](apps/desktop/VNC-README.md)**

## 🌐 Доступ к сервисам

| Сервис | URL | Порт |
|--------|-----|------|
| Web Frontend | http://localhost:3001 | 3001 |
| API Backend | http://localhost:3000 | 3000 |
| API Docs (Swagger) | http://localhost:3000/swagger | - |
| Admin Panel | http://localhost:3002 | 3002 |
| Mobile (Metro) | http://localhost:8081 | 8081 |
| Mobile (DevTools) | http://localhost:19000 | 19000 |
| Desktop (Vite) | http://localhost:1420 | 1420 |
| Desktop VNC (noVNC) | http://localhost:6080/vnc.html | 6080 |
| Desktop VNC | vnc://localhost:5900 | 5900 |
| PostgreSQL | localhost:5432 | 5432 |
| Redis | localhost:6379 | 6379 |

## 📦 Размеры Docker образов

Приблизительные размеры образов после сборки:

| Образ | Размер | Описание |
|-------|--------|----------|
| `desktop-desktop-vnc` | ~12.5 GB | Desktop с VNC (включает Rust, Tauri, X11, VNC сервер) |
| `spotify-clone-mobile` | ~10 GB | Mobile (Node.js, Expo, React Native зависимости) |
| `spotify-clone-api` | ~9.4 GB | Backend API (NestJS, Prisma, зависимости) |
| `spotify-clone-web` | ~9.5 GB | Web Frontend (Next.js, React, зависимости) |
| `spotify-clone-admin` | ~9.4 GB | Admin Panel (Kottster, зависимости) |
| `spotify-clone-desktop` | ~9.4 GB | Desktop UI only (Vite, React) |
| `postgres:16-alpine` | ~280 MB | База данных PostgreSQL |
| `redis:7-alpine` | ~41 MB | Redis для кэширования |

**Итого:** ~70 GB для всех образов (при полной сборке всех сервисов)

**Рекомендации для экономии места:**

```bash
# Используйте минимальную конфигурацию для разработки
docker compose -f docker-compose.minimal.yaml up -d  # Только postgres + redis (~320 MB)

# Запускайте только нужные сервисы
docker compose up -d api web  # API + Web (~20 GB)

# Очистка неиспользуемых образов
docker image prune -a

# Полная очистка (осторожно!)
docker system prune -af --volumes
```

---

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

---

## 🐛 Troubleshooting

### EACCES: permission denied при git push

Docker контейнеры создают файлы в `dist/` от имени root/nfsnobody. Перед git push:

```bash
pnpm clean:dist
git push
```

### Порты заняты

```bash
# Найти процесс использующий порт
sudo lsof -i :3000

# Остановить все Docker сервисы
docker compose down
```

### Проблемы с БД

```bash
# Пересоздать БД
docker compose down -v
docker compose up -d postgres
docker compose exec api pnpm --filter @spotify/api run db:migration:start
```

### Очистка Docker

```bash
# Удалить неиспользуемые образы
docker image prune -a

# Пересобрать без кэша
docker compose build --no-cache
```

---

## 📄 License

MIT © 2025 Lordpluha
