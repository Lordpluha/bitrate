// Delivery pieces (widgets/ReleaseDelivery, views/DistributionView): the store row of the delivery plan
// (in or out of the plan, with its availability chip), the delivery-matrix status cell per availability,
// the matrix row and header, and the "Your plan → Partner → Stores" flow steps.
import { C, Col, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

/* availability → [icon, colour role, label] (entities/delivery availabilityLabels) */
const CELLS = {
  Live: ['circle-check', 'artistStatusReady', 'Live'],
  Pending: ['clock-3', 'artistStatusProcessing', 'Pending'],
  'Not sent': ['circle-dashed', 'artistTextSecondary', 'Not sent'],
  Failed: ['circle-x', 'artistStatusError', 'Failed'],
  'Not in plan': ['minus', 'artistTextSecondary', 'Not in the plan'],
}

/** Adds store rows, matrix cells, matrix rows and flow steps to the library. */
export function addDelivery(lib) {
  const { comp, part, add, slot, use, nest } = lib
  const paint = artistPaint()
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width' }
  for (const inPlan of [true, false])
    add(
      comp(
        `Row/Store${inPlan ? '' : ' Off'}`,
        Row(
          {
            name: 'Store Row',
            width: 520,
            gap: 12,
            padding: [10, 0],
            ...paint.hairline(),
            ...(inPlan ? {} : { opacity: 0.6 }),
          },
          [
            I(inPlan ? 'circle-check' : 'circle-dashed', {
              width: 16,
              height: 16,
              fill: inPlan ? C.artistStatusReady : C.artistTextSecondary,
            }),
            Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
              part(
                'name',
                T('Spotify', {
                  fontSize: 12,
                  fontWeight: '500',
                  fill: C.artistForeground,
                  ...wrap,
                }),
              ),
              part(
                'plan',
                T(inPlan ? 'In the plan' : 'Not in the plan', {
                  fontSize: 11,
                  fill: C.artistTextSecondary,
                  ...wrap,
                }),
              ),
            ]),
            slot('trail', {
              layout: 'horizontal',
              width: 'fit_content',
              gap: 6,
              alignItems: 'center',
            }),
          ],
        ),
      ),
    )
  for (const [state, [icon, role, label]] of Object.entries(CELLS))
    add(
      comp(
        `Cell/${state}`,
        Row({ name: 'Status Cell', width: 96, gap: 5 }, [
          I(icon, { width: 13, height: 13, fill: C[role] }),
          part('label', T(label, { fontSize: 10, fill: C[role] })),
        ]),
      ),
    )
  const head = (s) =>
    T(s, {
      fontSize: 9,
      letterSpacing: 0.8,
      fill: C.artistTextSecondary,
      width: 96,
      textGrowth: 'fixed-width',
    })
  add(
    comp(
      'Matrix/Header',
      Row({ name: 'Matrix Header', width: 1000, gap: 10, padding: [10, 16], ...paint.hairline() }, [
        T('RELEASE', { fontSize: 9, letterSpacing: 0.8, fill: C.artistTextSecondary, ...wrap }),
        ...['SPOTIFY', 'APPLE MUSIC', 'YOUTUBE MUSIC', 'AMAZON MUSIC', 'DEEZER', 'TIDAL'].map(head),
        Row({ name: 'Chevron Space', width: 16, height: 1 }, []),
      ]),
    ),
    comp(
      'Matrix/Row',
      Row({ name: 'Matrix Row', width: 1000, gap: 10, padding: [10, 16], ...paint.hairline() }, [
        Row({ name: 'Release', gap: 10, width: 'fill_container' }, [
          part('cover', use('Cover', { name: 'Cover' })),
          Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
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
              'meta',
              T('Worldwide · Not sent', { fontSize: 11, fill: C.artistTextSecondary, ...wrap }),
            ),
          ]),
        ]),
        slot('cells', { layout: 'horizontal', width: 'fit_content', gap: 10 }),
        I('chevron-right', { width: 16, height: 16, fill: C.artistTextSecondary }),
      ]),
    ),
  )
  nest('Matrix/Row', 'cover', 'Cover')
  for (const done of [true, false])
    add(
      comp(
        `Flow/Step${done ? ' Done' : ''}`,
        Row(
          {
            name: 'Flow Step',
            height: 32,
            gap: 6,
            padding: [0, 12],
            cornerRadius: 16,
            ...(done
              ? { fill: C.artistSelection, stroke: C.artistSelectionBorder, strokeWidth: 1 }
              : paint.control()),
          },
          [
            I(done ? 'circle-check' : 'circle-dashed', {
              width: 14,
              height: 14,
              fill: done ? C.artistStatusReady : C.artistTextSecondary,
            }),
            part('label', T('Your plan', { fontSize: 12, fill: C.artistForeground })),
          ],
        ),
      ),
    )
}
