import { LAYOUT_FORMAT_MAP, LAYOUT_PREFIX_MAP, TYPOGRAPHY_FORMAT_MAP, TYPOGRAPHY_PREFIX_MAP } from './constants.mjs'

export const cssBuilder = {
  header: (title, description) => ['/**', ` * ${title}`, ` * ${description}`, ' */', '@theme {'],
  close: () => ['}'],
  build: (parts) => parts.flat().join('\n'),
}

export function formatLayoutVar(tokenKey, key, value) {
  const fmt = LAYOUT_FORMAT_MAP[tokenKey]
  const prefix = LAYOUT_PREFIX_MAP[tokenKey] ?? tokenKey

  if (fmt) {
    const { key: k, value: v, comment } = fmt(key, value)
    const c = comment ? `  /* ${comment} */` : ''
    return `  --${prefix}-${k}: ${v};${c}`
  }

  return `  --${prefix}-${key}: ${value};`
}

export function formatTypographyVar(subKey, key, value) {
  const prefix = TYPOGRAPHY_PREFIX_MAP[subKey] ?? subKey
  const fmt = TYPOGRAPHY_FORMAT_MAP[subKey]

  if (fmt) {
    const { key: k, value: v, comment } = fmt(key, value)
    const c = comment ? `  /* ${comment} */` : ''
    return `  --${prefix}-${k}: ${v};${c}`
  }

  return `  --${prefix}-${key}: ${value};`
}
