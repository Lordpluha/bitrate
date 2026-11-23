// Navigation pieces (DashboardDesignNavigation): an item and its active pill (the sliding
// .artist-workspace-nav-pill), rail items for the collapsed sidebar, a preference button, the collapse
// control and the account row.
import { C, Col, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

/** Adds navigation items, preference, collapse and account to the library. */
export function addNavItems(lib) {
  const { comp, part, add, use } = lib
  const paint = artistPaint()
  const pill = {
    fill: C.artistSelection,
    stroke: paint.tint(C.artistSelectionBorder, 0.3),
    strokeWidth: 1,
  }
  const item = (name, active, rail) =>
    comp(
      name,
      Row(
        {
          name: 'Nav Item',
          width: rail ? 44 : 'fill_container',
          height: 44,
          padding: rail ? 0 : [0, 13],
          gap: 14,
          cornerRadius: 8,
          ...(rail ? { justifyContent: 'center' } : {}),
          ...(active ? pill : {}),
        },
        [
          part(
            'icon',
            I('layout-dashboard', {
              width: 20,
              height: 20,
              fill: active ? C.artistIcon : C.artistTextSecondary,
            }),
          ),
          ...(rail
            ? []
            : [
                part(
                  'label',
                  T('Dashboard', {
                    fontSize: 13,
                    fill: active ? C.artistForeground : C.artistTextSecondary,
                  }),
                ),
              ]),
        ],
      ),
    )
  add(
    item('Nav/Item', false),
    item('Nav/Item Active', true),
    item('Nav/Rail Item', false, true),
    item('Nav/Rail Item Active', true, true),
    comp(
      'Nav/Preference',
      Row(
        {
          name: 'Preference',
          width: 'fill_container',
          height: 40,
          padding: [0, 12],
          gap: 12,
          cornerRadius: 12,
        },
        [
          part('icon', I('moon', { width: 16, height: 16, fill: C.artistTextSecondary })),
          part('label', T('Dark', { fontSize: 13, fill: C.artistTextSecondary })),
        ],
      ),
    ),
    comp(
      'Nav/Collapse',
      Row(
        {
          name: 'Collapse',
          width: 32,
          height: 32,
          cornerRadius: 16,
          justifyContent: 'center',
          ...paint.control(),
        },
        [
          part(
            'icon',
            I('panel-left-close', { width: 16, height: 16, fill: C.artistTextSecondary }),
          ),
        ],
      ),
    ),
    comp(
      'Nav/Account',
      Row(
        {
          name: 'Account',
          width: 'fill_container',
          gap: 10,
          padding: 10,
          cornerRadius: 12,
          fill: C.artistAccountSurface,
        },
        [
          use('Avatar', { name: 'Avatar' }),
          Col({ name: 'Who', gap: 0, width: 'fill_container' }, [
            part(
              'name',
              T('Demo artist', { fontSize: 12, fontWeight: '500', fill: C.artistForeground }),
            ),
            part('email', T('demo@bitrate.fm', { fontSize: 10, fill: C.artistTextSecondary })),
          ]),
          I('chevrons-up-down', { width: 14, height: 14, fill: C.artistTextSecondary }),
        ],
      ),
    ),
  )
}
