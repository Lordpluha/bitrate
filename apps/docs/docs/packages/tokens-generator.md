---
sidebar_position: 4
---

# @spotify/tokens-generator

CLI и программный генератор Tailwind v4 CSS-переменных из `tokens.json`.

## Запуск

```bash
# Через пакет ui-react (рекомендуется)
pnpm --filter @spotify/ui-react gen:tokens

# Напрямую
tokens-generator --tokens ./tokens.json --output ./src/styles
```

### Опции CLI

| Флаг | Обязателен | Описание |
|---|---|---|
| `--tokens <path>` | да | Путь к `tokens.json` |
| `--output <path>` | нет | Выходная директория (по умолчанию `./styles`) |
| `--help, -h` | — | Помощь |

## Что генерируется

Из одного `tokens.json` создаются 4 CSS-файла в `packages/ui-react/src/styles/`:

| Файл | Содержимое |
|---|---|
| `palette.css` | Цветовые токены |
| `layout.css` | Отступы, размеры, брейкпоинты |
| `typography.css` | Шрифты, размеры, высоты строк |
| `themes.css` | `@theme` + `:root.{name}` темы |

Файлы используют блоки `@theme` Tailwind v4.

## Структура `tokens.json`

```json
{
  "palette": {
    "brand": { "primary": "#1db954", "secondary": "#191414" }
  },
  "layout": {
    "spacing": { "xs": "4px", "sm": "8px" }
  },
  "typography": {
    "fontFamily": { "sans": "Inter, sans-serif" }
  },
  "themes": {
    "dark": { ... },
    "light": { ... }
  }
}
```

Первая тема в `themes` становится дефолтной (`@theme`). Остальные — `:root.{name}` и `@custom-variant`.

## Программный API

```typescript
import { generateTokens } from '@spotify/tokens-generator'

await generateTokens({
  tokensPath: './tokens.json',
  outputDir: './src/styles',
})
```

## Pipeline в ui-react

Генератор запускается как часть `pnpm --filter @spotify/ui-react gen:tokens`. При изменении `packages/tokens/tokens.json` нужно перезапустить генерацию и пересобрать `ui-react`.
