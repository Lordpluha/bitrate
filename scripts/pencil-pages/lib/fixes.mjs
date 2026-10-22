// Fixes on persistent kit/library nodes outside the generated pages.
import { C } from '../kit.mjs'

/* fixes on persistent kit/library nodes (outside the page-blocks page), applied on every build */
const FIXES = {
  EMSIU: { content: 'Studio speaker' }, // Player bar device label: devices are named by device, never by room (Bitrate Connect)
  e2ahIG: { fill: C.foreground }, // Switch/Unchecked thumb: visible on the dark track (shadcn v4 dark)
  jjufD: { stroke: C.border, strokeWidth: 1 }, // Card/Artist: keeps its edge on the light theme
  dKgOu: { stroke: C.border, strokeWidth: 1 }, // Card/Playlist
  m015cR: { stroke: C.border, strokeWidth: 1 }, // Card/Album
  YSAj4: { fontSize: 13 },
  eGEfP: { fontSize: 14 },
  cNYVw: { fontSize: 12 },
  REBNx: { fontSize: 13 },
  QCCe4: { fontSize: 12 },
  PiTbk: { fontSize: 12 },
}
/** Applies FIXES in place to the library nodes under `n`. */
export const applyFixes = (n) => {
  if (Array.isArray(n)) return n.forEach(applyFixes)
  if (!n || typeof n !== 'object') return
  if (n.id && FIXES[n.id]) Object.assign(n, FIXES[n.id])
  Object.values(n).forEach(applyFixes)
}
