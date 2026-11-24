// Upload pieces of the release dialogs (features/release-media): the file drop zone with its hint and
// choose button, the upload progress line, the release artwork tile (with art or empty) and the
// date and UTC time fields of the schedule dialog.
import { C, Col, F, I, Row, T } from '../kit.mjs'
import { COVER_ART } from './lib-media.mjs'
import { artistPaint } from './paint.mjs'

/** Adds drop zones, upload progress, artwork tiles and date/time fields to the library. */
export function addUpload(lib) {
  const { comp, part, add, slot, use } = lib
  const paint = artistPaint()
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width', lineHeight: 1.5 }
  const small = (s, o = {}) =>
    T(s, { fontSize: 11, fill: C.artistTextSecondary, textAlign: 'center', ...wrap, ...o })
  for (const active of [false, true])
    add(
      comp(
        `Dropzone${active ? '/Active' : ''}`,
        Col(
          {
            name: 'Drop Zone',
            width: 440,
            gap: 10,
            padding: [28, 24],
            cornerRadius: 12,
            alignItems: 'center',
            ...paint.control(),
            ...(active
              ? { fill: C.artistSelection, stroke: C.artistSelectionBorder, strokeWidth: 2 }
              : {}),
          },
          [
            part('icon', I('upload', { width: 26, height: 26, fill: C.artistIcon })),
            part(
              'title',
              T('No file chosen, or drop a file here', {
                fontSize: 13,
                fontWeight: '500',
                fill: C.artistForeground,
                textAlign: 'center',
                ...wrap,
              }),
            ),
            part(
              'hint',
              small(
                'WAV or FLAC masters are preferred; MP3 and OGG are accepted. Up to 512 MB. The file stays private to your workspace.',
              ),
            ),
            slot('action', { layout: 'horizontal', width: 'fit_content', gap: 8 }),
          ],
        ),
      ),
    )
  add(
    comp(
      'Upload/Progress',
      Col({ name: 'Upload Progress', width: 440, gap: 6 }, [
        Row({ name: 'Line', width: 'fill_container', gap: 8 }, [
          I('file-audio', { width: 15, height: 15, fill: C.artistIcon }),
          part(
            'file',
            T('night-signal-master.wav', {
              fontSize: 12,
              fill: C.artistForeground,
              width: 'fill_container',
              textGrowth: 'fixed-width',
            }),
          ),
          part('percent', T('Uploading… 64%', { fontSize: 11, fill: C.artistTextSecondary })),
        ]),
        part(
          'bar',
          use('Progress', { name: 'Progress', width: 'fill_container' }, { bar: { width: 280 } }),
        ),
      ]),
    ),
  )
  for (const empty of [false, true])
    add(
      comp(
        `Artwork${empty ? '/Empty' : ''}`,
        empty
          ? Col(
              {
                name: 'Artwork',
                width: 220,
                height: 220,
                gap: 10,
                padding: 20,
                cornerRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                ...paint.control(),
              },
              [
                I('image-plus', { width: 28, height: 28, fill: C.artistIcon }),
                part('label', small('No artwork yet. Drop an image here.')),
              ],
            )
          : F({
              name: 'Artwork',
              width: 220,
              height: 220,
              cornerRadius: 14,
              fill: { type: 'image', url: `${COVER_ART}album-night-signal.webp`, mode: 'cover' },
              stroke: C.artistReleaseBorder,
              strokeWidth: 1,
            }),
      ),
    )
  for (const [kind, icon, value] of [
    ['Date', 'calendar-days', 'Nov 14, 2026'],
    ['Time', 'clock', '18:00'],
  ])
    add(
      comp(
        `Field/${kind}`,
        Col({ name: 'Field', gap: 6, width: 200 }, [
          part(
            'label',
            T(kind === 'Date' ? 'Release date' : 'Time (UTC)', {
              fontSize: 11,
              fill: C.artistTextSecondary,
            }),
          ),
          Row(
            {
              name: 'Box',
              width: 'fill_container',
              height: 40,
              gap: 8,
              padding: [0, 12],
              cornerRadius: 10,
              ...paint.control(),
            },
            [
              I(icon, { width: 15, height: 15, fill: C.artistTextSecondary }),
              part(
                'value',
                T(value, {
                  fontSize: 12,
                  fill: C.artistForeground,
                  width: 'fill_container',
                  textGrowth: 'fixed-width',
                }),
              ),
            ],
          ),
        ]),
      ),
    )
}
