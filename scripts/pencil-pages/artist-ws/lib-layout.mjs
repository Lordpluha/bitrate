// Workspace layout pieces: the first-run poster (DashboardView FirstReleasePrompt, with its two
// marquee lines), a tile in Customize mode (move handle, remove, resize corner; FreeGridCanvas), the
// "Add a block" drawer (TileDrawer) and the workspace modal (WorkspaceModal / WorkspaceFormModal).
import { C, Col, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

/** Adds the poster, edit tile, tile drawer and modal to the library. */
export function addLayout(lib) {
  const { comp, part, add, slot, use } = lib
  const paint = artistPaint()
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width', lineHeight: 1.5 }
  const marquee = (key, text) =>
    part(
      key,
      T(`${text} · ${text} · ${text} · ${text} ·`, {
        fontSize: 44,
        fontWeight: '600',
        letterSpacing: -1,
        fill: paint.tint(C.artistForeground, 0.08),
      }),
    )
  add(
    comp(
      'Poster',
      Col(
        {
          name: 'Poster',
          width: 1096,
          gap: 28,
          padding: [40, 0, 56, 0],
          cornerRadius: 12,
          clip: true,
          alignItems: 'center',
          ...paint.releaseGlass(),
        },
        [
          Col({ name: 'Marquee', gap: 4, width: 'fill_container', alignItems: 'center' }, [
            marquee('line1', 'Your first release'),
            marquee('line2', 'Upload a track'),
          ]),
          Col(
            {
              name: 'Body',
              gap: 14,
              width: 'fill_container',
              alignItems: 'center',
              padding: [0, 32],
            },
            [
              I('upload', { width: 40, height: 40, fill: C.artistIcon }),
              part(
                'title',
                T('Start with a finished track', {
                  fontSize: 26,
                  fill: C.artistForeground,
                  textAlign: 'center',
                  ...wrap,
                }),
              ),
              part(
                'desc',
                T('Description', {
                  fontSize: 14,
                  fill: C.artistTextSecondary,
                  textAlign: 'center',
                  ...wrap,
                }),
              ),
              slot('action', {
                layout: 'horizontal',
                width: 'fit_content',
                gap: 8,
                padding: [8, 0, 0, 0],
              }),
              part(
                'note',
                T('You can finish your draft later.', {
                  fontSize: 11,
                  fill: C.artistTextSecondary,
                }),
              ),
            ],
          ),
        ],
      ),
    ),
    comp(
      'Tile/Edit',
      /* FreeGridCanvas: the tile's real content (inert) inside the selection outline, the move handle,
         remove and the resize corner */
      Col(
        {
          name: 'Edit Tile',
          width: 360,
          gap: 6,
          padding: 6,
          cornerRadius: 12,
          stroke: C.artistSelectionBorder,
          strokeWidth: 2,
        },
        [
          Row(
            {
              name: 'Handle Bar',
              width: 'fill_container',
              gap: 8,
              justifyContent: 'space_between',
            },
            [
              use(
                'Button/Icon',
                { name: 'Move', width: 28, height: 28 },
                { icon: { icon: 'grip-vertical' } },
              ),
              use(
                'Button/Icon',
                { name: 'Remove', width: 28, height: 28 },
                { icon: { icon: 'x' } },
              ),
            ],
          ),
          slot('body', { gap: 0 }),
          Row({ name: 'Resize', width: 'fill_container', justifyContent: 'end' }, [
            I('move-diagonal-2', { width: 14, height: 14, fill: C.artistIcon }),
          ]),
        ],
      ),
    ),
    /* TileDrawer: a full-width strip above the canvas with the removed blocks */
    comp(
      'Drawer/Tiles',
      Row(
        {
          name: 'Tile Drawer',
          width: 1096,
          gap: 14,
          padding: 14,
          cornerRadius: 14,
          ...paint.sheet(),
        },
        [
          part(
            'title',
            T('Add a block', { fontSize: 13, fontWeight: '500', fill: C.artistForeground }),
          ),
          slot('items', { layout: 'horizontal', width: 'fill_container', gap: 8 }),
        ],
      ),
    ),
    comp(
      'Modal',
      Col({ name: 'Modal', width: 520, gap: 18, padding: 24, cornerRadius: 18, ...paint.sheet() }, [
        Row({ name: 'Head', width: 'fill_container', gap: 12 }, [
          part(
            'title',
            T('Accounts', { fontSize: 18, fontWeight: '500', fill: C.artistForeground, ...wrap }),
          ),
          use('Button/Icon', { name: 'Close' }, { icon: { icon: 'x' } }),
        ]),
        slot('body', { gap: 14 }),
        slot('footer', { layout: 'horizontal', gap: 10, justifyContent: 'end' }),
      ]),
    ),
  )
}
