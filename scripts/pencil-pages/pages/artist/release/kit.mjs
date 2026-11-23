// Shared parts of the four release-stage pages (views/ReleaseWorkspaceView): the shell, the release
// header for a status, the four-stage stepper with the stage the release has reached, glass tiles,
// notices and the page frame for a stage (header, stepper, stage content).
import { coverFill } from '../workspace/demo.mjs'
import { workspaceModal } from '../workspace/workspace-modal.mjs'

const STAGES = [
  ['draft', 'Draft'],
  ['review', 'Review'],
  ['deliver', 'Deliver'],
  ['launch', 'Launch'],
]
/* release status → [chip tone, chip label, chip icon, next title, next detail, next action] */
const HEADER = {
  draft: [
    'Neutral',
    'Draft',
    'circle-dashed',
    'Finish preparing your release',
    '3 items are left before Bitrate review.',
    'Edit tracks',
  ],
  ready: [
    'Ready',
    'Ready',
    'circle-check',
    'Submit for Bitrate review',
    'Everything required is ready. Confirm and submit.',
    'Review and submit',
  ],
  submitted: [
    'Processing',
    'Submitted',
    'clock-3',
    'Waiting for Bitrate review',
    'You will be notified when Bitrate decides.',
    'View review',
  ],
  rejected: [
    'Error',
    'Rejected',
    'circle-x',
    'Address the requested changes',
    'Bitrate asked for changes before approval.',
    'Open feedback',
  ],
  approved: [
    'Ready',
    'Ready',
    'circle-check',
    'Publish on Bitrate',
    'Approved by Bitrate. Publish when you are ready.',
    'Open launch',
  ],
  scheduled: [
    'Ready',
    'Scheduled',
    'calendar-clock',
    'Premiere scheduled',
    'Your release goes live on Bitrate at the premiere time.',
    'Open launch',
  ],
  publishing: [
    'Processing',
    'Publishing',
    'loader-circle',
    'Publishing on Bitrate',
    'Your tracks are being prepared for the player.',
    'Open launch',
  ],
  failed: [
    'Error',
    'Publishing failed',
    'circle-x',
    'Publishing failed',
    'Bitrate has been notified and will retry.',
    'Open launch',
  ],
  released: [
    'Ready',
    'Released',
    'radio',
    'Your release is live on Bitrate',
    'Share it and follow the first signals.',
    'Open launch',
  ],
  unpublished: [
    'Neutral',
    'Unpublished',
    'circle-pause',
    'Your release is offline',
    'Listeners cannot play it until it is published again.',
    'Open launch',
  ],
}

/** Release-page helpers bound to the screen helpers `ui`. */
export function releaseKit(ui) {
  const { W, Row, Col, fill, inline } = ui
  const shell = { nav: 'music', crumb: 'Music / Night Signal', action: 'Create release' }
  const header = (m, status = 'draft') => {
    const [tone, label, icon, title, detail, action] = HEADER[status]
    return W(
      m ? 'Release/Header Compact' : 'Release/Header',
      { name: 'Release Header', width: 'fill_container' },
      {
        cover: coverFill('night-signal'),
        title: { content: 'Night Signal' },
        meta: { content: 'Mira Sol · Single · 1 track' },
        status: W(
          `Status/${tone}`,
          { name: `Status / ${label}` },
          { label: { content: label }, icon: { icon } },
        ),
        ...(m ? {} : { updated: { content: 'Updated Nov 23, 2026, 14:20 UTC' } }),
        nextTitle: { content: title },
        nextDesc: { content: detail },
        'nextButton.label': { content: action },
      },
    )
  }
  const stepper = (m, reached) => {
    const at = STAGES.findIndex(([key]) => key === reached)
    const parts = {}
    STAGES.forEach(([key, label], i) => {
      const state = i < at ? 'Done' : i === at ? 'Current' : 'Upcoming'
      const show = !m || state === 'Current'
      parts[`step_${key}`] = W(
        `Step/${state}`,
        { name: `Step / ${label}` },
        {
          label: show ? { content: label } : { enabled: false },
          ...(state === 'Done' ? {} : { number: { content: String(i + 1) } }),
        },
      )
      if (i) parts[`line_${key}`] = W(i <= at ? 'Step/Line Done' : 'Step/Line', { name: 'Line' })
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
        icon: { icon },
        title: { content: title },
        right: right.length ? inline('Right', right) : { enabled: false },
        body: fill('Body', body.flat(), { gap: 12 }),
      },
    )
  const note = (tone, text, action) =>
    W(
      `Alert/${tone}`,
      { name: `Notice / ${text.slice(0, 20)}`, width: 'fill_container' },
      {
        title: { content: text },
        body: { enabled: false },
        action: action ? inline('Action', [action]) : { enabled: false },
      },
    )
  const lock = (text) =>
    W('Alert/Lock', { name: 'Lock', width: 'fill_container' }, { text: { content: text } })
  /** A stage page: header, stepper, then the stage's own nodes. */
  const stage = (m, status, reached, nodes) => [
    header(m, status),
    stepper(m, reached),
    ...nodes.flat(),
  ]
  const columns = (m, side, main) =>
    m
      ? [...side, ...main]
      : Row({ name: 'Stage', gap: 20, width: 'fill_container', alignItems: 'start' }, [
          Col({ name: 'Side', gap: 20, width: 352 }, side),
          Col({ name: 'Main', gap: 20, width: 'fill_container' }, main),
        ])
  return { shell, header, stepper, tile, note, lock, stage, columns, modal: workspaceModal(ui) }
}
