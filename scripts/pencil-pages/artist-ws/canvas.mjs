// The workspace backdrop (.artist-dashboard + .artist-dashboard-aurora): the diagonal canvas gradient
// and three blurred brand washes, as layers of one frame's own fill. The film grain has no Pencil
// equivalent (no noise fill) and is left out; the aurora's motion is described in the frame context.
import { C } from '../kit.mjs'

/* fully transparent stops (allowed: they carry no colour, only the fade) */
const CLEAR = '#7C3AED00'

/** The backdrop fill layers for a workspace screen or the library page. */
export function workspaceCanvas() {
  const wash = (color, x, y, w, h) => ({
    type: 'gradient',
    gradientType: 'radial',
    center: { x, y },
    size: { width: w, height: h },
    colors: [
      { color, position: 0 },
      { color: CLEAR, position: 1 },
    ],
  })
  return [
    /* Pencil's own 135° diagonal (the CSS stops in artist-workspace.css are converted from it) */
    {
      type: 'gradient',
      gradientType: 'linear',
      rotation: 135,
      colors: [
        { color: C.artistCanvasStart, position: 0 },
        { color: C.artistCanvasMiddle, position: 0.62 },
        { color: C.artistCanvasEnd, position: 1 },
      ],
    },
    /* aurora 1: top right, 60vmax; aurora 2: bottom left, 56vmax; aurora 3: centre right, 38vmax */
    wash(C.artistAurora1, 0.86, 0.04, 1.1, 1.3),
    wash(C.artistAurora2, 0.12, 0.98, 1.0, 1.2),
    wash(C.artistAurora3, 0.62, 0.42, 0.62, 0.7),
  ]
}
