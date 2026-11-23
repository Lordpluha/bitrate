// The artist library's single page: one flex root on the workspace backdrop, a section per family,
// each component in a labelled cell. Every component must appear in exactly one section.
import { C, Col, F, H, Row, T } from '../kit.mjs'
import { workspaceCanvas } from './canvas.mjs'

const SECTIONS = [
  [
    'Foundations',
    'Poppins type at the workspace and public-page sizes, the Bitrate mark and lockup, the Google and Facebook marks, avatar, divider, skeleton, spinner and the phone status bar.',
    /^(Text|Logo|Mark\/|Avatar|Divider|Skeleton$|Spinner|Status Bar)/,
  ],
  [
    'Actions and status',
    'The gradient primary action with its glow, secondary, outline, ghost and danger buttons in three sizes, the icon button, the social sign-in buttons (locked until consent), status chips in the artist status tones and the allowance bar.',
    /^(Button|Status\/|Progress)/,
  ],
  [
    'Forms',
    'Inputs, textarea, select, password and one-time code fields on the control surface, field errors, consent checkboxes, password rules, switches, option cards, checks and the tab strip.',
    /^(Field|Switch|Option|Check|Rule|Tabs?(\/|$))/,
  ],
  [
    'Bento tiles',
    'Glass tiles on the 12-column grid (64px rows, 20px gaps) with an icon heading; the hue tile adds its corner glow. Rows that live in tiles: setting, key–value, date, table and the bare numerals.',
    /^(Tile|Row\/|Table|Stat(\/First)?$)/,
  ],
  [
    'States',
    'Alerts in the four status tones, the empty and error tiles, and loading skeletons shaped like the tile and row they replace.',
    /^(Alert|State|Skeleton\/)/,
  ],
  [
    'Release workspace',
    'The cover-tinted release header with the next action, and the stage stepper with the Promotion stage.',
    /^(Release|Step)/,
  ],
  [
    'Public pages',
    'The auth card and its divider, panel, popover with option rows, toasts, the legal note and list item, and the landing: glass header with section dock, eyebrow and capability pills, studio window and stage tabs, journey step, area chart, release sleeve, footer and the phone menu sheet.',
    /^(Auth|Landing|Legal|Toast|Popover|Panel$|Menu\/|Chart)/,
  ],
  [
    'Workspace pages',
    'Release covers, the stage ring, premiere countdown, track player and share bar; the first-run poster, the Add a block drawer and the modal; the music catalogue table, filters and pagination; the now-playing island.',
    /^(Cover|Ring|Countdown|Player|Share|Poster|Drawer|Modal|Catalogue|Page\/|Select|Island)/,
  ],
  [
    'Release stages',
    'Split totals, the file drop zone, upload progress and artwork tile, chips and role toggles, the delivery matrix with its status cells, and the plan → partner → stores flow steps. Their rows (track, checklist, credit, identifier, store, pick, progress step, link) sit with the bento rows.',
    /^(Split|Dropzone|Upload|Artwork|Cell|Matrix|Flow|Chip)/,
  ],
  [
    'Shell',
    'Navigation items with the active pill, the expanded and collapsed glass sidebars, the 4rem glass header, the phone header and menu, and the desktop and phone shells.',
    /^(Nav|Sidebar|Header|Mobile|Shell)/,
  ],
]
const cellWidth = (b) =>
  typeof b.width === 'number'
    ? Math.max(180, b.width)
    : /Stat|Nav\/(Item|Preference|Account)/.test(b.name)
      ? 260
      : 220

/** Lays the components out as the library page. */
export function libraryPage(blocks) {
  const used = new Set()
  const section = ([title, desc, re]) => {
    const items = blocks.filter((b) => re.test(b.name) && !used.has(b.name))
    for (const b of items) used.add(b.name)
    const rows = []
    let line = []
    let width = 0
    for (const b of items) {
      const w = cellWidth(b)
      if (width && width + w > 1640) {
        rows.push(line)
        line = []
        width = 0
      }
      line.push(
        Col({ name: `Cell / ${b.name}`, gap: 10, width: w }, [
          T(b.name, { fontSize: 12, fill: C.artistTextSecondary }),
          b,
        ]),
      )
      width += w + 40
    }
    if (line.length) rows.push(line)
    return Col({ name: title, gap: 24, width: 'fill_container' }, [
      H(title, 26, { fill: C.artistForeground }),
      T(desc, {
        fill: C.artistTextSecondary,
        width: 820,
        textGrowth: 'fixed-width',
        lineHeight: 1.5,
      }),
      ...rows.map((r, i) =>
        Row({ name: `${title} Row ${i + 1}`, gap: 40, alignItems: 'start' }, r),
      ),
    ])
  }
  const root = F(
    {
      name: 'Bitrate Artist Design System',
      x: 0,
      y: 0,
      width: 1760,
      layout: 'vertical',
      gap: 72,
      padding: 64,
      fill: workspaceCanvas(),
    },
    [
      H('Bitrate for Artists', 40, { fill: C.artistForeground }),
      T(
        'The artist workspace’s own design system, drawn after the shipped apps/web-artists living workspace: a diagonal canvas with three brand washes, translucent glass panels, a glass sidebar and header, the gradient purple action. Colours and glass opacity are the code’s tokens (artist-workspace.css and the shared roles) in three themes — Dark, Light, Dim. Artist workspace screens import this file as `artist` and use only its components. Source: scripts/pencil-pages/artist-lib.mjs.',
        { fill: C.artistTextSecondary, width: 900, textGrowth: 'fixed-width', lineHeight: 1.5 },
      ),
      ...SECTIONS.map(section),
    ],
  )
  const missing = blocks.filter((b) => !used.has(b.name)).map((b) => b.name)
  if (missing.length) throw new Error(`not on the library page: ${missing.join(', ')}`)
  return root
}
