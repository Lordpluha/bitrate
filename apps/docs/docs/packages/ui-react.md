---
sidebar_position: 1
---

# UI Components

Shared React component library used across all frontend applications.

## 📦 Package: @spotify/ui-react

Reusable UI components built with React, TypeScript, and Tailwind CSS.

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
│   ├── components/      # React components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   └── ...
│   ├── icons/           # Icon components
│   │   └── svgr/       # Generated from SVG
│   ├── lib/            # Utilities
│   ├── styles/         # Global styles
│   │   ├── palette.css
│   │   ├── layout.css
│   │   └── index.css
│   └── index.ts        # Public API
├── dist/               # Built files
│   ├── esm/           # ES Modules
│   ├── cjs/           # CommonJS
│   ├── types/         # TypeScript definitions
│   └── globals.css    # Compiled CSS
└── package.json
```

## 🎨 Components

### Button

```tsx
import { Button } from '@spotify/ui-react'

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>

// Variants: primary, secondary, ghost, danger
// Sizes: sm, md, lg
```

### Input

```tsx
import { Input } from '@spotify/ui-react'

<Input
  type="text"
  placeholder="Enter text..."
  value={value}
  onChange={setValue}
  error={error}
/>
```

### Card

```tsx
import { Card } from '@spotify/ui-react'

<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Footer</Card.Footer>
</Card>
```

### Icons

```tsx
import { Music, Play, Pause } from '@spotify/ui-react/icons'

<Music primaryColor="#3b82f6" className="w-6 h-6" />
<Play className="w-8 h-8" />
<Pause className="w-8 h-8" />
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
# Generate React components from SVG
pnpm svgr:build

# Watch mode
pnpm svgr:dev
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
import '@spotify/ui-react/styles'

// components/MyComponent.tsx
import { Button } from '@spotify/ui-react'
```

### React Native (Mobile)

```tsx
// Only use platform-agnostic components
import { Button } from '@spotify/ui-react/native'
```

### Tauri (Desktop)

```tsx
import { Button, Card } from '@spotify/ui-react'
```

## 🎨 Theming

### CSS Variables

```css
/* Light theme (default) */
:root {
  --sp-color-primary: #3b82f6;
  --sp-color-background: #ffffff;
  --sp-color-text: #1f2937;
}

/* Dark theme */
[data-theme="dark"] {
  --sp-color-primary: #60a5fa;
  --sp-color-background: #1f2937;
  --sp-color-text: #f9fafb;
}
```

### Theme Provider

```tsx
import { ThemeProvider } from '@spotify/ui-react'

<ThemeProvider theme="dark">
  <App />
</ThemeProvider>
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Coverage
pnpm test:cov
```

## 📚 Storybook (Planned)

```bash
# Start Storybook
pnpm storybook

# Build static
pnpm build-storybook
```

---

**Related:**
- [CLI Tools](/packages/cli-tools) - Build utilities
- [Design Tokens](/packages/tokens) - Token system