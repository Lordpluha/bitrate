# Использование @spotify/esbuild-bundler

## Быстрый старт

### 1. Добавьте зависимость

```bash
pnpm add -D @spotify/esbuild-bundler
```

### 2. Настройте package.json

```json
{
  "scripts": {
    "build": "react-bundler build",
    "dev": "react-bundler dev"
  }
}
```

### 3. Убедитесь что есть tsconfig.build.json

Пакет использует `tsconfig.build.json` для генерации типов.

### 4. Запустите сборку

```bash
pnpm build    # Production build
pnpm dev      # Development mode
```

## Требования к структуре проекта

```
your-package/
├── src/
│   ├── index.ts          # Entry point
│   ├── components/       # Your code
│   └── styles/
│       └── index.css     # CSS entry (default)
├── tsconfig.build.json   # TypeScript config
└── package.json
```

## Опции конфигурации

### Через CLI флаги

```bash
# Кастомный entry pattern
react-bundler build --entry "lib/**/*.ts"

# Кастомная директория вывода
react-bundler build --outdir ./build

# Кастомные CSS пути
react-bundler build \
  --css-input ./styles/main.css \
  --css-output ./dist/bundle.css
```

### Через код

```javascript
// build.mjs
import { runBuild } from '@spotify/esbuild-bundler/build';

runBuild({
  cwd: process.cwd(),
  entry: 'src/**/*.{ts,tsx}',
  outdir: 'dist',
});
```

## Что входит в сборку

### Build (Production)

✅ ESM bundle (`dist/esm/`)
✅ CJS bundle (`dist/cjs/`)
✅ Type definitions (`dist/types/`)
✅ Compiled CSS (`dist/globals.css`)
✅ Path aliases resolved (`@/` → `./`)

### Dev (Watch mode)

🔄 Автоматическая пересборка при изменениях
🔄 TypeScript watch mode
🔄 Tailwind CSS watch mode
⚡ Быстрая инкрементальная сборка

## Примеры использования

### В monorepo

```json
{
  "scripts": {
    "build": "react-bundler build",
    "dev": "react-bundler dev"
  }
}
```

### С кастомными настройками

```json
{
  "scripts": {
    "build": "react-bundler build --outdir ./build",
    "build:lib": "react-bundler build --entry 'lib/**/*.ts' --ignore '**/*.test.*'",
    "dev": "react-bundler dev --css-input ./src/theme.css"
  }
}
```

## Path Aliases

Бандлер автоматически заменяет `@/` импорты на относительные пути:

```typescript
// Исходный код
import { Button } from '@/components/ui/button';

// После сборки в dist/esm/index.js
import { Button } from './components/ui/button.js';
```

Это делает собранные файлы независимыми от tsconfig paths.

## Troubleshooting

### "Cannot find module tsconfig.build.json"

Создайте файл `tsconfig.build.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist/types"
  },
  "include": ["src"],
  "exclude": ["**/*.test.*", "**/*.stories.*"]
}
```

### "pnpm: command not found"

Бандлер использует `pnpm dlx` для запуска Tailwind CLI. Установите pnpm или измените команду в коде.

### Медленная сборка

В dev режиме используйте только `pnpm dev` без предварительной очистки dist.
