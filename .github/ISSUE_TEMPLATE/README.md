# Issue Templates

Этот проект использует структурированные шаблоны для issue, адаптированные под архитектуру Spotify Clone monorepo.

## 📋 Доступные шаблоны

### Bug Reports
- **🔧 API Bug Report** - Баги в NestJS API
- **🌐 Web Bug Report** - Баги в Next.js приложении
- **📱 Mobile Bug Report** - Баги в Expo приложении
- **🖥️ Desktop Bug Report** - Баги в Tauri приложении

### Feature Requests
- **🚀 API Feature** - Новые функции для API
- **🌐 Web Feature** - Новые функции для веб-приложения
- **📱 Mobile Feature** - Новые функции для мобильного приложения
- **🖥️ Desktop Feature** - Новые функции для десктоп приложения

### Infrastructure & Performance
- **⚙️ Infrastructure Feature** - DevOps, Docker, CI/CD улучшения
- **⚡ Performance Improvement** - Оптимизация производительности

### Other
- **🔒 Security Issue** - Проблемы безопасности
- **🔄 CI/CD Issue** - Проблемы с GitHub Actions
- **📚 Documentation** - Улучшения документации
- **🎨 UI/UX Issue** - UI/UX проблемы и предложения

## 🎯 Когда использовать какой шаблон

### API Bug Report
- Ошибки в REST API endpoints
- Проблемы с Prisma/базой данных
- Проблемы аутентификации
- Ошибки валидации

### Web Bug Report
- Баги в Next.js приложении
- Проблемы рендеринга
- Hydration errors
- Проблемы с роутингом

### Mobile Bug Report
- Баги в Expo приложении
- Проблемы на iOS/Android
- Native module issues

### Desktop Bug Report
- Баги в Tauri приложении
- Проблемы с Rust backend
- Window management issues

### Infrastructure Feature
- Изменения в Docker
- GitHub Actions workflows
- Nginx конфигурация
- Database setup

### Performance Improvement
- Оптимизация скорости загрузки
- Уменьшение bundle size
- Database query optimization
- Core Web Vitals улучшения

### Security Issue
**⚠️ Для критических уязвимостей используйте [GitHub Security Advisories](https://github.com/lordpluha/spotify-clone/security/advisories/new)**

## 🛠️ Технологический стек проекта

Это поможет заполнять templates:

### Backend (API)
- NestJS
- Prisma ORM
- PostgreSQL 16
- Redis 7
- JWT Authentication

### Frontend (Web)
- Next.js 15
- React
- Tailwind CSS
- TypeScript

### Mobile
- Expo SDK 52
- React Native
- TypeScript

### Desktop
- Tauri
- Rust
- React
- TypeScript

### Infrastructure
- Docker & Docker Compose
- GitHub Actions
- Nginx
- pnpm workspaces
- TurboRepo

## 💡 Tips

1. **Будьте конкретны** - Указывайте точные пути к файлам, endpoint URLs, версии
2. **Приложите логи** - Console output, error stack traces
3. **Воспроизводимость** - Четкие шаги для воспроизведения
4. **Окружение** - Версии Node.js, OS, браузера
5. **Скриншоты** - Для UI/UX проблем обязательно

## 🔗 Связанные документы

- [README.md](../../README.md) - Основная документация (включая Docker setup)
- [CI/CD Workflows](../workflows/README.md) - CI/CD pipelines
- [Contributing Guidelines](../../CONTRIBUTING.md) - Как контрибьютить
