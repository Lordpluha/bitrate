# Использование @spotify/tokens-generator в других приложениях

## Быстрый старт

### 1. Добавьте зависимость

```bash
pnpm add -D @spotify/tokens-generator
```

### 2. Создайте конфиг токенов

```bash
tokens-generator --init
```

Или создайте `tokens.config.mjs` вручную (см. примеры в README.md).

### 3. Добавьте скрипт в package.json

```json
{
  "scripts": {
    "gen:tokens": "tokens-generator --tokens ./path/to/tokens.json --config ./tokens.config.mjs --output ./styles"
  }
}
```

### 4. Запустите генерацию

```bash
pnpm gen:tokens
```

## Примеры использования в monorepo

### В apps/web

```json
{
  "scripts": {
    "gen:tokens": "tokens-generator --tokens ../../packages/tokens/tokens.json --output ./src/styles"
  }
}
```

### В apps/mobile

```json
{
  "scripts": {
    "gen:tokens": "tokens-generator --tokens @spotify/tokens/tokens.json --output ./styles"
  }
}
```

## Использование как модуля

```javascript
// scripts/build-tokens.mjs
import { generateTokens } from '@spotify/tokens-generator';
import config from '@spotify/tokens-generator/config';

config.paths = {
  tokens: './tokens.json',
  output: './dist/styles',
};

await generateTokens(config);
```

## JSON Schema

Добавьте в ваш `tokens.json`:

```json
{
  "$schema": "../../node_modules/@spotify/tokens-generator/src/tokens.schema.json",
  "palette": {
    // ...
  }
}
```

Это даст вам автодополнение и валидацию в VSCode.
