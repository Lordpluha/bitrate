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

## 🎨 Tailwind Configuration

UI-кит использует **Tailwind CSS v4** с конфигурацией на основе CSS (`@theme`).

Все стили и настройки определены в `globals.css`, который нужно импортировать в ваше приложение:

```ts
// В вашем основном CSS файле (например, app/global.css)
import '@spotify/ui/globals.css';
```

Или импортируйте напрямую в layout/главный компонент:

```tsx
import '@spotify/ui/globals.css';
```

---

## 📦 Экспорты

- `@spotify/ui` — основные React-компоненты и хуки.
- `@spotify/ui/globals.css` — глобальные стили Tailwind CSS v4 с @theme конфигурацией.

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
