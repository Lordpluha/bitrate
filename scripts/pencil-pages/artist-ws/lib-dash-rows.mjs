// Dashboard list rows (widgets/DashboardOverview): the Coming up timeline row (date and UTC time, cover,
// title, status, chevron), the dashed "Plan the next release" slot link and the Recent activity row
// (bell, "description · release", time).
import { C, Col, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

/** Adds the timeline row, dashed slot link and activity row to the library. */
export function addDashRows(lib) {
  const { comp, part, add, use, slot, nest } = lib
  const paint = artistPaint()
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width', lineHeight: 1.5 }
  add(
    comp(
      'Row/Timeline',
      Row({ name: 'Timeline Row', width: 360, gap: 10, padding: [8, 0], ...paint.hairline() }, [
        Col(
          {
            name: 'Date',
            width: 58,
            gap: 0,
            padding: [6, 0],
            cornerRadius: 8,
            alignItems: 'center',
            fill: C.artistSelection,
          },
          [
            part(
              'date',
              T('NOV 28', {
                fontSize: 10,
                fontWeight: '600',
                letterSpacing: 0.6,
                fill: C.artistIcon,
              }),
            ),
            part('time', T('18:00', { fontSize: 11, fill: C.artistForeground })),
          ],
        ),
        part('cover', use('Cover', { name: 'Cover' })),
        Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
          part(
            'title',
            T('Static Lines', {
              fontSize: 12,
              fontWeight: '500',
              fill: C.artistForeground,
              ...wrap,
            }),
          ),
          slot('status', { layout: 'horizontal', width: 'fit_content', gap: 6 }),
        ]),
        I('chevron-right', { width: 16, height: 16, fill: C.artistTextSecondary }),
      ]),
    ),
    comp(
      'Link/Dashed',
      Row(
        {
          name: 'Dashed Slot',
          width: 360,
          height: 44,
          gap: 8,
          padding: [0, 14],
          cornerRadius: 10,
          justifyContent: 'center',
          stroke: C.artistReleaseBorder,
          strokeWidth: 1,
          strokeDash: [4, 4],
        },
        [
          part('icon', I('calendar-plus', { width: 16, height: 16, fill: C.artistIcon })),
          part('label', T('Plan the next release', { fontSize: 12, fill: C.artistForeground })),
        ],
      ),
    ),
    comp(
      'Row/Activity',
      Row({ name: 'Activity Row', width: 520, gap: 10, padding: [8, 0], ...paint.hairline() }, [
        I('bell', { width: 15, height: 15, fill: C.artistIcon }),
        part(
          'text',
          T('Approved by Bitrate review · Static Lines', {
            fontSize: 12,
            fill: C.artistForeground,
            ...wrap,
          }),
        ),
        part('time', T('Yesterday', { fontSize: 11, fill: C.artistTextSecondary })),
      ]),
    ),
  )
  nest('Row/Timeline', 'cover', 'Cover')
}
