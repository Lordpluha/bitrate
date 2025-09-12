# @spotify/ui

UI-кит для [Spotify Clone](https://github.com/Lordpluha/spotify-clone), построенный на **React 19**, **Next.js 15**, **TailwindCSS** и **shadcn/ui**.
Содержит переиспользуемые компоненты, стили и Tailwind-пресет для унифицированного оформления фронтенд-приложений.

---

## 🚀 Установка

```bash
pnpm add @spotify/ui
```

или

```bash
npm install @spotify/ui
```

---

## ⚡ Использование

### 1. Подключение глобальных стилей

В `app/layout.tsx` или `pages/_app.tsx`:

```tsx
import '@spotify/ui/globals.css'
```

### 2. Использование компонентов

```tsx
'use client'

import { Typography, PasswordInput } from '@spotify/ui'

export default function Example() {
  return (
    <div>
      <Typography.Heading1>Hello from UI Kit 👋</Typography.Heading1>
      <PasswordInput placeholder="Enter your password" />
    </div>
  )
}
```

---

## 🎨 Tailwind Preset

UI-кит предоставляет готовый **Tailwind preset**, чтобы гарантировать единообразие стилей во всех приложениях монорепозитория.

В `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'
import uiPreset from '@spotify/ui/tailwind.preset'

const config: Config = {
  presets: [uiPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx}', // если монорепо
  ],
}

export default config
```

---

## 📦 Экспорты

- `@spotify/ui` — основные React-компоненты и хуки.
- `@spotify/ui/globals.css` — глобальные стили Tailwind (base, components, utilities).
- `@spotify/ui/tailwind.preset` — Tailwind-пресет для консистентного дизайна.

---

## 🧩 Примеры компонентов

| Компонент            | Импорт                                        | Пример использования |
|----------------------|-----------------------------------------------|----------------------|
| `Typography`         | `import { Typography } from '@spotify/ui'`   | `<Typography.Heading1>Hello</Typography.Heading1>` |
| `PasswordInput`      | `import { PasswordInput } from '@spotify/ui'`| `<PasswordInput placeholder="Пароль" />` |
| `Form`               | `import { Form } from '@spotify/ui'`         | `<Form {...methods}>...</Form>` |
| `Carousel`           | `import { Carousel } from '@spotify/ui'`     | `<Carousel>...</Carousel>` |

---

## 🛠 Разработка

Локальная сборка:

```bash
pnpm -F @spotify/ui build
```

Очистка:

```bash
pnpm -F @spotify/ui clean
```

---

## 🧩 Технологии

- **React 19**
- **Next.js 15**
- **TailwindCSS**
- **shadcn/ui**
- **Radix UI**
- **Lucide Icons**

> If you want to use predefined stories from @shadcn/ui - https://github.com/lloydrichards/shadcn-storybook-registry/tree/main/registry preview (https://registry.lloydrichards.dev/storybook/?path=/docs/design-typography--docs&globals=backgrounds.grid:!true)

💚 Сделано для [spotify-clone](https://github.com/Lordpluha/spotify-clone)
