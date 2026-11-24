// The release workspace header (widgets/ReleaseWorkspace/ReleaseHeader): cover-tinted glass with the
// release identity, status and the single next action; a compact variant for phones.
import { C, Col, F, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

const COVER = '../../web-player-design/design-system/assets/albums/album-afterglow.webp'
const CLEAR = '#0B071600'

/** Adds the release header and its compact variant to the library. */
export function addRelease(lib) {
  const { comp, part, add, use, nest, slot } = lib
  const paint = artistPaint()
  const glass = paint.releaseGlass()
  const small = (s, o = {}) =>
    T(s, { fontSize: 11, fill: C.artistTextSecondary, lineHeight: 1.5, ...o })
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width' }
  const header = (name, compact) =>
    comp(
      name,
      (compact ? Col : Row)(
        {
          name: 'Release Header',
          width: compact ? 358 : 1096,
          gap: compact ? 16 : 24,
          padding: 18,
          cornerRadius: 10,
          clip: true,
          ...glass,
          /* the cover bleeds into the panel (.artist-cover-wash) and fades out to the right */
          fill: [
            glass.fill,
            { type: 'image', url: COVER, mode: 'cover', opacity: C.artistCoverWashOpacity },
            paint.linear(compact ? 180 : 90, [
              [CLEAR, 0],
              [C.artistReleasePanelEnd, 0.75],
            ]),
          ],
        },
        [
          Row({ name: 'Identity', width: 'fill_container', gap: compact ? 14 : 20 }, [
            part(
              'cover',
              F({
                name: 'Cover',
                width: compact ? 64 : 88,
                height: compact ? 64 : 88,
                cornerRadius: 12,
                fill: { type: 'image', url: COVER, mode: 'cover' },
                stroke: C.artistReleaseBorder,
                strokeWidth: 1,
              }),
            ),
            Col({ name: 'Text', gap: 4, width: 'fill_container' }, [
              part(
                'title',
                T('Afterglow', {
                  fontSize: compact ? 18 : 22,
                  fontWeight: '500',
                  fill: C.artistForeground,
                  lineHeight: 1.3,
                }),
              ),
              part('meta', small('Demo artist · Single · 1 track', wrap)),
              Row({ name: 'Meta', gap: 12, padding: [8, 0, 0, 0] }, [
                part(
                  'status',
                  use(
                    'Status/Brand',
                    { name: 'Status' },
                    { icon: { icon: 'calendar-clock' }, label: { content: 'Scheduled' } },
                  ),
                ),
                ...(compact
                  ? []
                  : [part('updated', small('Updated Sep 01, 2026 · 10:42 UTC', { fontSize: 10 }))]),
              ]),
              /* the premiere Countdown under the identity, when a future premiere is set */
              slot('countdown', {
                layout: 'horizontal',
                width: 'fit_content',
                gap: 6,
                padding: [6, 0, 0, 0],
              }),
            ]),
          ]),
          part(
            'next',
            Col(
              {
                name: 'Next Action',
                width: compact ? 'fill_container' : 380,
                gap: 6,
                padding: compact ? [16, 0, 0, 0] : [0, 0, 0, 24],
                ...paint.hairline(compact ? 'top' : 'left'),
              },
              [
                T('NEXT ACTION', {
                  fontSize: 9,
                  fontWeight: '500',
                  letterSpacing: 0.8,
                  fill: C.artistTextSecondary,
                }),
                part(
                  'nextTitle',
                  T('Review your promotion plan', {
                    fontSize: 15,
                    fontWeight: '500',
                    fill: C.artistForeground,
                    ...wrap,
                  }),
                ),
                part('nextDesc', small('4 suggested steps are waiting for your approval.', wrap)),
                /* `nextAction` switches the whole button row off when there is nothing to press */
                part(
                  'nextAction',
                  Row({ name: 'Action', padding: [8, 0, 0, 0] }, [
                    part(
                      'nextButton',
                      use(
                        'Button/Primary',
                        { name: 'Next' },
                        { icon: { icon: 'arrow-right' }, label: { content: 'Open plan' } },
                      ),
                    ),
                  ]),
                ),
              ],
            ),
          ),
        ],
      ),
    )
  add(header('Release/Header', false), header('Release/Header Compact', true))
  for (const h of ['Release/Header', 'Release/Header Compact']) {
    nest(h, 'nextButton', 'Button/Primary')
    nest(h, 'status', 'Status/Brand')
  }
}
