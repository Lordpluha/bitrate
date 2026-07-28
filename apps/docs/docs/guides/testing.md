---
sidebar_position: 3
---

# Testing

Описание тестовых слоёв API и общего React UI-пакета.

## Три уровня тестов

### Unit (`*.unit-spec.ts`)

Изолированная логика — без БД, без внешних сервисов. Prisma заменяется `prismaMock` (jest-mock-extended). Классы инстанцируются напрямую.

```typescript
// albums.service.unit-spec.ts
service = new AlbumsService(prismaMock)

it('returns album by id', async () => {
  prismaMock.album.findUniqueOrThrow.mockResolvedValue(mockAlbum)
  expect(await service.getById('uuid')).toEqual(mockAlbum)
})
```

**Запуск:** `pnpm --filter @spotify/api test`

### Integration (`*.int-spec.ts`)

NestJS DI-контейнер с моками провайдеров. Проверяет HTTP-роутинг, пайпы, гарды (через override). БД не нужна.

```typescript
// albums.controller.int-spec.ts
const module = await Test.createTestingModule({
  controllers: [AlbumsController],
  providers: [{ provide: AlbumsService, useValue: serviceMock }],
})
  .overrideGuard(ArtistAuthGuard)
  .useValue({ canActivate: () => true })
  .compile()
```

**Запуск:** `pnpm --filter @spotify/api test:int`

### E2E (`*.e2e-spec.ts`)

HTTP-запросы к реально запущенному приложению с реальной PostgreSQL и Redis. Покрывает пользовательские сценарии end-to-end.

```
test/e2e/
├── auth.e2e-spec.ts
├── tracks.e2e-spec.ts
└── ...
```

**Запуск:** `pnpm --filter @spotify/api test:e2e`

## Соглашения по именованию

| Тип | Шаблон |
|---|---|
| Unit | `*.unit-spec.ts` (или `*.spec.ts` — legacy) |
| Integration | `*.int-spec.ts` |
| E2E | `*.e2e-spec.ts` |

Файлы располагаются рядом с тестируемым модулем, E2E — в `test/e2e/`.

## Переменные окружения для E2E

E2E-тесты требуют запущенной инфраструктуры:

```env
DATABASE_URL=postgresql://...
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=test-secret
JWT_ACCESS_EXPIRES_IN=5m
JWT_REFRESH_EXPIRES_IN=30d
ACCESS_TOKEN_NAME=access_token
REFRESH_TOKEN_NAME=refresh_token
WEB_HOST=http://localhost:3001
NODE_ENV=test
```

Unit и integration тесты не требуют никакой инфраструктуры.

## Фикстуры

- Локальные фикстуры модуля: `src/modules/<module>/__tests__/fixtures/`
- Общие E2E фикстуры и хелперы: `test/fixtures/` и `test/helpers/`

## Покрытие

```bash
pnpm --filter @spotify/api test:cov
```

Отчёт генерируется в `apps/api/coverage/`.

## UI React: Vitest + Playwright

`packages/ui-react` использует четыре проекта из
`packages/ui-react/vitest.config.ts`:

| Проект | Суффикс | Среда | Назначение |
|---|---|---|---|
| Unit | `*.unit-spec.tsx` | jsdom | Изолированное поведение компонента |
| Integration | `*.int-spec.tsx` | jsdom | Пользовательские взаимодействия и композиция |
| Snapshot | `*.snapshot-spec.tsx` | jsdom | DOM-снимки |
| Screenshot | `*.screenshot-spec.tsx` | Chromium | Визуальная регрессия через Vitest Browser и Playwright |

Все тесты располагаются рядом с компонентом:

```text
src/components/ui/button/
├── button.tsx
├── button.unit-spec.tsx
├── button.int-spec.tsx
├── button.snapshot-spec.tsx
└── button.screenshot-spec.tsx
```

Команды:

```bash
pnpm --filter @spotify/ui-react test
pnpm --filter @spotify/ui-react test:unit
pnpm --filter @spotify/ui-react test:int
pnpm --filter @spotify/ui-react test:snapshot
pnpm --filter @spotify/ui-react test:snapshot:update
pnpm --filter @spotify/ui-react test:screenshot
pnpm --filter @spotify/ui-react test:screenshot:update
pnpm --filter @spotify/ui-react test:cov
```

В `ui-react` Playwright используется как browser provider для screenshot-тестов; отдельные
E2E-сценарии приложения принадлежат `web-player`.

## Web player: Vitest + Playwright

| Тип | Расположение | Команда |
|---|---|---|
| Unit | `src/**/*.unit-spec.ts(x)` | `pnpm --filter @spotify/web-player test:unit` |
| Integration | `tests/integration/**/*.int-spec.ts(x)` | `pnpm --filter @spotify/web-player test:int` |
| E2E | `tests/e2e/**/*.e2e-spec.ts` | `pnpm --filter @spotify/web-player test:e2e` |
| Screenshot | `tests/screenshots/**/*.screenshot-spec.ts` | `pnpm --filter @spotify/web-player test:screenshot` |

Playwright автоматически запускает Next.js dev server на `http://localhost:3001`, если
`BASE_URL` не указывает на уже развёрнутое окружение.
