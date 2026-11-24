// Estimates the flex widths of an expanded frame tree (see expand-refs.mjs) and lists the texts that
// get squeezed: a fixed-width text (or a stretched frame holding text) narrower than 30px with more
// than four characters is a column collapsed by its neighbours — an empty cell or a 1px sliver.

const MIN_WIDTH = 30
const visible = (n) => n && typeof n === 'object' && n.enabled !== false
const pad = (p = 0) => {
  if (typeof p === 'number') return [p, p]
  if (p.length === 2) return [p[1], p[1]]
  return [p[3] ?? 0, p[1] ?? 0]
}
const horizontal = (n) => n.type === 'frame' && (n.layout ?? 'horizontal') === 'horizontal'
const fixedText = (n) => n.type === 'text' && /^fixed-width/.test(n.textGrowth ?? '')
const isFill = (n) => typeof n.width === 'string' && n.width.startsWith('fill_container')

/* the width a node asks for when it is not stretched: its number, or its content */
const intrinsic = (n) => {
  if (typeof n.width === 'number') return n.width
  if (isFill(n)) return 0
  if (n.type === 'text') {
    if (fixedText(n)) return 0
    return String(n.content ?? '').length * (n.fontSize ?? 14) * 0.55
  }
  if (n.type === 'icon_font') return n.width ?? 16
  if (n.type !== 'frame' || n.layout === 'none') return 0
  const kids = (n.children ?? []).filter(visible)
  const [l, r] = pad(n.padding)
  const sizes = kids.map(intrinsic)
  if (!horizontal(n)) return l + r + Math.max(0, ...sizes)
  return l + r + sizes.reduce((a, b) => a + b, 0) + Math.max(0, kids.length - 1) * (n.gap ?? 0)
}

/* the longest text inside a frame, so a squeezed frame is reported by what it hides */
const longestText = (n) => {
  if (!visible(n)) return ''
  if (n.type === 'text') return String(n.content ?? '')
  return (n.children ?? []).map(longestText).reduce((a, b) => (b.length > a.length ? b : a), '')
}

/** Lists `{ name, content, width }` for squeezed texts under `node`, laid out `width` wide. */
export function narrowTexts(node, width = intrinsic(node), trail = [], hits = []) {
  if (!visible(node)) return hits
  const name = [...trail, node.name ?? node.id].join(' > ')
  const content = String(node.content ?? '')
  if (fixedText(node) && width < MIN_WIDTH && content.length > 4)
    hits.push({ name, content, width: Math.round(width) })
  /* a stretched frame squeezed below the minimum hides its texts, whatever their growth */
  if (node.type === 'frame' && isFill(node) && width < MIN_WIDTH && longestText(node).length > 4) {
    hits.push({ name, content: longestText(node), width: Math.round(width) })
    return hits
  }
  if (node.type !== 'frame' || node.layout === 'none') return hits
  const kids = (node.children ?? []).filter(visible)
  const [l, r] = pad(node.padding)
  const inner = Math.max(0, width - l - r)
  const next = [...trail, node.name ?? node.id].slice(-4)
  if (!horizontal(node)) {
    for (const k of kids) narrowTexts(k, isFill(k) ? inner : intrinsic(k), next, hits)
    return hits
  }
  const fills = kids.filter(isFill)
  const taken =
    kids.filter((k) => !isFill(k)).reduce((a, k) => a + intrinsic(k), 0) +
    Math.max(0, kids.length - 1) * (node.gap ?? 0)
  const share = fills.length ? Math.max(0, inner - taken) / fills.length : 0
  for (const k of kids) narrowTexts(k, isFill(k) ? share : intrinsic(k), next, hits)
  return hits
}
