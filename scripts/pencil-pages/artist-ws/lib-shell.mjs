// The workspace shell: the 4rem glass header (breadcrumb, search, notifications, create), the phone
// header and menu sheet, and the desktop and phone shells with a content slot. The backdrop (canvas +
// aurora) is the screen frame's own fill (canvas.mjs), so the glass shows it through.
import { C, Col, F, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

/** Adds the header, phone header, menu and both shells to the library. */
export function addShell(lib, nav) {
  const { comp, part, add, use, nest, slot, reg } = lib
  const paint = artistPaint()
  const muted = (s, o = {}) => T(s, { fontSize: 13, fill: C.artistTextSecondary, ...o })
  add(
    comp(
      'Header',
      Row(
        {
          name: 'Header',
          width: 1192,
          height: 64,
          padding: [0, 32],
          gap: 12,
          ...paint.chrome({ bottom: 1 }),
        },
        [
          Row({ name: 'Breadcrumb', width: 'fill_container', gap: 8 }, [
            part('section', muted('Workspace')),
            muted('/'),
            part('crumb', T('Promotion', { fontSize: 13, fill: C.artistForeground })),
          ]),
          part(
            'search',
            Row(
              {
                name: 'Search',
                width: 288,
                height: 40,
                padding: [0, 12],
                gap: 10,
                cornerRadius: 10,
                stroke: C.artistReleaseBorder,
                strokeWidth: 1,
              },
              [
                I('search', { width: 16, height: 16, fill: C.artistTextSecondary }),
                muted('Search your workspace', {
                  width: 'fill_container',
                  textGrowth: 'fixed-width',
                }),
                muted('⌘K', { fontSize: 11 }),
              ],
            ),
          ),
          part('bell', use('Button/Icon', { name: 'Notifications' }, { icon: { icon: 'bell' } })),
          part(
            'action',
            use(
              'Button/Primary',
              { name: 'Create', cornerRadius: 10 },
              { icon: { icon: 'plus' }, label: { content: 'New release' } },
            ),
          ),
        ],
      ),
    ),
  )
  nest('Header', 'action', 'Button/Primary')
  add(
    comp(
      'Mobile/Header',
      Row({ name: 'Mobile Header', width: 390, height: 64, padding: [0, 12], gap: 8 }, [
        use('Button/Icon', { name: 'Menu' }, { icon: { icon: 'menu' } }),
        Row({ name: 'Brand', gap: 8, width: 'fill_container' }, [
          use('Logo/Mark', { name: 'Mark' }),
          T('Bitrate', { fontSize: 18, fill: C.artistForeground }),
        ]),
        part('bell', use('Button/Icon', { name: 'Notifications' }, { icon: { icon: 'bell' } })),
      ]),
    ),
    comp(
      'Mobile/Menu',
      Col(
        {
          name: 'Mobile Menu',
          width: 320,
          gap: 8,
          padding: 16,
          cornerRadius: 16,
          ...paint.sheet(),
        },
        [
          use('Logo/Lockup', { name: 'Lockup' }),
          F({ name: 'Gap', width: 'fill_container', height: 8 }),
          ...nav.map(([key, icon, label]) =>
            part(
              `nav_${key}`,
              use(
                'Nav/Item',
                { name: `Nav / ${label}` },
                { icon: { icon }, label: { content: label } },
              ),
            ),
          ),
        ],
      ),
    ),
  )
  for (const k of Object.keys(reg['Mobile/Menu'].parts)) nest('Mobile/Menu', k, 'Nav/Item')
  add(
    comp(
      'Shell/Desktop',
      Row({ name: 'Artist Shell', width: 1440, gap: 0, alignItems: 'start' }, [
        part('sidebar', use('Sidebar', { name: 'Sidebar', height: 'fill_container' })),
        Col({ name: 'Main', width: 'fill_container', gap: 0 }, [
          part('header', use('Header', { name: 'Header', width: 'fill_container' })),
          slot('content', { gap: 20, padding: [36, 48, 48, 48] }),
        ]),
      ]),
    ),
    comp(
      'Shell/Mobile',
      Col({ name: 'Artist Shell Mobile', width: 390, gap: 0 }, [
        use('Status Bar', { name: 'Status Bar' }),
        part('header', use('Mobile/Header', { name: 'Header' })),
        slot('content', { gap: 16, padding: [12, 16, 40, 16] }),
      ]),
    ),
  )
  nest('Shell/Desktop', 'sidebar', 'Sidebar')
  nest('Shell/Desktop', 'header', 'Header')
}
