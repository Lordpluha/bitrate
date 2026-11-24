// Release media pieces of the dashboard and music pages: release covers (pages override the image),
// the stage ring (StageRing), the premiere countdown (Countdown), the inline track player (TrackPlayer
// with its waveform) and the catalogue share bar (NumbersTile).
import { C, Col, F, I, id, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

export const COVER_ART = '../../web-player-design/design-system/assets/albums/'
/* a deterministic waveform: 48 bars between 20% and 100% */
const BARS = Array.from(
  { length: 48 },
  (_, i) => 0.2 + 0.8 * Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23)),
)

/** Adds covers, the stage ring, countdown, track player and share bar to the library. */
export function addMedia(lib) {
  const { comp, part, add } = lib
  const paint = artistPaint()
  const cover = (name, size, radius) =>
    comp(
      name,
      F({
        name: 'Cover',
        width: size,
        height: size,
        cornerRadius: radius,
        fill: { type: 'image', url: `${COVER_ART}album-night-signal.webp`, mode: 'cover' },
        stroke: C.artistReleaseBorder,
        strokeWidth: 1,
      }),
    )
  add(cover('Cover', 44, 8), cover('Cover/Large', 112, 14))
  add(
    comp(
      'Cover/Placeholder',
      Row(
        {
          name: 'Cover',
          width: 44,
          height: 44,
          cornerRadius: 8,
          justifyContent: 'center',
          ...paint.control(),
        },
        [I('music-2', { width: 18, height: 18, fill: C.artistTextSecondary })],
      ),
    ),
  )
  const S = 64
  const arc = (name, geometry, stroke) => ({
    type: 'path',
    id: id(),
    name,
    width: S,
    height: S,
    viewBox: [0, 0, S, S],
    geometry,
    stroke,
    strokeWidth: 5,
  })
  add(
    comp(
      'Ring/Stage',
      Col({ name: 'Stage Ring', width: S, height: S, gap: -S }, [
        arc('Track', 'M32 4 A28 28 0 1 1 31.99 4', paint.tint(C.artistForeground, 0.12)),
        part('arc', arc('Progress', 'M32 4 A28 28 0 0 1 60 32', C.chart1)),
        Row({ name: 'Centre', width: S, height: S, justifyContent: 'center' }, [
          part('label', T('Draft', { fontSize: 11, fontWeight: '500', fill: C.artistForeground })),
        ]),
      ]),
    ),
  )
  const unit = (key, value, label) =>
    Col(
      {
        name: `Unit ${key}`,
        gap: 0,
        alignItems: 'center',
        padding: [6, 10],
        cornerRadius: 8,
        ...paint.control(),
      },
      [
        part(key, T(value, { fontSize: 18, fontWeight: '500', fill: C.artistForeground })),
        part(
          `${key}Label`,
          T(label, { fontSize: 9, letterSpacing: 0.6, fill: C.artistTextSecondary }),
        ),
      ],
    )
  add(
    comp(
      'Countdown',
      Row({ name: 'Countdown', gap: 6 }, [
        unit('days', '12', 'DAYS'),
        unit('hours', '06', 'HOURS'),
        unit('minutes', '41', 'MINUTES'),
      ]),
    ),
  )
  const bars = BARS.map(
    (h, i) => `M${i * 6 + 1} ${Math.round(16 - h * 14)} V${Math.round(16 + h * 14)}`,
  ).join(' ')
  add(
    comp(
      'Player/Track',
      Row(
        {
          name: 'Track Player',
          width: 520,
          gap: 12,
          padding: [8, 12, 8, 8],
          cornerRadius: 24,
          ...paint.control(),
        },
        [
          Row(
            {
              name: 'Play',
              width: 32,
              height: 32,
              cornerRadius: 16,
              justifyContent: 'center',
              ...paint.action(),
            },
            [part('icon', I('play', { width: 14, height: 14, fill: C.primaryForeground }))],
          ),
          part(
            'title',
            T('Night Signal', { fontSize: 12, fontWeight: '500', fill: C.artistForeground }),
          ),
          {
            type: 'path',
            id: id(),
            name: 'Waveform',
            width: 'fill_container',
            height: 32,
            viewBox: [0, 0, 288, 32],
            geometry: bars,
            stroke: C.artistIcon,
            strokeWidth: 2,
            strokeLinecap: 'round',
          },
          part('time', T('0:00 / 3:42', { fontSize: 11, fill: C.artistTextSecondary })),
        ],
      ),
    ),
  )
  const seg = (key, role, width) => part(key, F({ name: key, width, height: 8, fill: C[role] }))
  add(
    comp(
      'Share/Bar',
      Row({ name: 'Share Bar', width: 400, height: 8, gap: 2, cornerRadius: 4, clip: true }, [
        seg('live', 'artistStatusReady', 'fill_container'),
        seg('review', 'artistStatusProcessing', 100),
        seg('drafts', 'artistTextSecondary', 100),
        seg('other', 'artistReleaseBorder', 100),
      ]),
    ),
  )
}
