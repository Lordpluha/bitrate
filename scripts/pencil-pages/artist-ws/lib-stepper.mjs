// The release stage stepper (widgets/ReleaseWorkspace/ReleaseStepper): Draft, Review, Deliver, Launch
// and the planned Promotion stage, done, current and upcoming steps joined by solid or dashed lines; on a
// phone only the current stage keeps its name.
import { C, F, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

const STAGES = [
  ['draft', 'Draft', 'Done'],
  ['review', 'Review', 'Done'],
  ['deliver', 'Deliver', 'Done'],
  ['launch', 'Launch', 'Upcoming'],
  ['promotion', 'Promotion', 'Current'],
]

/** Adds the steps, lines and both steppers to the library. */
export function addStepper(lib) {
  const { comp, part, add, use } = lib
  const glass = artistPaint().releaseGlass()
  const dot = {
    Done: [{ fill: C.artistStatusReady }, C.artistCanvasStart, C.artistTextSecondary],
    Current: [{ fill: C.primary }, C.primaryForeground, C.artistForeground],
    Upcoming: [
      { stroke: C.artistReleaseBorder, strokeWidth: 1 },
      C.artistTextSecondary,
      C.artistTextSecondary,
    ],
  }
  for (const [state, [surface, ink, labelInk]] of Object.entries(dot))
    add(
      comp(
        `Step/${state}`,
        Row({ name: 'Step', gap: 8 }, [
          Row(
            {
              name: 'Dot',
              width: 22,
              height: 22,
              cornerRadius: 11,
              justifyContent: 'center',
              ...surface,
            },
            [
              state === 'Done'
                ? I('check', { width: 12, height: 12, fill: ink })
                : part('number', T('1', { fontSize: 10, fontWeight: '500', fill: ink })),
            ],
          ),
          part('label', T('Stage', { fontSize: 13, fill: labelInk })),
        ]),
      ),
    )
  add(
    comp(
      'Step/Line Done',
      F({ name: 'Line', width: 'fill_container', height: 1, fill: C.artistStatusReady }),
    ),
    comp(
      'Step/Line',
      F({
        name: 'Line',
        width: 'fill_container',
        height: 1,
        stroke: C.artistReleaseBorder,
        strokeWidth: { top: 1 },
        strokeDash: [4, 4],
      }),
    ),
  )
  /* on a phone only the current stage keeps its name; steps and the line before each are parts */
  const steps = (compact) => {
    const out = []
    STAGES.forEach(([key, label, state], i) => {
      if (i)
        out.push(
          part(
            `line_${key}`,
            use(STAGES[i - 1][2] === 'Done' && state === 'Done' ? 'Step/Line Done' : 'Step/Line', {
              name: 'Line',
            }),
          ),
        )
      const parts = {
        label: compact && state !== 'Current' ? { enabled: false } : { content: label },
      }
      if (state !== 'Done') parts.number = { content: String(i + 1) }
      out.push(part(`step_${key}`, use(`Step/${state}`, { name: `Step / ${label}` }, parts)))
    })
    return out
  }
  add(
    comp(
      'Release/Stepper',
      Row(
        {
          name: 'Release Stepper',
          width: 1096,
          gap: 12,
          padding: [14, 18],
          cornerRadius: 12,
          ...glass,
        },
        steps(false),
      ),
    ),
    comp(
      'Release/Stepper Compact',
      Row(
        {
          name: 'Release Stepper',
          width: 358,
          gap: 6,
          padding: [12, 14],
          cornerRadius: 12,
          ...glass,
        },
        steps(true),
      ),
    ),
  )
}
