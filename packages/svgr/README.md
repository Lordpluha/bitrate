# @spotify/svgr

Converter for SVG files to React/TypeScript components with advanced color handling.

## Key Features

- ✨ Automatic detection of monochrome and multicolor icons
- 🎨 Color extraction from all SVG attributes (fill, stroke, style, gradients)
- 🔧 Custom variable names for color control
- 👀 Dev mode with watch
- 📦 TypeScript support
- 🎯 CLI interface

## Installation

```bash
npm install @spotify/svgr
# or
pnpm add @spotify/svgr
# or
yarn add @spotify/svgr
```

## Usage

### CLI

#### Basic conversion

```bash
# Build mode (one-time conversion)
react-svgr build -i @spotify/tokens/icons -o src/icons/svgr

# Dev mode (with file watching)
react-svgr dev -i @spotify/tokens/icons -o src/icons/svgr
```

#### With custom color variables

You can specify an array of variable names to be used for color control in SVG:

```bash
# With one variable
react-svgr build -i ../tokens/icons -o src/icons/svgr --variables "primaryColor"

# With multiple variables
react-svgr build -i ../tokens/icons -o src/icons/svgr --variables "primaryColor,secondaryColor,accentColor"

# In dev mode
react-svgr dev -i ../tokens/icons -o src/icons/svgr --variables "color1,color2"
```

### In npm scripts

```json
{
  "scripts": {
    "icons:build": "react-svgr build -i @company/tokens/icons -o src/icons",
    "icons:watch": "react-svgr dev -i @company/tokens/icons -o src/icons"
  }
}
```

### As a module

```javascript
import { build } from '@spotify/svgr/build';
import { dev } from '@spotify/svgr/dev';

// Build
await build(inputDir, outputDir, {
  colorVarNames: ['primaryColor', 'secondaryColor'],
});

// Watch mode
await dev(inputDir, outputDir, {
  colorVarNames: ['primaryColor'],
});
```

### Examples of generated components

#### Without custom variables (multicolor icon):
```tsx
export const MyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props}>
    <path fill="#FF0000" d="..." />
    <path fill="#00FF00" d="..." />
  </svg>
);
```

#### With custom variables:
```tsx
interface MyIconProps extends React.SVGProps<SVGSVGElement> {
  primaryColor?: string, secondaryColor?: string
}

export const MyIcon = ({ primaryColor, secondaryColor, ...props }: MyIconProps) => (
  <svg {...props}>
    <path fill={primaryColor || "#FF0000"} d="..." />
    <path fill={secondaryColor || "#00FF00"} d="..." />
  </svg>
);
```

#### Monochrome icon (automatic):
```tsx
export const MyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props}>
    <path fill="currentColor" d="..." />
  </svg>
);
```

## Color Detection

The plugin extracts colors from the following sources:

1. **`fill` and `stroke` attributes**
   ```xml
   <path fill="#FF0000" stroke="#000000" />
   ```

2. **Inline styles**
   ```xml
   <path style="fill: #FF0000; stroke: #000000" />
   ```

3. **Gradients**
   ```xml
   <linearGradient>
     <stop stop-color="#FF0000" />
     <stop style="stop-color: #00FF00" />
   </linearGradient>
   ```

## Variable Name Assignment Order

Colors are extracted in the order they appear in the SVG. The first unique color gets the first name from the array, the second gets the second, and so on.

For example, for an SVG with colors `#FF0000`, `#00FF00`, `#0000FF` and variable array `"primary,secondary"`:
- `#FF0000` → `primary`
- `#00FF00` → `secondary`
- `#0000FF` → `color3` (automatically generated name)

## API

### processSvgFiles(inputDir, outputDir, options)

Processes all SVG files from a directory.

**Parameters:**
- `inputDir` - path to the directory with SVG files
- `outputDir` - path for React component output
- `options` - options:
  - `clean` (boolean) - clear the output directory
  - `verbose` (boolean) - verbose output
  - `colorVarNames` (string[]) - array of variable names for colors

### extractColorsWithMapping(svgContent, varNames)

Extracts colors from SVG and creates a mapping to variable names.

**Parameters:**
- `svgContent` - SVG file content
- `varNames` - array of variable names

**Returns:**
```javascript
{
  colors: Set<string>,      // Set of colors in HEX format
  mapping: Map<string, string>  // Color → variable name mapping
}
```
