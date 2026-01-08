# Troubleshooting (Решение проблем)

## 🐛 Часто встречающиеся проблемы

### Build / Git Push

#### EACCES: permission denied при git push

**Симптомы:**
```bash
Error EACCES: permission denied, unlink '/path/to/dist/file'
husky - pre-push script failed (code 1)
```

**Причина:**  
Docker контейнеры создают файлы в `dist/` директориях от имени другого пользователя (обычно root или nfsnobody), и ваш пользователь не может их удалить при сборке на хосте.

**Решение (Linux/macOS/WSL):**

```bash
# 1. Очистить все dist/ директории
pnpm clean:dist

# 2. Повторить git push
git push
```

**Решение (Windows PowerShell/CMD):**

```powershell
# PowerShell
Get-ChildItem -Path . -Filter "dist" -Recurse -Directory | Where-Object { $_.FullName -notlike "*node_modules*" } | Remove-Item -Recurse -Force

# Или используйте npm script
npm run clean:dist

# Повторить git push
git push
```

**Решение для Windows (если не работает):**

1. **Через Docker контейнер:**
```powershell
# Войти в контейнер и удалить изнутри
docker compose exec api rm -rf /app/apps/api/dist
docker compose exec web rm -rf /app/apps/web/.next
```

2. **Остановить контейнеры и очистить:**
```powershell
# Остановить все контейнеры
docker compose down

# Удалить dist директории
Get-ChildItem -Path . -Filter "dist" -Recurse -Directory | Remove-Item -Recurse -Force
```

3. **Крайний вариант (пересоздать bind mounts):**
```powershell
docker compose down -v
docker volume prune -f
docker compose up -d --build
```

**Альтернативное решение (Linux/macOS с sudo):**

```bash
# Остановить контейнеры и удалить вручную
docker compose down
sudo find . -type d -name 'dist' -not -path './node_modules/*' -exec rm -rf {} +
```

**Профилактика:**

**Linux/macOS/WSL:**
```bash
# Перед git push всегда запускайте
pnpm clean:dist

# Или добавьте в .husky/pre-push
#!/bin/sh
pnpm clean:dist
pnpm build
```

**Windows (PowerShell):**
```powershell
# Создайте скрипт clean-dist.ps1
Get-ChildItem -Path . -Filter "dist" -Recurse -Directory | 
  Where-Object { $_.FullName -notlike "*node_modules*" } | 
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# Используйте перед push
.\clean-dist.ps1
git push
```

**WSL2 (рекомендуется для Windows):**
```bash
# В WSL2 используйте Linux команды
pnpm clean:dist
git push
```

---

### Windows специфичные проблемы

#### Line endings (CRLF vs LF)

**Симптомы:**
```
warning: LF will be replaced by CRLF
```

**Решение:**

```powershell
# Настроить Git для автоматической конвертации
git config --global core.autocrlf true

# Для WSL2
git config --global core.autocrlf input
```

#### Docker Desktop не запускается

**Проверьте:**

1. **WSL2 установлен:**
```powershell
wsl --list --verbose
wsl --install  # если не установлен
```

2. **Виртуализация включена в BIOS:**
   - Перезагрузите ПК → войдите в BIOS
   - Включите Intel VT-x или AMD-V
   - Включите Hyper-V в Windows Features

3. **Docker Desktop Settings:**
   - Settings → Resources → WSL Integration
   - Включите интеграцию с вашим WSL дистрибутивом

#### Медленная работа в WSL2

**Рекомендация:**

```bash
# Работайте ВНУТРИ WSL файловой системы, не в /mnt/c
cd ~
git clone https://github.com/Lordpluha/spotify-clone.git
cd spotify-clone
pnpm install
```

**Не рекомендуется:**
```bash
# Медленно! Не делайте так
cd /mnt/c/Users/YourName/Projects/spotify-clone
```

#### Paths с пробелами или кириллицей

**Проблема:**
```
Error: ENOENT: no such file or directory
```

**Решение:**

```bash
# Используйте пути без пробелов и кириллицы
# Плохо: C:\Мои документы\spotify clone\
# Хорошо: C:\projects\spotify-clone\

# Или работайте в WSL
cd ~/projects/spotify-clone
```

---

### Docker

#### Port is already allocated

**Симптомы:**
```bash
Error: Bind for 0.0.0.0:3000 failed: port is already allocated
```

**Решение:**

```bash
# Найти процесс на порту
lsof -i :3000  # Linux/macOS
# или
netstat -ano | findstr :3000  # Windows

# Остановить процесс
kill -9 <PID>

# Или изменить порт в docker-compose.yaml
ports:
  - "3001:3000"  # вместо 3000:3000
```

#### Container не запускается

```bash
# Просмотр логов
docker compose logs <service-name>

# Пересборка без кэша
docker compose build --no-cache <service-name>
docker compose up -d <service-name>

# Полная очистка
docker compose down -v
docker compose up -d --build
```

---

### Mobile (Expo)

#### Failed to download remote update

**Причина:** Expo Go не может подключиться к Metro Bundler.

**Решение:**

1. **Используйте tunnel mode (уже настроен по умолчанию):**
   ```bash
   docker compose --profile mobile up -d mobile
   # Найдите URL вида exp://u.expo.dev/...
   docker compose logs mobile
   ```

2. **Или настройте локальную сеть:**
   ```bash
   # 1. Узнайте ваш IP
   ip addr show | grep "inet " | grep -v 127.0.0.1
   
   # 2. Добавьте в .env
   echo "MOBILE_HOST=192.168.0.31" >> .env  # ваш IP
   
   # 3. Перезапустите
   docker compose restart mobile
   ```

#### ERR_PNPM_UNEXPECTED_STORE

**Причина:** Попытка выполнить `pnpm install` внутри контейнера, где pnpm store находится на хосте.

**Решение:**

```bash
# Всегда устанавливайте пакеты на ХОСТЕ, не в контейнере
cd apps/mobile
pnpm add expo@latest

# Затем перезапустите контейнер
docker compose restart mobile
```

#### QR-код не появляется

```bash
# Откройте браузер
open http://localhost:19000

# Или используйте прямой URL из логов
docker compose logs mobile | grep "exp://"
```

---

### Desktop (Tauri)

#### VNC черный экран

**Причина:** Xvfb еще не запустился.

**Решение:**

```bash
# Подождите 30-60 секунд после запуска контейнера
# Проверьте логи
docker compose -f apps/desktop/docker-compose.vnc.yml logs -f

# Убедитесь что Xvfb запущен
docker compose -f apps/desktop/docker-compose.vnc.yml exec desktop-vnc ps aux | grep Xvfb
```

#### Медленная работа VNC

**Причина:** VNC не использует GPU ускорение.

**Решение:**

Для ежедневной разработки используйте локальный запуск:
```bash
cd apps/desktop
pnpm dev
```

VNC подходит только для:
- CI/CD тестирования
- Демонстраций
- Разработки на удаленном сервере

---

### API (NestJS)

#### Prisma Client not found

```bash
# Сгенерировать Prisma Client
cd apps/api
pnpm prisma generate

# Перезапустить контейнер
docker compose restart api
```

#### Database connection refused

```bash
# Проверить что PostgreSQL запущен
docker compose ps postgres

# Проверить переменные окружения
docker compose exec api printenv | grep DATABASE

# Перезапустить БД
docker compose restart postgres
docker compose restart api
```

---

### Web / Admin (Next.js / Vite)

#### Module not found

```bash
# Переустановить зависимости
pnpm install

# Очистить кэш
rm -rf .next   # Next.js
rm -rf dist    # Vite
rm -rf node_modules/.vite  # Vite cache

# Перезапустить
pnpm dev
```

#### Hot reload не работает

**В Docker:**

Убедитесь что в `vite.config.ts` или `next.config.ts`:

```ts
export default {
  server: {
    host: '0.0.0.0',  // Важно для Docker
    port: 3000,
    watch: {
      usePolling: true  // Для некоторых ФС
    }
  }
}
```

---

## 📋 Быстрые команды

### Полная очистка и перезапуск

```bash
# 1. Остановить все
docker compose down -v

# 2. Очистить dist/
pnpm clean:dist

# 3. Очистить node_modules (опционально)
find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +

# 4. Переустановить
pnpm install

# 5. Запустить
docker compose up -d --build
```

### Проверка статуса

```bash
# Все контейнеры
docker compose ps

# Логи всех сервисов
docker compose logs -f

# Логи конкретного сервиса
docker compose logs -f api

# Использование портов
lsof -i :3000-4000
```

### Очистка Docker

```bash
# Удалить неиспользуемые образы
docker image prune -a

# Удалить неиспользуемые volumes
docker volume prune

# Полная очистка (ОСТОРОЖНО!)
docker system prune -a --volumes
```

---

## 🆘 Нужна помощь?

1. Проверьте [README.md](../README.md) - основная документация
2. Проверьте логи: `docker compose logs -f <service>`
3. Создайте Issue: [GitHub Issues](https://github.com/Lordpluha/spotify-clone/issues)
4. Проверьте существующие Issues
