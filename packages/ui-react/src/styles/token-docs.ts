/**
 * Reads the design tokens straight out of the stylesheets that define them.
 *
 * The CSS under `src/styles/` is the source of truth: there is no generator and no
 * intermediate manifest, so a documentation page that wants the token list has to read the
 * same files the browser does. Doing that with `import.meta.glob` keeps the pages correct
 * for free — a new part-file appears in Storybook the moment it exists, and a renamed role
 * cannot leave a stale duplicate behind.
 */

/** One role's value in one theme: as authored, and followed down to a literal. */
export type TokenValue = {
  raw: string
  resolved: string | null
}

/** A semantic role declared by a theme part-file. */
type TokenRole = {
  name: string
  variable: string
  description: string | null
  values: Record<string, TokenValue>
}

/** One theme part-file and the roles it owns. */
export type TokenGroup = {
  file: string
  title: string
  description: string | null
  roles: TokenRole[]
}

/** A single palette entry — a raw colour with no semantic meaning. */
export type PaletteColor = {
  name: string
  shade: string
  variable: string
  value: string
}

/** The variable map each theme resolves against: the palette plus that theme's own roles. */
type ThemeVariables = {
  dark: Map<string, string>
  light: Map<string, string>
}

/** A titled run of palette entries, as sectioned by the comments in `palette.css`. */
export type PaletteSection = {
  title: string
  colors: PaletteColor[]
}

const DECLARATION = /(?:\/\*\s*(.*?)\s*\*\/\s*)?(--color-[\w-]+)\s*:\s*([^;]+);/g
const VAR_REFERENCE = /^var\(\s*(--[\w-]+)\s*\)$/
const THEME_BLOCK = /@theme\s*\{([\s\S]*?)\n\}/
const LIGHT_BLOCK = /:root\.light\s*\{([\s\S]*?)\n\}/
const FIRST_COMMENT = /\/\*\*\s*\n([\s\S]*?)\*\//

/**
 * Reads the file's leading doc comment: first line is the title, the rest — however many
 * lines it wraps onto — is the description.
 */
function readHeader(css: string): { title: string | null; description: string | null } {
  const body = FIRST_COMMENT.exec(css)?.[1] ?? ''
  const lines = body
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, '').trim())
    .filter(Boolean)
  return { title: lines[0] ?? null, description: lines.slice(1).join(' ') || null }
}

/** Pulls `-- name: value` pairs, with the comment above each one, out of one CSS block. */
function readDeclarations(
  block: string,
): Map<string, { value: string; description: string | null }> {
  const found = new Map<string, { value: string; description: string | null }>()
  for (const [, description, variable, value] of block.matchAll(DECLARATION)) {
    if (variable === undefined || value === undefined) continue
    found.set(variable, { value: value.trim(), description: description ?? null })
  }
  return found
}

/** Follows a chain of single `var(--x)` references to a literal; null if it dead-ends or loops. */
function resolve(value: string, variables: Map<string, string>): string | null {
  const seen = new Set<string>()
  let current: string | undefined = value

  while (typeof current === 'string') {
    const match = VAR_REFERENCE.exec(current.trim())
    if (!match) return current
    const reference = match[1]
    if (reference === undefined || seen.has(reference) || !variables.has(reference)) return null
    seen.add(reference)
    current = variables.get(reference)
  }

  return null
}

const paletteCss = import.meta.glob('./palette.css', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>
const themeCss = import.meta.glob('./themes/**/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Every palette entry, grouped by the section comments in `palette.css`. */
export function readPalette(): PaletteSection[] {
  const css = Object.values(paletteCss)[0] ?? ''
  const block = THEME_BLOCK.exec(css)?.[1] ?? ''
  const sections: PaletteSection[] = []

  for (const line of block.split('\n')) {
    const section = /^\s*\/\*\s*(.+?)\s*\*\/\s*$/.exec(line)
    if (section?.[1]) {
      sections.push({ title: section[1], colors: [] })
      continue
    }
    const declaration = /^\s*(--color-([\w-]+))\s*:\s*([^;]+);/.exec(line)
    if (!declaration || sections.length === 0) continue
    const [, variable, name, value] = declaration
    if (variable === undefined || name === undefined || value === undefined) continue
    const shade = name.split('-').at(-1) ?? name
    sections.at(-1)?.colors.push({ name, shade, variable, value: value.trim() })
  }

  return sections.filter((section) => section.colors.length > 0)
}

/** Every semantic role, grouped by the part-file that declares it. */
export function readThemeGroups(): { themes: string[]; groups: TokenGroup[] } {
  const palette = new Map<string, string>()
  for (const section of readPalette()) {
    for (const color of section.colors) palette.set(color.variable, color.value)
  }

  const files = Object.entries(themeCss)
    .filter(([path]) => !path.endsWith('/themes.css'))
    .sort(([a], [b]) => a.localeCompare(b))

  /* Both themes resolve against the palette plus their own roles, because a component role
     aliases the semantic role it is built on rather than a palette entry. */
  const scoped: ThemeVariables = { dark: new Map(palette), light: new Map(palette) }
  const parsed = files.map(([path, css]) => {
    const dark = readDeclarations(THEME_BLOCK.exec(css)?.[1] ?? '')
    const light = readDeclarations(LIGHT_BLOCK.exec(css)?.[1] ?? '')
    for (const [variable, entry] of dark) scoped.dark.set(variable, entry.value)
    for (const [variable, entry] of light) scoped.light.set(variable, entry.value)
    return { path, css, dark, light }
  })

  const groups = parsed.map(({ path, css, dark, light }) => {
    const header = readHeader(css)
    return {
      file: path.replace('./themes/', 'themes/'),
      title: header.title ?? path,
      description: header.description,
      roles: [...dark.entries()].map(([variable, entry]) => ({
        name: variable.replace('--color-', ''),
        variable,
        description: entry.description,
        values: {
          dark: { raw: entry.value, resolved: resolve(entry.value, scoped.dark) },
          light: {
            raw: light.get(variable)?.value ?? entry.value,
            resolved: resolve(light.get(variable)?.value ?? entry.value, scoped.light),
          },
        },
      })),
    }
  })

  return { themes: ['dark', 'light'], groups: groups.filter((group) => group.roles.length > 0) }
}
