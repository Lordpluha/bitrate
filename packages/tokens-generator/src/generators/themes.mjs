const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

const IMPORTS = ['./palette.css', './typography.css', './layout.css', './animations.css']

/**
 * Themes generator
 * Auto-detects all theme names and all token keys within each theme.
 * First theme is treated as default.
 */
export function generateThemes(tokens) {
  if (!tokens.themes) return ''

  const themeNames = Object.keys(tokens.themes)
  const defaultTheme = themeNames[0]
  const variantThemes = themeNames.slice(1)

  const buildTheme = (theme, selector) => {
    const lines = [`${selector} {`]
    for (const [key, value] of Object.entries(theme)) {
      lines.push(`  --color-${key}: ${value};`)
    }
    lines.push('}')
    return lines
  }

  const customVariants = variantThemes.map(
    (name) => `@custom-variant ${name} (&:is(.${name} *));`,
  )

  const themeSections = themeNames.flatMap((name) => {
    const selector = name === defaultTheme ? '@theme' : `:root.${name}`
    const label =
      name === defaultTheme
        ? `${capitalize(name)} Theme (Default)`
        : `${capitalize(name)} Theme`
    return ['', '/**', ` * ${label}`, ' */', ...buildTheme(tokens.themes[name], selector)]
  })

  return [
    ...IMPORTS.map((f) => `@import "${f}";`),
    '',
    ...customVariants,
    '',
    '/**',
    ' * Semantic Theme Tokens',
    ' * These tokens reference the palette and provide semantic meaning.',
    ' */',
    ...themeSections,
  ].join('\n')
}
