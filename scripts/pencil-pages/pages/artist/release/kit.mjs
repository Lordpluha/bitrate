// Shared frame of the four release-stage pages (views/ReleaseWorkspaceView): "Draft updated" status
// paragraph, "Back to music" on phones, the release header for a status (chip, premiere countdown,
// next action), the four-stage stepper with stages.ts progress, then the stage (main column, side
// panel on the right), the changes-after-publication panel when the release accepts changes and the
// danger zone on every stage.
import { coverFill } from '../workspace/demo.mjs'
import { workspaceModal } from '../workspace/workspace-modal.mjs'
import { acceptsChanges, STATUS } from './status.mjs'

const STAGES = [
  ['draft', 'Draft'],
  ['review', 'Review'],
  ['deliver', 'Deliver'],
  ['launch', 'Launch'],
]

/** Release-page helpers bound to the screen helpers `ui`. */
export function releaseKit(ui) {
  const { W, P, Tx, Row, Col, fill, inline, Btn } = ui
  const shell = { nav: 'music', crumb: 'Music / Night Signal', back: true }
  const header = (m, status = 'draft', premiere = false) => {
    const [tone, label, icon, title, detail, action] = STATUS[status]
    return W(
      m ? 'Release/Header Compact' : 'Release/Header',
      { name: 'Release Header', width: 'fill_container' },
      {
        cover: coverFill('night-signal'),
        title: { content: 'Night Signal' },
        meta: { content: 'Mira Sol · Single · 2 tracks' },
        status: W(
          `Status/${tone}`,
          { name: `Status / ${label}` },
          { label: { content: label }, icon: { icon } },
        ),
        ...(m ? {} : { updated: { content: 'Updated Nov 23, 2026, 14:20 UTC' } }),
        countdown: premiere
          ? inline('Countdown', [W('Countdown', { name: 'Countdown' })])
          : { enabled: false },
        nextTitle: { content: title },
        nextDesc: { content: detail },
        'nextButton.label': { content: action },
      },
    )
  }
  const stepper = (m, status) => {
    const progress = STATUS[status][6]
    const parts = {}
    STAGES.forEach(([key, label], i) => {
      const state = progress[key]
      parts[`step_${key}`] = W(
        `Step/${state}`,
        { name: `Step / ${label}` },
        {
          label: !m || state === 'Current' ? { content: label } : { enabled: false },
          ...(state === 'Done' ? {} : { number: { content: String(i + 1) } }),
        },
      )
      if (i)
        parts[`line_${key}`] = W(
          progress[STAGES[i - 1][0]] === 'Done' ? 'Step/Line Done' : 'Step/Line',
          { name: 'Line' },
        )
    })
    return W(
      m ? 'Release/Stages Compact' : 'Release/Stages',
      { name: 'Stepper', width: 'fill_container' },
      parts,
    )
  }
  const tile = (title, icon, body, o = {}, right = []) =>
    W(
      'Tile',
      { name: `Tile / ${title}`, width: 'fill_container', ...o },
      {
        icon: icon ? { icon } : { enabled: false },
        title: { content: title },
        right: right.length ? inline('Right', right) : { enabled: false },
        body: fill('Body', body.flat(), { gap: 12 }),
      },
    )
  /* role="status" paragraphs and notes: a bordered paragraph, not an alert */
  const note = (text) =>
    W(
      'Legal/Note',
      { name: `Note / ${text.slice(0, 20)}`, width: 'fill_container' },
      { text: { content: text } },
    )
  /* LockedButton: the action stays visible, disabled, with the lock reason as its tooltip */
  const locked = (label) => Btn(label, 'Compact Outline', 'lock', { opacity: 0.5 })
  const changes = () =>
    tile(
      'Changes after publication',
      'file-pen',
      [
        P(
          'Muted',
          'Listeners keep seeing the current title and cover until Bitrate approves each change.',
        ),
        W(
          'Row/Identifier',
          { name: 'Change / title', width: 'fill_container' },
          {
            label: { content: 'Release title · In review' },
            value: { content: 'Night Signal → Night Signal (Deluxe)' },
            trail: inline('Trail', [Btn('Withdraw', 'Compact Ghost')]),
          },
        ),
      ],
      {},
      [Btn('Propose changes', 'Compact Outline')],
    )
  const danger = () =>
    tile('Danger zone', null, [
      P(
        'Muted',
        'Delete this release from your workspace and the player. Recordings used by another release remain available. This cannot be undone.',
      ),
      Btn('Delete release', 'Danger', 'trash-2'),
    ])
  /** A stage page; `o.saved` adds the "Draft updated." status, `o.premiere` the header countdown. */
  const stage = (m, status, nodes, o = {}) => [
    ...(o.saved ? [note('Draft updated.')] : []),
    ...(m ? [Tx('Link Underline', 'Back to music')] : []),
    header(m, status, o.premiere),
    stepper(m, status),
    ...nodes.flat(),
    ...(acceptsChanges(status) ? [changes()] : []),
    danger(),
  ]
  /** Main column first, the 352px side panel on its right; stacked on a phone. */
  const columns = (m, main, side) =>
    m
      ? [...main, ...side]
      : Row({ name: 'Stage', gap: 20, width: 'fill_container', alignItems: 'start' }, [
          Col({ name: 'Main', gap: 20, width: 'fill_container' }, main),
          Col({ name: 'Side', gap: 20, width: 352 }, side),
        ])
  return {
    shell,
    header,
    stepper,
    tile,
    note,
    locked,
    danger,
    stage,
    columns,
    modal: workspaceModal(ui),
  }
}
