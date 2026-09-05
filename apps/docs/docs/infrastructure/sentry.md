---
sidebar_position: 5
---

# Sentry

Мониторинг ошибок и производительности.

## Настройка

```env
SENTRY_DSN=https://...@o....ingest.sentry.io/...
```

Если `SENTRY_DSN` не задан — Sentry инициализируется без DSN, ошибки не отправляются (безопасно для локальной разработки).

## Инициализация

Sentry инициализируется в `apps/api/src/instrument.ts` и импортируется **первым** в `main.ts`:

```typescript
// main.ts
import './instrument'  // должен быть до всего остального
```

```typescript
// instrument.ts
const isProd = process.env.NODE_ENV === 'production'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  enableLogs: true,
  tracesSampleRate: isProd ? 0.1 : 1.0,
  profileSessionSampleRate: isProd ? 0.1 : 1.0,
  profileLifecycle: 'trace',
})
```

В production выборка трассировок и профилей снижена до 10% для экономии квоты.

## Интеграция с NestJS

`SentryModule.forRoot()` подключается **первым** в `imports` массиве `AppModule` — чтобы Sentry успел обернуть все остальные модули:

```typescript
@Module({
  imports: [
    SentryModule.forRoot(), // первым
    ConfigModule.forRoot({ ... }),
    // ...
  ],
})
```

## Перехват ошибок

Глобальный `HttpExceptionFilter` использует декоратор `@SentryExceptionCaptured()` для автоматической отправки исключений:

```typescript
@Catch()
export class HttpExceptionFilter extends BaseFilter {
  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost) {
    // ...
  }
}
```

Все необработанные исключения (5xx) автоматически попадают в Sentry.

## Debug-эндпоинт

```http
GET /api/v1/debug-sentry
```

Вызывает тестовую ошибку с логом и метрикой — для проверки интеграции:

```typescript
Sentry.logger.info('User triggered test error')
Sentry.metrics.count('test_counter', 1)
throw new Error('My first Sentry error!')
```

:::warning
Убери или защити этот эндпоинт перед production-деплоем.
:::
