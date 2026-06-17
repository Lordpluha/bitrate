/**
 * Palette generator
 * Auto-detects color scales (objects) and pure colors (strings) from tokens.palette.
 */
export function generatePalette(tokens) {
  if (!tokens.palette) return []
  const lines = []

  for (const [colorName, colorValue] of Object.entries(tokens.palette)) {
    if (colorValue === null || typeof colorValue !== 'object') continue

    lines.push(`  /* ${colorName} */`)

    if (colorName === 'pure') {
      // Pure colors: emit --color-{name} (no scale prefix)
      for (const [name, hex] of Object.entries(colorValue)) {
        lines.push(`  --color-${name}: ${hex};`)
      }
    } else {
      for (const [shade, hex] of Object.entries(colorValue)) {
        lines.push(`  --color-${colorName}-${shade}: ${hex};`)
      }
    }

    lines.push('')
  }

  return lines
}
