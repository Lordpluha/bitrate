// Surfaces of the shipped artist workspace (apps/web-artists/src/shared/styles/workspace.css and
// ArtistDashboard.css) as Pencil fills and effects. Every colour is an `artist-workspace.css` token; glass
// opacity is the `--artist-panel-opacity` number variable, so each theme keeps the code's translucency.
import { C } from '../kit.mjs'

/** CSS `linear-gradient(<deg>)` turns clockwise from up; Pencil turns counter-clockwise. */
const pencilAngle = (cssDeg) => (360 - cssDeg) % 360

/** The workspace paints, resolved for the current kit mode (library or page). */
export function artistPaint() {
  const linear = (cssDeg, stops, opacity) => ({
    type: 'gradient',
    gradientType: 'linear',
    rotation: pencilAngle(cssDeg),
    ...(opacity === undefined ? {} : { opacity }),
    colors: stops.map(([color, position]) => ({ color, position })),
  })
  /** A token at partial opacity: a flat gradient carries the alpha the token does not. */
  const tint = (color, opacity) => ({
    type: 'gradient',
    gradientType: 'linear',
    opacity,
    colors: [
      { color, position: 0 },
      { color, position: 1 },
    ],
  })
  const shadow = (y, blur, color, x = 0) => ({
    type: 'shadow',
    shadowType: 'outer',
    offset: { x, y },
    blur,
    color,
  })
  /* .artist-release-workspace-panel: 145° release gradient at the panel opacity, release hairline */
  const releaseGlass = () => ({
    fill: linear(
      145,
      [
        [C.artistReleasePanelStart, 0],
        [C.artistReleasePanelMiddle, 0.55],
        [C.artistReleasePanelEnd, 1],
      ],
      C.artistPanelOpacity,
    ),
    stroke: C.artistReleaseBorder,
    strokeWidth: 1,
    effect: [shadow(12, 30, C.artistShadowReleasePanel)],
  })
  /* sidebar and header on desktop: the header colour at 45% over the aurora, a hairline edge */
  const chrome = (edge) => ({
    fill: tint(C.artistHeader, 0.45),
    stroke: C.artistReleaseBorder,
    strokeWidth: edge,
    effect: [{ type: 'background_blur', radius: 18 }],
  })
  /* .artist-workspace-primary: the 90° action gradient with its glow */
  const action = () => ({
    fill: linear(90, [
      [C.artistActionStart, 0],
      [C.artistActionEnd, 1],
    ]),
    effect: [shadow(5, 16, C.artistShadowAction)],
  })
  /* the mobile menu sheet and drawer: the sidebar gradient */
  const sheet = () => ({
    fill: linear(270, [
      [C.artistSidebarStart, 0],
      [C.artistSidebarEnd, 1],
    ]),
    stroke: C.artistReleaseBorder,
    strokeWidth: 1,
    effect: [shadow(0, 34, C.artistShadowSidebar, 12)],
  })
  const control = () => ({
    fill: C.artistControlSurface,
    stroke: C.artistControlBorder,
    strokeWidth: 1,
  })
  const hairline = (side = 'bottom') => ({
    stroke: C.artistReleaseBorder,
    strokeWidth: { [side]: 1 },
  })
  return { linear, tint, shadow, releaseGlass, chrome, action, sheet, control, hairline }
}
