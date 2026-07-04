---
sidebar_position: 1
---

# UI Components

Shared React component library used across all frontend applications.

## 📦 Package: @spotify/ui-react

Reusable UI components built with React 19, TypeScript, Base UI, Tailwind v4, and
shadcn-style owned source.

## 🚀 Installation

```bash
# In your app
pnpm add @spotify/ui-react

# Development
cd packages/ui-react
pnpm install
```

## 🏗️ Architecture

```
packages/ui-react/
├── src/
│   ├── components/ui/   # React components
│   │   ├── button/
│   │   ├── input/
│   │   ├── form/
│   │   └── ...
│   ├── icons/           # Icon components
│   │   └── svgr/       # Generated from SVG
│   ├── lib/            # Utilities
│   ├── styles/         # Global styles
│   │   ├── palette.css
│   │   ├── layout.css
│   │   └── index.css
│   └── index.ts         # Public API
├── vitest.config.ts     # Unit, integration, snapshot, screenshot projects
├── components.json      # shadcn CLI configuration
├── dist/                # ESM, CJS, and declarations
└── package.json
```

## 🎨 Components

### Button

```tsx
import { Button } from '@spotify/ui-react'

<Button variant="primary" size="lg" onClick={handleClick}>
  Click me
</Button>

// Variants include default, primary, secondary, outline, ghost, destructive
// Sizes: default, sm, lg, icon
```

### Input

```tsx
import { Input } from '@spotify/ui-react'

<Input
  type="text"
  placeholder="Enter text..."
  value={value}
  onChange={(event) => setValue(event.target.value)}
/>
```

### Form primitives

```tsx
import { Form, Input, Label } from '@spotify/ui-react'

<Form {...form}>
  <Label htmlFor="email">Email</Label>
  <Input id="email" {...form.register('email')} />
</Form>
```

### Icons

```tsx
import { MusicIcon, PlayIcon } from '@spotify/ui-react'

<MusicIcon className="size-6" />
<PlayIcon className="size-8" />
```

## 🛠️ Development

### Build

```bash
# Build all formats
pnpm build

# Watch mode
pnpm dev
```

### Generate Icons

```bash
# SVG generation also runs during the package build
pnpm build
```

### Generate Design Tokens

```bash
# Generate CSS from tokens.json
pnpm gen:tokens
```

## 📝 Usage in Apps

### Next.js (Web)

```tsx
// app/layout.tsx
import '@spotify/ui-react/themes.css'

// components/MyComponent.tsx
import { Button } from '@spotify/ui-react'
```

### Tauri (Desktop)

```tsx
import { Button } from '@spotify/ui-react'
```

## 🎨 Theming

Design tokens originate in `packages/tokens/tokens.json`. The generator writes
`palette.css`, `layout.css`, `typography.css`, and `themes.css`; components consume their
Tailwind v4 utilities instead of hardcoded colours.

## 🧪 Testing

```bash
pnpm test
pnpm test:unit
pnpm test:int
pnpm test:snapshot
pnpm test:screenshot
pnpm test:cov
```

Screenshot tests run in Chromium through Vitest Browser Mode and Playwright.

## 📚 Storybook

```bash
# Start Storybook
pnpm storybook

# Build static
pnpm storybook:build
```

---

**Related:**
- [Testing](/docs/guides/testing)
- [CLI Tools](/docs/packages/cli-tools)
