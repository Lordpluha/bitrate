/**
 * CSS variable prefix overrides for layout token keys.
 * Any top-level key not listed here will use the key itself as prefix.
 * These match Tailwind v4 conventions.
 */
export const LAYOUT_PREFIX_MAP = {
  'spacing': 'spacing',
  'border-radius': 'radius',
  'border-width': 'border',
  'container': 'container',
  'breakpoints': 'breakpoint',
  'z-index': 'z',
  'shadows': 'shadow',
  'opacity': 'opacity',
  'aspect-ratio': 'aspect',
}

/**
 * Per-key value/name transforms for layout tokens.
 * Return { key, value, comment } from (key, value).
 */
export const LAYOUT_FORMAT_MAP = {
  spacing: (key, value) => {
    if (key === '0') return { key: '0', value: '0', comment: null }
    if (key === 'px') return { key: 'px', value: '1px', comment: null }
    const name = key.replace('.', '_')
    const px = parseFloat(value)
    const comment = !Number.isNaN(px) && value !== '0' ? `${px * 16}px` : null
    return { key: name, value, comment }
  },
  'border-radius': (key, value) => ({
    key,
    value,
    comment:
      value !== '0' && value !== '9999px' && !Number.isNaN(parseFloat(value))
        ? `${parseFloat(value) * 16}px`
        : null,
  }),
  container: (key, value) => ({
    key,
    value,
    comment:
      value !== '100%' && !Number.isNaN(parseFloat(value))
        ? `${parseFloat(value) * 16}px`
        : null,
  }),
  breakpoints: (key, value) => ({ key, value: `${value}px`, comment: null }),
}

/**
 * CSS variable prefix overrides for typography sub-keys.
 * Any sub-key not listed here will use the sub-key itself as prefix.
 */
export const TYPOGRAPHY_PREFIX_MAP = {
  'font-family': 'font',
  'font-size': 'text',
  'font-weight': 'font',
  'line-height': 'leading',
  'letter-spacing': 'tracking',
}

/** Per-key value transforms for typography tokens. */
export const TYPOGRAPHY_FORMAT_MAP = {
  'font-size': (key, value) => ({
    key,
    value,
    comment: !Number.isNaN(parseFloat(value)) ? `${parseFloat(value) * 16}px` : null,
  }),
}

/** Top-level keys that are NOT layout sections */
export const NON_LAYOUT_KEYS = new Set(['$schema', 'palette', 'typography', 'themes'])
