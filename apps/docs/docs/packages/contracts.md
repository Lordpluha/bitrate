---
sidebar_position: 3
---

# @bitrate/contracts

Авто-генерируемые TypeScript-типы из Swagger-схемы API. Единственный источник истины для типов запросов и ответов во всех фронтенд-приложениях.

## Что внутри

```
packages/contracts/src/
└── api/
    └── v1.ts   # Авто-сгенерированные типы (openapi-typescript)
```

`v1.ts` содержит интерфейсы `paths`, `components`, `operations` — полное дерево всех эндпоинтов API.

## Генерация

```bash
# API должен быть запущен на localhost:3000
pnpm --filter @bitrate/contracts gen:api
```

Скрипт fetches `http://localhost:3000/swagger/json` и перезаписывает `src/api/v1.ts` через `openapi-typescript`.

:::warning
Не редактируй `v1.ts` вручную — файл будет перезаписан при следующей генерации.
:::

## Использование во фронтенде

В `web-player` пакет подключён через `openapi-fetch` и `openapi-react-query`:

```typescript
// shared/api/client/fetchClient.ts
import createClient from 'openapi-fetch'
import type { paths } from '@bitrate/contracts'

export const apiClient = createClient<paths>({
  baseUrl: '/api/v1',
  credentials: 'include',
})
```

```typescript
// shared/api/client/reactQueryClient.ts
import createQueryClient from 'openapi-react-query'

export const { useQuery, useMutation } = createQueryClient(apiClient)
```

## Пример запроса с типизацией

```typescript
const { data, error } = useQuery('get', '/api/v1/tracks', {
  params: { query: { page: 1, limit: 20 } },
})
// data автоматически типизирован из Swagger-схемы
```

## Автоматический refresh JWT

Клиент содержит middleware для автоматического обновления access-токена при получении `401`:

```typescript
// middleware в fetchClient.ts
onResponse(response) {
  if (response.status === 401) {
    // refresh → retry original request
  }
}
```
