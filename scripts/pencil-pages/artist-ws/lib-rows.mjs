// List rows of the workspace: a release row (ReleasesTile, Coming up), the attention row
// (AttentionTile), notification rows (notifications popover, Recent activity), search results
// (WorkspaceSearch), saved accounts (account switcher) and the tile drawer's add row.
import { C, Col, F, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

/** Adds the workspace list rows to the library. */
export function addRows(lib) {
  const { comp, part, add, use, slot, nest } = lib
  const paint = artistPaint()
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width', lineHeight: 1.5 }
  const title = (s, o = {}) =>
    part(
      'title',
      T(s, { fontSize: 12, fontWeight: '500', fill: C.artistForeground, ...wrap, ...o }),
    )
  const meta = (s) => part('meta', T(s, { fontSize: 11, fill: C.artistTextSecondary, ...wrap }))
  const trail = () =>
    slot('trail', { layout: 'horizontal', width: 'fit_content', gap: 8, alignItems: 'center' })
  add(
    comp(
      'Row/Release',
      Row({ name: 'Release Row', width: 520, gap: 12, padding: [10, 0], ...paint.hairline() }, [
        part('cover', use('Cover', { name: 'Cover' })),
        Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
          title('Night Signal'),
          meta('Single · Updated today'),
        ]),
        trail(),
        I('chevron-right', { width: 16, height: 16, fill: C.artistTextSecondary }),
      ]),
    ),
    comp(
      'Row/Attention',
      Row(
        {
          name: 'Attention Row',
          width: 320,
          gap: 10,
          padding: [10, 12],
          cornerRadius: 10,
          fill: paint.tint(C.artistStatusWarning, 0.08),
          stroke: paint.tint(C.artistStatusWarning, 0.35),
          strokeWidth: 1,
        },
        [
          Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
            title('Night Signal has 2 blockers before review'),
            meta('Required before review'),
          ]),
          I('arrow-up-right', { width: 16, height: 16, fill: C.artistStatusWarning }),
        ],
      ),
    ),
  )
  for (const [variant, unread, action] of [
    ['', false, false],
    [' Unread', true, false],
    [' Action', true, true],
  ])
    add(
      comp(
        `Row/Notification${variant}`,
        Row(
          {
            name: 'Notification',
            width: 360,
            gap: 10,
            padding: [10, 12],
            cornerRadius: 10,
            alignItems: 'start',
            ...(unread ? { fill: C.artistSelection } : {}),
          },
          [
            Row(
              {
                name: 'Icon',
                width: 30,
                height: 30,
                cornerRadius: 15,
                justifyContent: 'center',
                fill: paint.tint(action ? C.artistStatusWarning : C.artistIcon, 0.14),
              },
              [
                part(
                  'icon',
                  I('badge-check', {
                    width: 15,
                    height: 15,
                    fill: action ? C.artistStatusWarning : C.artistIcon,
                  }),
                ),
              ],
            ),
            Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
              title('Approved by Bitrate review', unread ? {} : { fontWeight: '400' }),
              meta('Night Signal · 2 h ago'),
            ]),
            ...(unread
              ? [F({ name: 'Unread', width: 8, height: 8, cornerRadius: 4, fill: C.artistIcon })]
              : []),
          ],
        ),
      ),
    )
  for (const active of [false, true])
    add(
      comp(
        `Row/Result${active ? ' Active' : ''}`,
        Row(
          {
            name: 'Result',
            width: 480,
            height: 40,
            gap: 10,
            padding: [0, 12],
            cornerRadius: 8,
            ...(active ? { fill: C.artistSelection } : {}),
          },
          [
            part('icon', I('disc-3', { width: 16, height: 16, fill: C.artistIcon })),
            part('label', T('Night Signal', { fontSize: 12, fill: C.artistForeground, ...wrap })),
          ],
        ),
      ),
    )
  for (const current of [false, true])
    add(
      comp(
        `Row/Account${current ? ' Current' : ''}`,
        Row(
          {
            name: 'Account',
            width: 440,
            gap: 12,
            padding: [10, 12],
            cornerRadius: 12,
            ...(current
              ? { fill: C.artistSelection, stroke: C.artistSelectionBorder, strokeWidth: 1 }
              : paint.control()),
          },
          [
            part('avatar', use('Avatar', { name: 'Avatar' })),
            Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
              title('Mira Sol'),
              meta('mira@nightsignal.fm'),
            ]),
            trail(),
          ],
        ),
      ),
    )
  for (const k of ['Row/Account', 'Row/Account Current']) nest(k, 'avatar', 'Avatar')
  nest('Row/Release', 'cover', 'Cover')
  add(
    comp(
      'Drawer/Item',
      Row(
        {
          name: 'Drawer Item',
          width: 260,
          gap: 8,
          padding: [8, 8, 8, 12],
          cornerRadius: 10,
          ...paint.control(),
        },
        [
          part('label', T('Recent activity', { fontSize: 12, fill: C.artistForeground, ...wrap })),
          use('Button/Icon', { name: 'Add', width: 32, height: 32 }, { icon: { icon: 'plus' } }),
        ],
      ),
    ),
  )
}
