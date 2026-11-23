// Floating workspace pieces: the phone menu drawer (DashboardMobileMenu: brand and close, the
// "Artist workspace" sections, preferences and the account with sign out) and the now-playing island
// (NowPlayingIsland: spinning cover, title, equaliser, play/pause and close; expanded with the seek bar).
import { C, Col, F, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

/** Adds the phone menu drawer and the now-playing island to the library. */
export function addIsland(lib) {
  const { comp, part, add, slot, use } = lib
  const paint = artistPaint()
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width' }
  add(
    comp(
      'Mobile/Drawer',
      Col(
        {
          name: 'Menu Drawer',
          width: 320,
          height: 844,
          gap: 0,
          padding: [12, 12, 20, 12],
          ...paint.sheet(),
        },
        [
          Row(
            {
              name: 'Top',
              width: 'fill_container',
              gap: 12,
              padding: [12, 12, 40, 12],
              alignItems: 'start',
            },
            [
              use('Logo/Lockup', { name: 'Lockup' }),
              F({ name: 'Space', width: 'fill_container', height: 1 }),
              use('Button/Icon', { name: 'Close' }, { icon: { icon: 'x' } }),
            ],
          ),
          Col({ name: 'Sections', gap: 16, width: 'fill_container', height: 'fill_container' }, [
            T('ARTIST WORKSPACE', { fontSize: 10, letterSpacing: 1, fill: C.artistTextSecondary }),
            slot('nav', { gap: 4 }),
            slot('prefs', { gap: 4 }),
          ]),
          slot('account', { gap: 12 }),
        ],
      ),
    ),
  )
  const eq = () =>
    Row(
      { name: 'Equaliser', gap: 2, height: 16, alignItems: 'end' },
      [6, 14, 9, 12].map((h, i) =>
        F({ name: `Bar ${i + 1}`, width: 3, height: h, cornerRadius: 1, fill: C.artistIcon }),
      ),
    )
  for (const expanded of [false, true])
    add(
      comp(
        `Island/Now Playing${expanded ? ' Expanded' : ''}`,
        Col(
          {
            name: 'Now Playing',
            width: 360,
            gap: 10,
            padding: [8, 8, 8, 8],
            cornerRadius: expanded ? 22 : 30,
            ...paint.sheet(),
          },
          [
            Row({ name: 'Row', width: 'fill_container', gap: 10 }, [
              part('cover', use('Cover', { name: 'Cover', cornerRadius: 22 })),
              Col({ name: 'Text', gap: 0, width: 'fill_container' }, [
                part(
                  'title',
                  T('Night Signal', {
                    fontSize: 12,
                    fontWeight: '500',
                    fill: C.artistForeground,
                    ...wrap,
                  }),
                ),
                part(
                  'subtitle',
                  T('Mira Sol', { fontSize: 11, fill: C.artistTextSecondary, ...wrap }),
                ),
              ]),
              eq(),
              Row(
                {
                  name: 'Toggle',
                  width: 36,
                  height: 36,
                  cornerRadius: 18,
                  justifyContent: 'center',
                  ...paint.action(),
                },
                [part('toggle', I('pause', { width: 15, height: 15, fill: C.primaryForeground }))],
              ),
              I('x', { width: 16, height: 16, fill: C.artistTextSecondary }),
            ]),
            ...(expanded
              ? [
                  Col({ name: 'More', gap: 6, width: 'fill_container', padding: [0, 8, 6, 8] }, [
                    use('Progress', { name: 'Seek', width: 'fill_container' }, {}),
                    Row(
                      { name: 'Meta', width: 'fill_container', justifyContent: 'space_between' },
                      [
                        part(
                          'time',
                          T('1:12 / 3:42', { fontSize: 11, fill: C.artistTextSecondary }),
                        ),
                        part(
                          'link',
                          T('Open release', {
                            fontSize: 11,
                            fontWeight: '500',
                            fill: C.artistIcon,
                          }),
                        ),
                      ],
                    ),
                  ]),
                ]
              : []),
          ],
        ),
      ),
    )
}
