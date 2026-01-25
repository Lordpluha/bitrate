---
sidebar_position: 1
---

# Desktop App Overview

Complete guide for developing and running the Tauri desktop application.

## 📋 Содержание

- [🚀 Способы запуска](#-способы-запуска)
  - [Локальный запуск](#вариант-1-локальный-запуск-рекомендуется)
  - [Docker UI only](#вариант-2-docker-с-ui-только)
  - [Docker с VNC](#вариант-3-docker-с-vnc)
- [🔌 Доступные порты](#-доступные-порты)
- [⚙️ Команды управления (VNC)](#️-команды-управления-vnc)
- [🔧 Настройка](#-настройка)
- [🔍 Отладка](#-отладка)
- [🐛 Типичные проблемы](#-типичные-проблемы)
- [📊 Сравнение вариантов](#-сравнение-вариантов)

---

## 🚀 Способы запуска

Desktop приложение можно запустить тремя способами:

### Вариант 1: Локальный запуск (рекомендуется)

**Установка системных зависимостей (один раз):**

<details>
<summary><b>Linux (Ubuntu/Debian)</b></summary>

```bash
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
```
</details>

<details>
<summary><b>Windows</b></summary>

1. **Visual Studio 2022 Build Tools**
   - Скачайте с [visualstudio.microsoft.com](https://visualstudio.microsoft.com/downloads/)
   - Выберите "Desktop development with C++"

2. **WebView2 Runtime** (обычно уже установлен в Windows 11)
   - Скачайте с [microsoft.com](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

3. **Rust**
   - Скачайте rustup-init.exe с https://rustup.rs/
   - Запустите установщик
</details>

<details>
<summary><b>macOS</b></summary>

```bash
# Xcode Command Line Tools
xcode-select --install

# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```
</details>

**Запуск приложения:**

```bash
cd apps/desktop
pnpm install
pnpm dev  # Запустит Tauri приложение с нативным окном
```

**Преимущества:**
- ✅ Полный функционал Tauri
- ✅ Аппаратное ускорение GPU
- ✅ Быстрый hot reload
- ✅ Доступ ко всем нативным API

---

### Вариант 2: Docker с UI только

Запускает только Vite dev server без Tauri backend.

```bash
# Запуск Vite dev server в контейнере
docker compose --profile desktop up -d desktop

# Откройте в браузере
http://localhost:1420
```

**Ограничения:**
- ✅ Показывает React UI
- ❌ Нет Tauri backend
- ❌ Нет доступа к нативным API

---

### Вариант 3: Docker с VNC

Полноценное Tauri приложение с GUI доступом через браузер.

#### Быстрый старт

```bash
# Остановите обычный desktop контейнер если запущен
docker compose --profile desktop down

# Запустите VNC версию
cd apps/desktop
docker compose -f docker-compose.vnc.yml up --build
```

**⏱️ Первая сборка займет ~5-10 минут** (загрузка зависимостей, компиляция Rust).

#### Доступ к приложению

**1. noVNC (браузер) - проще всего**

```
http://localhost:6080/vnc.html
```

- Нажмите "Connect"
- Введите пароль: `spotify`
- Увидите рабочий стол с Tauri приложением

**2. VNC клиент (RealVNC, TigerVNC, Remmina)**

```
vnc://localhost:5900
```

- Пароль: `spotify`

---

## 🔌 Доступные порты

### Для Варианта 2 (Docker UI only)

| Порт | Назначение |
|------|------------|
| 1420 | Vite dev server |

### Для Варианта 3 (Docker VNC)

| Порт | Назначение |
|------|------------|
| 5900 | VNC сервер |
| 6080 | noVNC (веб-интерфейс) |
| 1421 | Vite dev server |

---

## ⚙️ Команды управления (VNC)

```bash
# Запуск в фоне
docker compose -f docker-compose.vnc.yml up -d --build

# Просмотр логов
docker compose -f docker-compose.vnc.yml logs -f

# Остановка
docker compose -f docker-compose.vnc.yml down

# Вход в контейнер
docker compose -f docker-compose.vnc.yml exec desktop-vnc bash

# Пересборка без кэша
docker compose -f docker-compose.vnc.yml build --no-cache
```

---

## 🔧 Настройка

### Изменение разрешения экрана (VNC)

В файле `apps/desktop/docker-compose.vnc.yml`:

```yaml
environment:
  - RESOLUTION=1920x1080x24  # измените на нужное
```

Доступные разрешения:
- `1920x1080x24` (Full HD)
- `1280x720x24` (HD)
- `2560x1440x24` (2K)
- `3840x2160x24` (4K)

---

## 🔍 Отладка

### Проверка процессов (VNC)

```bash
docker compose -f docker-compose.vnc.yml exec desktop-vnc ps aux | grep -E "Xvfb|x11vnc|tauri"
```

### Ручной запуск приложения

```bash
docker compose -f docker-compose.vnc.yml exec desktop-vnc bash
cd /app/apps/desktop
pnpm tauri dev
```

### Проверка VNC

```bash
curl http://localhost:6080
```

### Просмотр логов Tauri

```bash
docker compose -f docker-compose.vnc.yml logs | grep tauri
```

---

## 🐛 Типичные проблемы

### Черный экран в VNC

**Причина:** Xvfb медленно запускается при первом старте.

**Решение:**
- Подождите 30-60 секунд после подключения
- Проверьте логи: `docker compose -f docker-compose.vnc.yml logs -f`
- Убедитесь что Xvfb запущен: `docker compose exec desktop-vnc ps aux | grep Xvfb`

### Ошибка "port is already allocated"

**Причина:** Порт занят другим контейнером.

**Решение:**
```bash
# Остановите обычный desktop контейнер
docker compose --profile desktop down

# Или измените порты в docker-compose.vnc.yml
```

### Приложение не появляется

**Причина:** Tauri не запустился или упал.

**Решение:**
```bash
# Проверьте что Tauri запустился
docker compose -f docker-compose.vnc.yml logs | grep tauri

# Войдите в контейнер и запустите вручную
docker compose -f docker-compose.vnc.yml exec desktop-vnc bash
cd /app/apps/desktop
pnpm tauri dev
```

### VNC не подключается

**Решение:**
```bash
# Проверьте что контейнер запущен
docker compose -f docker-compose.vnc.yml ps

# Проверьте логи VNC сервера
docker compose -f docker-compose.vnc.yml logs | grep x11vnc

# Перезапустите
docker compose -f docker-compose.vnc.yml restart
```

### Медленная работа

**Причина:** VNC работает без GPU ускорения.

**Решение:**
- Это ожидаемо для VNC режима
- Для быстрой разработки используйте локальный запуск
- VNC предназначен для CI/CD или демонстрации

---

## 📊 Сравнение вариантов

| Способ | Tauri Backend | GUI | Hot Reload | Сложность | Скорость | Размер образа |
|--------|---------------|-----|------------|-----------|----------|---------------|
| **Локально** | ✅ | ✅ | ✅ | Низкая | Быстро | - |
| **Docker UI** | ❌ | Браузер | ✅ | Низкая | Быстро | ~9.4 GB |
| **Docker VNC** | ✅ | ✅ | ✅ | Средняя | Медленно | ~12.5 GB |

### Когда использовать каждый способ

**Локальный запуск:**
- ✅ Ежедневная разработка
- ✅ Отладка Tauri функционала
- ✅ Быстрая итерация

**Docker UI only:**
- ✅ Тестирование React компонентов
- ✅ UI разработка без Tauri
- ✅ Быстрый просмотр изменений

**Docker VNC:**
- ✅ CI/CD тестирование GUI
- ✅ Демонстрация приложения
- ✅ Разработка на удаленном сервере
- ✅ Нет локального GUI окружения

---

## 📚 Дополнительные ресурсы

- [Tauri Documentation](https://tauri.app/)
- [Rust Documentation](https://doc.rust-lang.org/)
- VNC README (`apps/desktop/VNC-README.md`) - подробная документация по VNC
- [Vite Documentation](https://vitejs.dev/)

---

## ⚡ Быстрые команды

### Локальный запуск
```bash
cd apps/desktop && pnpm dev
```

### Docker UI
```bash
docker compose --profile desktop up -d desktop
```

### Docker VNC
```bash
cd apps/desktop && docker compose -f docker-compose.vnc.yml up --build
```

### Остановка
```bash
docker compose --profile desktop down
# или
docker compose -f docker-compose.vnc.yml down
```
