import { formatTypographyVar } from '../css-builder.mjs'

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

/**
 * Typography generator
 * Auto-detects all sub-keys of tokens.typography, including semantic tokens.
 */
export function generateTypography(tokens) {
  if (!tokens.typography) return []
  const lines = []

  for (const [subKey, entries] of Object.entries(tokens.typography)) {
    if (subKey === 'semantic') continue
    if (!entries || typeof entries !== 'object') continue

    const sectionName = capitalize(subKey.replace(/-/g, ' '))
    lines.push(`  /* ${sectionName} */`)

    for (const [key, value] of Object.entries(entries)) {
      lines.push(formatTypographyVar(subKey, key, value))
    }
    lines.push('')
  }

  if (tokens.typography.semantic) {
    lines.push('  /* Semantic Typography Tokens */', '')

    for (const [element, props] of Object.entries(tokens.typography.semantic)) {
      lines.push(`  /* ${capitalize(element)} */`)
      for (const [prop, value] of Object.entries(props)) {
        lines.push(`  --typography-${element}-${prop}: ${value};`)
      }
      lines.push('')
    }
  }

  return lines
}
