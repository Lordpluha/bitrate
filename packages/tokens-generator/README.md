# Design Tokens Generator

Модульный генератор CSS из дизайн-токенов с поддержкой кастомных конфигураций.

## Установка

```bash
npm install @spotify/tokens-generator
# или
pnpm add @spotify/tokens-generator
# или
yarn add @spotify/tokens-generator
```

## Использование

### CLI

#### Базовое использование

```bash
# С токенами из пакета
tokens-generator --tokens ./tokens.json --output ./src/styles

# С кастомным конфигом
tokens-generator --tokens ./tokens.json --config ./tokens.config.mjs --output ./styles
```

#### Инициализация конфига

```bash
tokens-generator --init
```

Создаст файл `tokens.config.mjs` с базовой конфигурацией.

### Как модуль

```javascript
import { generateTokens } from '@spotify/tokens-generator';
import config from './my-tokens.config.mjs';

config.paths = {
  tokens: './path/to/tokens.json',
  output: './src/styles',
};

await generateTokens(config);
```

### В npm scripts

```json
{
  "scripts": {
    "generate:tokens": "tokens-generator --tokens ./tokens.json --output ./src/styles"
  }
}
```

## Конфигурация

### Использование схемы

Схема токенов доступна для импорта:

```json
{
  "$schema": "node_modules/@spotify/tokens-generator/src/tokens.schema.json",
  "palette": {
    "primary": {
      "500": "#1db954"
    }
  }
}
```

### Структура конфига

```javascript
export default {
  paths: {
    output: './src/styles',
  },

  palette: {
    scales: [
      { name: 'Primary', key: 'primary' },
    ],
    pureColors: ['white', 'black'],
  },

  layout: {
    sections: [
      {
        name: 'Spacing',
        tokenKey: 'spacing',
        prefix: 'spacing',
      },
    ],
  },

  typography: {
    sections: [
      {
        name: 'Font Families',
        tokenKey: 'font-family',
        prefix: 'font',
      },
    ],
    semantic: {
      enabled: true,
      prefix: 'typography',
      transformKey: 'none', // 'none' | 'kebab'
    },
  },

  themes: {
    imports: ['./palette.css'],
    groups: {
      'Background': ['background', 'background-elevated'],
    },
    prefix: 'color',
  },

  files: {
    'palette.css': {
      header: {
        title: 'Color Palette',
        description: 'Base colors',
      },
      generator: 'palette',
    },
  },
};
```

## Примеры

### Использование в monorepo

```bash
# В корне monorepo
pnpm add -D @spotify/tokens-generator

# В package.json каждого приложения
{
  "scripts": {
    "gen:tokens": "tokens-generator --tokens ../../packages/tokens/tokens.json --output ./src/styles"
  }
}
```

### Использование внешних токенов

```bash
tokens-generator --tokens node_modules/@company/design-tokens/tokens.json --output ./styles
```

## API

### `generateTokens(config)`

Генерирует CSS файлы из токенов.

**Параметры:**
- `config` - объект конфигурации

**Возвращает:** `Promise<void>`

## CLI Опции

- `--tokens <path>` - путь к файлу tokens.json (обязательно)
- `--config <path>` - путь к конфигу (опционально)
- `--output <path>` - папка для вывода CSS (опционально)
- `--init` - создать дефолтный конфиг
- `--help, -h` - показать справку

## Экспорты

- `@spotify/tokens-generator` - функция генерации
- `@spotify/tokens-generator/config` - дефолтный конфиг
- `@spotify/tokens-generator/schema` - JSON схема для токенов

## Лицензия

MIT
