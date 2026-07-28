---
sidebar_position: 6
---

# @spotify/ncs-parser

Парсер сайта NoCopyrightSounds (NCS) для получения данных о треках, артистах и жанрах.

## Что парсит

NCS — каталог музыки без авторских прав. Парсер предоставляет API для получения:

- Треков с метаданными (название, артист, жанр, BPM, настроение)
- Артистов и их дискографии
- Жанров и фильтров

## Использование

```typescript
import { NcsParser } from '@spotify/ncs-parser'

const parser = new NcsParser()

// Получить треки
const tracks = await parser.getTracks({ genre: 'Drum & Bass', limit: 20 })

// Получить артиста
const artist = await parser.getArtist('elektronomia')

// Поиск
const results = await parser.search('sky high')
```

## Структура модулей

```
packages/ncs-parser/src/
├── modules/
│   ├── tracks/     # Парсинг треков
│   └── artists/    # Парсинг артистов
├── entities/       # Типы Track, Artist
├── helpers/        # HTTP клиент, парсеры HTML
└── main.ts         # Точка входа
```

## Использование в API

`DownloadResourcesService` (сидер) использует парсер для загрузки реальных треков и данных артистов при выполнении `pnpm db:seed`. Это позволяет наполнить базу правдоподобными данными для разработки вместо полностью случайных.

## Ограничения

- Парсер зависит от структуры сайта NCS — при изменении вёрстки может потребоваться обновление
- Только для разработки и сидинга, не для production-использования
- Использование данных NCS регулируется их условиями использования
