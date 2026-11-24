// Draft-stage pieces of the release workspace (widgets/ReleaseWorkspace): the draft track row (audio
// uploaded, missing, uploading, failed; DraftTrackRow), the readiness checklist row (DraftStage), the
// lock banner, the credit row with its split total (WorkspaceCredits) and the identifier row.
import { C, Col, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

/** Adds track, checklist, lock, credit, split and identifier rows to the library. */
export function addDraft(lib) {
  const { comp, part, add, slot, use, nest } = lib
  const paint = artistPaint()
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width', lineHeight: 1.5 }
  const strong = (s) => T(s, { fontSize: 12, fontWeight: '500', fill: C.artistForeground, ...wrap })
  const small = (s, o = {}) => T(s, { fontSize: 11, fill: C.artistTextSecondary, ...wrap, ...o })
  const trail = () =>
    slot('trail', { layout: 'horizontal', width: 'fit_content', gap: 6, alignItems: 'center' })
  /* DraftTrackRow: reorder arrows with the position (or the bare position when locked), title, meta,
     audio and genre lines (alert icon when missing), the track status chip, the inline player and the
     explicit actions */
  const line = (key, icon, text) =>
    Row({ name: key, gap: 6, width: 'fill_container' }, [
      part(`${key}Icon`, I(icon, { width: 13, height: 13, fill: C.artistStatusWarning })),
      part(key, small(text)),
    ])
  add(
    comp(
      'Row/Track',
      Col({ name: 'Track Row', width: 640, gap: 10, padding: [12, 0], ...paint.hairline() }, [
        Row({ name: 'Head', width: 'fill_container', gap: 12, alignItems: 'start' }, [
          part(
            'order',
            Col({ name: 'Order', gap: 2, alignItems: 'center' }, [
              use(
                'Button/Icon',
                { name: 'Move up', width: 26, height: 26 },
                { icon: { icon: 'arrow-up' } },
              ),
              part('orderIndex', T('1', { fontSize: 11, fill: C.artistTextSecondary })),
              use(
                'Button/Icon',
                { name: 'Move down', width: 26, height: 26 },
                { icon: { icon: 'arrow-down' } },
              ),
            ]),
          ),
          part('number', T('1', { fontSize: 13, fontWeight: '500', fill: C.artistTextSecondary })),
          Col({ name: 'Text', gap: 4, width: 'fill_container' }, [
            part('title', strong('Night Signal')),
            part('meta', small('Original · 3:42 · ISRC GB-BTR-26-00012')),
            line('audio', 'circle-alert', 'Audio uploaded'),
            line('genres', 'circle-alert', 'Genres: Synthwave, Electronic'),
          ]),
          slot('status', { layout: 'horizontal', width: 'fit_content', gap: 6 }),
        ]),
        slot('player', { gap: 0 }),
        slot('actions', { layout: 'horizontal', width: 'fill_container', gap: 6 }),
      ]),
    ),
  )
  for (const done of [true, false])
    add(
      comp(
        `Row/Check ${done ? 'Done' : 'Needed'}`,
        Row(
          {
            name: 'Checklist Row',
            width: 360,
            gap: 10,
            padding: [10, 0],
            alignItems: 'start',
            ...paint.hairline(),
          },
          [
            I(done ? 'circle-check' : 'circle-dashed', {
              width: 16,
              height: 16,
              fill: done ? C.artistStatusReady : C.artistStatusWarning,
            }),
            Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
              part('title', strong('Artwork')),
              part('detail', small('Upload the cover image')),
            ]),
            trail(),
          ],
        ),
      ),
    )
  add(
    comp(
      'Alert/Lock',
      Row(
        {
          name: 'Lock',
          width: 360,
          gap: 10,
          padding: [10, 12],
          cornerRadius: 10,
          ...paint.control(),
        },
        [
          I('lock', { width: 15, height: 15, fill: C.artistTextSecondary }),
          part(
            'text',
            small('Locked while Bitrate reviews this release. Withdraw it from review to edit.', {
              fill: C.artistForeground,
            }),
          ),
        ],
      ),
    ),
  )
  for (const needs of [false, true])
    add(
      comp(
        `Row/Credit${needs ? ' Needs Role' : ''}`,
        Row({ name: 'Credit Row', width: 520, gap: 12, padding: [10, 0], ...paint.hairline() }, [
          part('avatar', use('Avatar', { name: 'Avatar' })),
          Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
            part('name', strong('Mira Sol')),
            part(
              'roles',
              small(
                needs ? 'Needs role' : 'Performer · Producer',
                needs ? { fill: C.artistStatusWarning } : {},
              ),
            ),
          ]),
          part('share', T('75%', { fontSize: 13, fontWeight: '500', fill: C.artistForeground })),
          trail(),
        ]),
      ),
    )
  for (const complete of [true, false])
    add(
      comp(
        `Split/Total${complete ? '' : ' Short'}`,
        Col({ name: 'Split Total', width: 520, gap: 6 }, [
          Row({ name: 'Label', width: 'fill_container', gap: 6 }, [
            I(complete ? 'circle-check' : 'circle-alert', {
              width: 14,
              height: 14,
              fill: complete ? C.artistStatusReady : C.artistStatusWarning,
            }),
            part(
              'label',
              small(complete ? 'Master 100% of 100%' : 'Master 75% of 100%', {
                fill: C.artistForeground,
              }),
            ),
          ]),
          part(
            'bar',
            use(
              'Progress',
              { name: 'Total', width: 'fill_container' },
              { bar: { width: complete ? 520 : 225 } },
            ),
          ),
        ]),
      ),
    )
  add(
    comp(
      'Row/Identifier',
      Row({ name: 'Identifier Row', width: 520, gap: 12, padding: [10, 0], ...paint.hairline() }, [
        Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
          part('label', small('UPC/EAN:')),
          part('value', strong('Not provided')),
        ]),
        trail(),
      ]),
    ),
  )
  for (const k of ['Row/Credit', 'Row/Credit Needs Role']) nest(k, 'avatar', 'Avatar')
  for (const k of ['Split/Total', 'Split/Total Short']) nest(k, 'bar', 'Progress')
}
