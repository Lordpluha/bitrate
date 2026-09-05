---
sidebar_position: 5
---

# Database Seeding

Заполнение базы данных тестовыми данными для разработки.

## Запуск

```bash
pnpm --filter @bitrate/api db:seed
```

## Что создаётся

Сидер генерирует полный набор данных для разработки:

- Пользователей (случайные имена, аватары с DiceBear)
- Артистов с профилями
- Альбомы и треки (скачиваются реальные аудиофайлы)
- Плейлисты пользователей

## Архитектура сидера

### FakerService

`@Injectable()` сервис в `apps/api/src/infra/seeds/faker.service.ts` — генерирует объекты с `@faker-js/faker`:

```typescript
const fakerService = new FakerService()

fakerService.generateUsers(50)      // массив объектов User
fakerService.generatePlaylists(userIds, 30)  // массив объектов Playlist
```

### SeedService

Основной сервис `apps/api/src/infra/seeds/seed.service.ts`:

1. Создаёт артистов через `DownloadResourcesService` (реальные данные)
2. Генерирует пользователей через `FakerService`
3. Создаёт альбомы и треки
4. Создаёт плейлисты и наполняет их треками

### DownloadResourcesService

Скачивает реальные аудиофайлы и изображения для создания правдоподобных тестовых данных.

## Сброс и повторный сидинг

```bash
# Сбросить БД и применить миграции заново
pnpm --filter @bitrate/api db:migration:reset

# Затем пересидить
pnpm --filter @bitrate/api db:seed
```

:::warning
`db:migration:reset` удаляет все данные. Используй только в разработке.
:::

## Просмотр данных

```bash
# Открыть Prisma Studio
pnpm --filter @bitrate/api db:ui
```

Откроется на `http://localhost:5555`.
