# @spotify/tokens

Пакет дизайн-токенов для проекта Spotify Clone. Содержит цвета, типографику, размеры, иконки и другие дизайн-токены.

> Нужно будет сделать registry.json для подключения $shema в json

## Структура пакета

```
packages/tokens/
├── icons/          # SVG иконки
├── colors/         # Цветовые токены
├── typography/     # Токены типографики
└── ...
```

## Генерация React компонентов из SVG иконок

Для конвертации SVG файлов из этого пакета в React компоненты используется `@spotify/svgr`.

### Базовое использование

```bash
# Одноразовая генерация
react-svgr build -i @spotify/tokens/icons -o src/icons/generated

# С отслеживанием изменений (watch режим)
react-svgr dev -i @spotify/tokens/icons -o src/icons/generated
```

### С кастомными цветовыми переменными

Если нужно управлять цветами иконок через пропсы:

```bash
# С одной переменной
react-svgr build -i @spotify/tokens/icons -o src/icons --variables "color"

# С несколькими переменными
react-svgr build -i @spotify/tokens/icons -o src/icons --variables "primaryColor,secondaryColor"
```

### Настройка в package.json приложения

Добавьте скрипты в `package.json` вашего приложения:

```json
{
  "scripts": {
    "icons:build": "react-svgr build -i @spotify/tokens/icons -o src/icons/generated",
    "icons:watch": "react-svgr dev -i @spotify/tokens/icons -o src/icons/generated"
  }
}
```

Затем запускайте:

```bash
pnpm svgr:build    # Для одноразовой генерации
pnpm svgr:watch    # Для режима разработки с автообновлением
```

### Пример сгенерированного компонента

#### Монохромная иконка (один цвет):
```tsx
// Автоматически использует currentColor
export const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props}>
    <path fill="currentColor" d="..." />
  </svg>
);

// Использование:
<PlayIcon className="text-green-500" />
```

#### Многоцветная иконка:
```tsx
// Сохраняет все цвета из оригинального SVG
export const SpotifyLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props}>
    <path fill="#1DB954" d="..." />
    <path fill="#191414" d="..." />
  </svg>
);
```

#### С кастомными переменными:
```tsx
interface PlayIconProps extends React.SVGProps<SVGSVGElement> {
  primaryColor?: string;
  secondaryColor?: string;
}

export const PlayIcon = ({ primaryColor, secondaryColor, ...props }: PlayIconProps) => (
  <svg {...props}>
    <path fill={primaryColor || "#000"} d="..." />
    <path fill={secondaryColor || "#fff"} d="..." />
  </svg>
);

// Использование:
<PlayIcon primaryColor="#1DB954" secondaryColor="#191414" />
```

## Дополнительная информация

- Подробная документация svgr: [`packages/svgr/README.md`](../svgr/README.md)
- Примеры использования: [`packages/svgr/USAGE.md`](../svgr/USAGE.md)