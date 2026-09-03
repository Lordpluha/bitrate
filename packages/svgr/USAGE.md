# Using @bitrate/svgr

## Quick Start

### 1. Installation

```bash
pnpm add -D @bitrate/svgr
```

### 2. Configure package.json

```json
{
  "scripts": {
    "icons:build": "react-svgr build -i ./icons -o ./src/icons/generated",
    "icons:watch": "react-svgr dev -i ./icons -o ./src/icons/generated"
  }
}
```

### 3. Run

```bash
pnpm icons:build    # One-time generation
pnpm icons:watch    # Watch mode
```

## Typical Use Cases

### From a tokens package in a monorepo

```json
{
  "scripts": {
    "icons": "react-svgr build -i @company/design-tokens/icons -o src/icons"
  }
}
```

### With color variables

```bash
react-svgr build \
  -i ./icons \
  -o ./src/icons \
  --variables "primaryColor,secondaryColor"
```

This creates components with props for color control:

```tsx
<MyIcon primaryColor="#FF0000" secondaryColor="#00FF00" />
```

### Relative paths

```bash
# From a neighboring package
react-svgr build -i ../design-system/icons -o ./src/icons

# From the current directory
react-svgr build -i ./assets/icons -o ./src/components/icons
```

## CLI Options

| Option | Short | Description | Required |
|--------|-------|-------------|----------|
| `--input` | `-i` | Path to SVG files | ✅ |
| `--output` | `-o` | Path for component output | ✅ |
| `--variables` | `--vars` | Color variable names | ❌ |

## Icon Types

### Monochrome (single-color)

If an SVG contains only one unique color, it is automatically replaced with `currentColor`:

```tsx
// Original SVG: <path fill="#000000" />
// Result:
export const Icon = (props) => (
  <svg {...props}>
    <path fill="currentColor" />
  </svg>
);

// Usage:
<Icon className="text-blue-500" /> // Will be blue
```

### Multicolor

Without variables - colors are preserved:

```tsx
export const Icon = (props) => (
  <svg {...props}>
    <path fill="#FF0000" />
    <path fill="#00FF00" />
  </svg>
);
```

With variables - props are added:

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

## Working with Package Scopes

The package supports path resolution through node_modules:

```bash
# Will automatically find node_modules/@company/tokens/icons
react-svgr build -i @company/tokens/icons -o ./src/icons
```

## Integration Examples

### With React + TypeScript

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

### With Tailwind CSS

```tsx
<Icon className="w-6 h-6 text-blue-500 hover:text-blue-600" />
```

### In Storybook

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

Make sure the package is installed:
```bash
pnpm add @company/tokens
```

### Colors not being replaced by variables

Check the color order in SVG. Variables are assigned in order of appearance:
```bash
react-svgr build -i ./icons -o ./out --variables "first,second,third"
```

### Too many files being generated

Use `.gitignore` to exclude generated files:
```
src/icons/generated/
```

And add to package.json:
```json
{
  "files": [
    "dist",
    "!src/icons/generated"
  ]
}
```

## Watch Mode for Development

In dev mode, use watch for automatic regeneration:

```bash
react-svgr dev -i @company/tokens/icons -o ./src/icons
```

When any SVG file changes, the components will be automatically recreated.
