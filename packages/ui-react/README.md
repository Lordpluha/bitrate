# @bitrate/ui-react

UI kit for [Bitrate](https://github.com/Lordpluha/bitrate), built on **React 19**, **Next.js 15**, **TailwindCSS**, and **shadcn/ui**.
Contains reusable components, styles, and a Tailwind preset for consistent styling across frontend applications.

---

## 🚀 Installation

```bash
pnpm add @bitrate/ui-react
```

or

```bash
npm install @bitrate/ui-react
```

---

## ⚡ Usage

### 1. Import global styles

In `app/layout.tsx` or `pages/_app.tsx`:

```tsx
import '@bitrate/ui-react/globals.css'
```

### 2. Use components

```tsx
'use client'

import { Typography, PasswordInput } from '@bitrate/ui-react'

export default function Example() {
  return (
    <div>
      <Typography as='h1' size='heading1'>Hello from UI Kit 👋</Typography>
      <PasswordInput placeholder="Enter your password" />
    </div>
  )
}
```

---

## 🎨 Tailwind Configuration

The UI kit uses **Tailwind CSS v4** with CSS-based configuration (`@theme`).

All styles and settings are defined in `globals.css`, which must be imported in your application:

```ts
// In your main CSS file (e.g., app/global.css)
import '@bitrate/ui-react/globals.css';
```

Or import directly in the layout/main component:

```tsx
import '@bitrate/ui-react/globals.css';
```

---

## 📦 Exports

- `@bitrate/ui-react` — main React components and hooks.
- `@bitrate/ui-react/globals.css` — global Tailwind CSS v4 styles with @theme configuration.

---

## 🧩 Component Examples

| Component            | Import                                        | Usage example |
|----------------------|-----------------------------------------------|---------------|
| `Typography`         | `import { Typography } from '@bitrate/ui-react'`   | `<Typography as='h1' size='heading1'>Hello</Typography>` |
| `PasswordInput`      | `import { PasswordInput } from '@bitrate/ui-react'`| `<PasswordInput placeholder="Password" />` |
| `Form`               | `import { Form } from '@bitrate/ui-react'`         | `<Form {...methods}>...</Form>` |
| `Carousel`           | `import { Carousel } from '@bitrate/ui-react'`     | `<Carousel>...</Carousel>` |

---

## 🛠 Development

Local build:

```bash
pnpm -F @bitrate/ui-react build
```

Clean:

```bash
pnpm -F @bitrate/ui-react clean
```

---

## 🧩 Technologies

- **React 19**
- **Next.js 15**
- **TailwindCSS**
- **shadcn/ui** (component style)
- **Base UI** (`@base-ui-components/react`)
- **Lucide Icons**

> If you want to use predefined stories from @shadcn/ui - https://github.com/lloydrichards/shadcn-storybook-registry/tree/main/registry preview (https://registry.lloydrichards.dev/storybook/?path=/docs/design-typography--docs&globals=backgrounds.grid:!true)

💚 Made for [bitrate](https://github.com/Lordpluha/bitrate)
