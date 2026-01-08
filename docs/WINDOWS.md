# 🪟 Руководство для Windows разработчиков

## 🎯 Рекомендуемая настройка

Для наилучшего опыта разработки на Windows **настоятельно рекомендуется использовать WSL2** (Windows Subsystem for Linux).

### Почему WSL2?

✅ **Преимущества:**
- Полная совместимость с Linux инструментами
- Быстрая работа файловой системы
- Нативная поддержка Docker
- Все команды из документации работают как есть
- Нет проблем с line endings (CRLF vs LF)

❌ **Нативная Windows (PowerShell/CMD):**
- Медленнее работа Docker
- Нужны специальные команды
- Проблемы с путями и правами доступа
- Ограниченная поддержка shell скриптов

---

## 📦 Установка WSL2 (рекомендуется)

### Шаг 1: Установить WSL2

```powershell
# Откройте PowerShell как Администратор

# Установить WSL2 с Ubuntu
wsl --install

# Перезагрузить компьютер
```

После перезагрузки Ubuntu запустится автоматически. Создайте пользователя и пароль.

### Шаг 2: Обновить WSL до версии 2

```powershell
# Проверить версию WSL
wsl --list --verbose

# Если версия 1, обновить до 2
wsl --set-version Ubuntu 2

# Сделать WSL2 по умолчанию
wsl --set-default-version 2
```

### Шаг 3: Установить зависимости в WSL

```bash
# Открыть WSL терминал
wsl

# Обновить пакеты
sudo apt update && sudo apt upgrade -y

# Установить необходимые инструменты
sudo apt install -y build-essential git curl wget

# Установить Node.js через nvm (рекомендуется)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Перезагрузить терминал или
source ~/.bashrc

# Установить Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Проверить
node --version  # должно быть v20.x.x
npm --version

# Установить pnpm
npm install -g pnpm@10.27.0

# Проверить
pnpm --version  # должно быть 10.27.0
```

### Шаг 4: Установить Docker Desktop

1. Скачать Docker Desktop для Windows: https://www.docker.com/products/docker-desktop
2. Установить с настройками по умолчанию
3. В настройках Docker Desktop:
   - Settings → General → Enable "Use the WSL 2 based engine"
   - Settings → Resources → WSL Integration → Enable integration with Ubuntu
4. Перезапустить Docker Desktop

**Проверка в WSL:**
```bash
docker --version
docker compose version
```

### Шаг 5: Клонировать проект

**⚠️ ВАЖНО:** Клонируйте проект **ВНУТРИ** WSL файловой системы, НЕ в `/mnt/c/`!

```bash
# Открыть WSL
wsl

# Перейти в домашнюю директорию
cd ~

# Создать папку для проектов (опционально)
mkdir -p ~/projects
cd ~/projects

# Клонировать репозиторий
git clone https://github.com/Lordpluha/spotify-clone.git
cd spotify-clone

# Установить зависимости
pnpm install
```

**❌ НЕ делайте так:**
```bash
# МЕДЛЕННО! Файловая система Windows через WSL работает медленно
cd /mnt/c/Users/YourName/Projects/spotify-clone
```

**✅ Правильно:**
```bash
# Быстро! Нативная файловая система WSL
cd ~/projects/spotify-clone
```

### Шаг 6: Настроить VS Code

```powershell
# В Windows PowerShell установить расширение
code --install-extension ms-vscode-remote.remote-wsl
```

**Открыть проект в VS Code через WSL:**

```bash
# В WSL терминале
cd ~/projects/spotify-clone
code .
```

VS Code откроется с подключением к WSL. В нижнем левом углу будет `WSL: Ubuntu`.

---

## 🚀 Работа с проектом в WSL

После настройки используйте **все команды из основной документации** без изменений:

```bash
# Запуск проекта
docker compose up -d

# Очистка перед git push
pnpm clean:dist
git push

# Разработка
pnpm dev

# И так далее...
```

**Все работает точно так же, как в Linux!** 🎉

---

## 💻 Альтернатива: Нативная Windows (без WSL)

Если по какой-то причине вы не можете использовать WSL2, вот специфичные команды для Windows.

### Установка зависимостей

1. **Node.js:** https://nodejs.org/ (скачать LTS версию)
2. **pnpm:**
   ```powershell
   npm install -g pnpm@10.27.0
   ```
3. **Git:** https://git-scm.com/download/win
4. **Docker Desktop:** https://www.docker.com/products/docker-desktop

### Очистка dist/ перед git push

**PowerShell:**
```powershell
# Создать файл clean-dist.ps1 в корне проекта
@"
Get-ChildItem -Path . -Filter "dist" -Recurse -Directory | 
  Where-Object { `$_.FullName -notlike "*node_modules*" } | 
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
"@ | Out-File -FilePath clean-dist.ps1 -Encoding UTF8

# Использовать перед push
.\clean-dist.ps1
git push
```

**CMD:**
```cmd
REM Через Docker контейнер
docker compose exec api rm -rf /app/apps/api/dist
docker compose exec web rm -rf /app/apps/web/.next

REM Затем
git push
```

### Проверка портов

**PowerShell:**
```powershell
# Найти процесс на порту
Get-NetTCPConnection -LocalPort 3000

# Убить процесс
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

**CMD:**
```cmd
REM Найти процесс
netstat -ano | findstr :3000

REM Убить процесс (замените PID)
taskkill /F /PID <PID>
```

### Настройка Git для Windows

```powershell
# Автоматическая конвертация line endings
git config --global core.autocrlf true

# Использовать UTF-8
git config --global core.quotepath false
git config --global gui.encoding utf-8
```

---

## 🐛 Частые проблемы на Windows

### 1. EACCES при git push

**Решение:**
```powershell
# Остановить контейнеры
docker compose down

# Очистить dist через Docker
docker compose run --rm api sh -c "find /app -type d -name 'dist' -exec rm -rf {} + 2>/dev/null || true"

# Или вручную в PowerShell
Get-ChildItem -Path . -Filter "dist" -Recurse -Directory | Remove-Item -Recurse -Force

# Повторить push
git push
```

### 2. Docker не видит файлы

**Проблема:** Изменения в коде не применяются в контейнере.

**Решение:**
```powershell
# В Docker Desktop Settings → Resources → File Sharing
# Добавьте диск C:\ или путь к проекту

# Или переместите проект в WSL (рекомендуется)
```

### 3. Медленная работа Docker

**Причина:** Использование Windows файловой системы через WSL (`/mnt/c/`).

**Решение:** Переместите проект в WSL:
```bash
# В WSL
cd ~
cp -r /mnt/c/Users/YourName/Projects/spotify-clone ~/projects/
cd ~/projects/spotify-clone
pnpm install
```

### 4. Line endings warnings

**Решение:**
```powershell
git config --global core.autocrlf true
```

### 5. Недостаточно прав для Hyper-V

**Решение:**
1. Откройте PowerShell как Администратор
2. Включите Hyper-V:
   ```powershell
   Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
   ```
3. Перезагрузите компьютер

---

## 📋 Чек-лист для Windows разработчика

### Минимальная настройка (WSL2 - рекомендуется):

- [ ] WSL2 установлен и обновлен
- [ ] Ubuntu установлен в WSL2
- [ ] Node.js 20+ установлен в WSL
- [ ] pnpm 10.27.0 установлен в WSL
- [ ] Docker Desktop установлен и интегрирован с WSL
- [ ] Git установлен в WSL
- [ ] Проект клонирован **внутри** WSL (`~/projects/`)
- [ ] VS Code с расширением Remote - WSL установлен

### Альтернативная настройка (нативная Windows):

- [ ] Node.js 20+ установлен
- [ ] pnpm 10.27.0 установлен
- [ ] Git установлен
- [ ] Docker Desktop установлен
- [ ] Git настроен: `core.autocrlf = true`
- [ ] PowerShell функции для очистки dist созданы

---

## 🆘 Нужна помощь?

1. Проверьте [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - секция "Windows специфичные проблемы"
2. Проверьте [COMMANDS.md](./COMMANDS.md) - секция "Windows PowerShell"
3. Создайте Issue: [GitHub Issues](https://github.com/Lordpluha/spotify-clone/issues)

---

## 💡 Рекомендации

### Для комфортной разработки:

1. ✅ **Используйте WSL2** - это самое лучшее решение
2. ✅ **VS Code с Remote - WSL** - отличная интеграция
3. ✅ **Windows Terminal** - современный терминал с табами
4. ✅ **Git в WSL** - избегайте проблем с line endings
5. ✅ **Храните проекты в WSL** - `~/projects/` вместо `/mnt/c/`

### Полезные инструменты:

- **Windows Terminal:** https://aka.ms/terminal
- **PowerToys:** https://github.com/microsoft/PowerToys (Run, FancyZones)
- **WSLtty:** Альтернативный терминал для WSL

### Горячие клавиши:

```
Win + X, A     - PowerShell как Администратор
Win + `        - Windows Terminal (настраивается)
Ctrl + `       - Терминал в VS Code
```

---

## 📚 Дополнительные ресурсы

- **WSL2 документация:** https://docs.microsoft.com/ru-ru/windows/wsl/
- **Docker Desktop для Windows:** https://docs.docker.com/desktop/windows/
- **Node.js на Windows:** https://nodejs.org/en/download/
- **VS Code Remote - WSL:** https://code.visualstudio.com/docs/remote/wsl
