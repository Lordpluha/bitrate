# Использование @spotify/svgr

## Быстрый старт

### 1. Установка

```bash
pnpm add -D @spotify/svgr
```

### 2. Настройка package.json

```json
{
  "scripts": {
    "icons:build": "react-svgr build -i ./icons -o ./src/icons/generated",
    "icons:watch": "react-svgr dev -i ./icons -o ./src/icons/generated"
  }
}
```

### 3. Запуск

```bash
pnpm icons:build    # Одноразовая генерация
pnpm icons:watch    # Watch режим
```

## Типичные сценарии

### Из пакета токенов в monorepo

```json
{
  "scripts": {
    "icons": "react-svgr build -i @company/design-tokens/icons -o src/icons"
  }
}
```

### С цветовыми переменными

```bash
react-svgr build \
  -i ./icons \
  -o ./src/icons \
  --variables "primaryColor,secondaryColor"
```

Это создаст компоненты с пропсами для управления цветами:

```tsx
<MyIcon primaryColor="#FF0000" secondaryColor="#00FF00" />
```

### Относительные пути

```bash
# Из соседнего пакета
react-svgr build -i ../design-system/icons -o ./src/icons

# Из текущей директории
react-svgr build -i ./assets/icons -o ./src/components/icons
```

## Опции CLI

| Опция | Короткая | Описание | Обязательна |
|-------|----------|----------|-------------|
| `--input` | `-i` | Путь к SVG файлам | ✅ |
| `--output` | `-o` | Путь для вывода компонентов | ✅ |
| `--variables` | `--vars` | Имена цветовых переменных | ❌ |

## Типы иконок

### Монохромные (одноцветные)

Если SVG содержит только один уникальный цвет, он автоматически заменяется на `currentColor`:

```tsx
// Исходный SVG: <path fill="#000000" />
// Результат:
export const Icon = (props) => (
  <svg {...props}>
    <path fill="currentColor" />
  </svg>
);

// Использование:
<Icon className="text-blue-500" /> // Будет синей
```

### Многоцветные

Без переменных - цвета сохраняются:

```tsx
export const Icon = (props) => (
  <svg {...props}>
    <path fill="#FF0000" />
    <path fill="#00FF00" />
  </svg>
);
```

С переменными - добавляются пропсы:

```tsx
interface IconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string;
  secondaryColor?: string;
}

export const Icon = ({ primaryColor, secondaryColor, ...props }: IconProps) => (
  <svg {...props}>
    <path fill={primaryColor || "#FF0000"} />
    <path fill={secondaryColor || "#00FF00"} />
  </svg>
);
```

## Работа с package scopes

Пакет поддерживает разрешение путей через node_modules:

```bash
# Автоматически найдет node_modules/@company/tokens/icons
react-svgr build -i @company/tokens/icons -o ./src/icons
```

## Примеры интеграции

### С React + TypeScript

```tsx
import { MyIcon } from './icons/generated/MyIcon';

function App() {
  return (
    <div>
      <MyIcon className="w-6 h-6 text-gray-500" />
      <MyIcon
        primaryColor="#1DB954"
        secondaryColor="#000000"
        className="w-8 h-8"
      />
    </div>
  );
}
```

### С Tailwind CSS

```tsx
<Icon className="w-6 h-6 text-blue-500 hover:text-blue-600" />
```

### В Storybook

```tsx
import { MyIcon } from './MyIcon';

export default {
  title: 'Icons/MyIcon',
  component: MyIcon,
};

export const Default = () => <MyIcon />;
export const WithColors = () => (
  <MyIcon primaryColor="#FF0000" secondaryColor="#00FF00" />
);
```

## Troubleshooting

### "Cannot find module @company/tokens"

Убедитесь что пакет установлен:
```bash
pnpm add @company/tokens
```

### Цвета не заменяются переменными

Проверьте порядок цветов в SVG. Переменные назначаются в порядке появления:
```bash
react-svgr build -i ./icons -o ./out --variables "first,second,third"
```

### Слишком много файлов генерируется

Используйте `.gitignore` для исключения сгенерированных файлов:
```
src/icons/generated/
```

И добавьте в package.json:
```json
{
  "files": [
    "dist",
    "!src/icons/generated"
  ]
}
```

## Watch режим для разработки

В dev режиме используйте watch для автоматической регенерации:

```bash
react-svgr dev -i @company/tokens/icons -o ./src/icons
```

При изменении любого SVG файла компоненты автоматически пересоздадутся.
