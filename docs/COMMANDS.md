# Быстрая справка по командам

## 🚀 Основные команды

### Установка и запуск

```bash
# Установка зависимостей
pnpm install

# Запуск в Dev режиме (все сервисы)
docker compose up -d

# Запуск без Docker
pnpm dev
```

### Build и тестирование

```bash
# Сборка всех проектов
pnpm build

# Очистка dist/ директорий (перед git push!)
pnpm clean:dist

# Линтинг
pnpm lint

# Форматирование
pnpm format

# Проверка типов
pnpm check-types
```

---

## 🐳 Docker команды

### Управление контейнерами

```bash
# Запуск всех сервисов
docker compose up -d

# Запуск с пересборкой
docker compose up -d --build

# Остановка
docker compose down

# Остановка с удалением volumes
docker compose down -v

# Перезапуск конкретного сервиса
docker compose restart api
```

### Логи и отладка

```bash
# Все логи
docker compose logs -f

# Логи конкретного сервиса
docker compose logs -f api
docker compose logs -f web
docker compose logs -f admin

# Вход в контейнер
docker compose exec api sh
docker compose exec web sh

# Статус контейнеров
docker compose ps
```

### Profiles

```bash
# Запуск Mobile (Expo)
docker compose --profile mobile up -d mobile

# Запуск Desktop (без VNC)
docker compose --profile desktop up -d desktop

# Запуск всех профилей
docker compose --profile mobile --profile desktop up -d
```

---

## 📱 Mobile (Expo)

### Основные команды

```bash
# Docker
docker compose --profile mobile up -d mobile
docker compose logs -f mobile

# Нативно (рекомендуется)
cd apps/mobile
pnpm start
pnpm start --tunnel  # Tunnel mode
```

### Отладка

```bash
# Открыть DevTools (QR-код)
open http://localhost:19000

# Проверка Metro Bundler
curl http://localhost:8081/status

# Очистка кэша
docker compose exec mobile npx expo start --clear

# Переменные окружения
docker compose exec mobile printenv | grep EXPO
```

### Установка пакетов

```bash
# Всегда на ХОСТЕ!
cd apps/mobile
pnpm add expo@latest

# Перезапуск контейнера
docker compose restart mobile
```

---

## 🖥️ Desktop (Tauri)

### Основные команды

```bash
# Локально (рекомендуется)
cd apps/desktop
pnpm dev

# Docker UI only
docker compose --profile desktop up -d desktop
open http://localhost:1420

# Docker VNC (полное GUI)
cd apps/desktop
docker compose -f docker-compose.vnc.yml up -d --build
open http://localhost:6080/vnc.html
```

### VNC команды

```bash
# Запуск
docker compose -f docker-compose.vnc.yml up -d

# Логи
docker compose -f docker-compose.vnc.yml logs -f

# Остановка
docker compose -f docker-compose.vnc.yml down

# Проверка процессов
docker compose -f docker-compose.vnc.yml exec desktop-vnc ps aux | grep Xvfb

# Вход в контейнер
docker compose -f docker-compose.vnc.yml exec desktop-vnc bash
```

---

## 🎨 API (NestJS)

### Основные команды

```bash
# Разработка
cd apps/api
pnpm dev

# Сборка
pnpm build

# Production
pnpm start:prod
```

### Prisma

```bash
cd apps/api

# Генерация Client
pnpm prisma generate

# Миграции
pnpm prisma migrate dev
pnpm prisma migrate deploy  # Production

# Prisma Studio
pnpm prisma studio

# Заполнить БД тестовыми данными
pnpm seed
```

### База данных

```bash
# Войти в PostgreSQL
docker compose exec postgres psql -U spotify

# Резервная копия
docker compose exec postgres pg_dump -U spotify spotify > backup.sql

# Восстановление
docker compose exec -T postgres psql -U spotify < backup.sql
```

---

## 🌐 Web (Next.js)

```bash
cd apps/web

# Разработка
pnpm dev

# Сборка
pnpm build

# Production
pnpm start

# Линтинг
pnpm lint
```

---

## 🛠️ Admin (Kottster + Vite)

```bash
cd apps/admin

# Разработка
pnpm dev

# Сборка
pnpm build

# Preview
pnpm preview
```

---

## 📦 Packages

### @spotify/ui-react

```bash
cd packages/ui-react

# Разработка (watch mode)
pnpm dev

# Сборка
pnpm build

# Storybook
pnpm storybook

# SVGR (генерация React компонентов из SVG)
pnpm svgr:build
pnpm svgr:dev  # watch mode
```

### @spotify/tokens

```bash
cd packages/tokens

# Добавить новую иконку
cp icon.svg icons/
cd ../ui-react
pnpm svgr:build
```

---

## 🧹 Очистка

### Проект

```bash
# Очистка dist/
pnpm clean:dist

# Очистка node_modules
find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +

# Переустановка
pnpm install
```

### Docker

```bash
# Удалить остановленные контейнеры
docker container prune

# Удалить неиспользуемые образы
docker image prune -a

# Удалить неиспользуемые volumes
docker volume prune

# Полная очистка (ОСТОРОЖНО!)
docker system prune -a --volumes
```

---

## 🔍 Диагностика

### Порты

```bash
# Проверить используемые порты
lsof -i :3000-4000  # Linux/macOS
netstat -ano | findstr :3000  # Windows

# Убить процесс на порту
lsof -ti:3000 | xargs kill -9
```

### Процессы

```bash
# Node.js процессы
ps aux | grep node

# Docker процессы
docker ps
docker stats

# Использование памяти
docker system df
```

### Логи

```bash
# Docker логи
docker compose logs --tail=100 -f api

# Файловые логи (если настроены)
tail -f apps/api/logs/error.log
tail -f apps/api/logs/combined.log
```

---

## 🎯 Makefile (Linux/macOS/WSL)

```bash
# Первый запуск
make init

# Разработка
make dev

# Остановка
make stop

# Логи
make logs
make logs-api
make logs-web

# База данных
make db-migrate
make db-seed
make db-studio

# Очистка
make clean
make clean-volumes

# Тесты
make test
make test-api

# Помощь
make help
```

---

## 📚 Дополнительные ресурсы

- **[README.md](../README.md)** - основная документация
- **[MOBILE.md](./MOBILE.md)** - детальная документация Mobile
- **[DESKTOP.md](./DESKTOP.md)** - детальная документация Desktop
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - решение проблем
- **[VNC-README.md](../apps/desktop/VNC-README.md)** - VNC для Desktop

---

## 💡 Полезные алиасы

Добавьте в `~/.bashrc` или `~/.zshrc`:

```bash
# Docker Compose сокращения
alias dc='docker compose'
alias dcu='docker compose up -d'
alias dcd='docker compose down'
alias dcl='docker compose logs -f'
alias dcr='docker compose restart'

# Spotify Clone
alias sc-dev='docker compose up -d'
alias sc-stop='docker compose down'
alias sc-clean='pnpm clean:dist && docker compose down -v'
alias sc-logs='docker compose logs -f'
alias sc-build='pnpm clean:dist && pnpm build'
alias sc-push='pnpm clean:dist && git push'

# Mobile
alias mobile-dev='docker compose --profile mobile up -d mobile'
alias mobile-logs='docker compose logs -f mobile'
alias mobile-stop='docker compose stop mobile'

# Desktop
alias desktop-dev='cd apps/desktop && pnpm dev'
alias desktop-vnc='cd apps/desktop && docker compose -f docker-compose.vnc.yml up -d'
```

Примените изменения:
```bash
source ~/.bashrc  # или source ~/.zshrc
```

Теперь можно использовать:
```bash
sc-dev     # Запуск всех сервисов
sc-logs    # Просмотр логов
sc-clean   # Полная очистка
sc-push    # Безопасный push (с очисткой dist)
```
