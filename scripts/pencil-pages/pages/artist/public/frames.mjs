// Screen frames of the public artist pages: no workspace shell, the living-workspace backdrop (canvas +
// aurora) as the screen frame's own fill, the content centred on desktop (1440) and phone (390, under
// the status bar). `height` fixes a short page (404, session error) to one screen.
import { workspaceCanvas } from '../../../artist-ws/canvas.mjs'
import { F } from '../../../kit.mjs'

/** Desktop and phone frames for public pages, bound to the screen helpers `ui`. */
export function publicFrames(ui) {
  const { W, Col } = ui
  const screen = (name, width, height, children) =>
    F(
      {
        name,
        width,
        height: height ?? 'fit_content',
        layout: 'vertical',
        clip: true,
        fill: workspaceCanvas(),
      },
      children,
    )
  const page = (nodes, center, padding, gap, height) =>
    Col(
      {
        name: 'Page',
        width: 'fill_container',
        gap,
        padding: center ? padding : 0,
        alignItems: center ? 'center' : 'start',
        ...(height ? { height: 'fill_container', justifyContent: 'center' } : {}),
      },
      nodes.flat(),
    )
  const desktop = (nodes, { center = true, height } = {}) =>
    screen('Desktop', 1440, height, [page(nodes, center, [72, 48, 96, 48], 24, height)])
  const mobile = (nodes, { center = true, height } = {}) =>
    screen('Mobile', 390, height ? 844 : undefined, [
      W('Status Bar', { name: 'Status Bar' }),
      page(nodes, center, [16, 16, 40, 16], 16, height),
    ])
  return { desktop, mobile }
}
