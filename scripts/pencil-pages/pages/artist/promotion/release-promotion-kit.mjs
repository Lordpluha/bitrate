// Shared pieces of the release promotion page and its states: the release shell, the header's next
// action, the plan grid, loading tiles and the stepper of a release without a date.
import { planBlocks } from './promo-plan.mjs'

/** The release promotion kit bound to the screen helpers `ui` and `frames`. */
export function releasePromotionKit(ui, frames) {
  const { W } = ui
  const { releaseHead, grid } = frames
  const { phases, planIntro } = planBlocks(ui)
  const shell = { nav: 'music', crumb: 'Music / Afterglow / Promotion', action: 'New release' }
  const next = (title, desc, button, icon = 'arrow-right') => ({
    nextTitle: { content: title },
    nextDesc: { content: desc },
    ...(button
      ? { 'nextButton.label': { content: button }, 'nextButton.icon': { icon } }
      : { nextAction: { enabled: false } }),
  })
  const review = next(
    'Approve 4 suggested steps',
    'Approved steps appear in your promotion calendar.',
    'Review steps',
  )
  const head = (m, o = review) => releaseHead(m, o)
  const plan = (m, side, o = {}) =>
    grid(m, [
      [8, [planIntro(), ...phases(m, o)]],
      [4, side],
    ])
  const pending = (n) => W('Skeleton/Tile', { name: `Loading ${n}`, width: 'fill_container' })
  /* a draft without a date: Draft is current, the later stages are still ahead */
  const draftSteps = {
    step_draft: W(
      'Step/Current',
      { name: 'Step / Draft' },
      { number: { content: '1' }, label: { content: 'Draft' } },
    ),
    ...Object.fromEntries(
      [
        ['review', 'Review', 2],
        ['deliver', 'Deliver', 3],
      ].map(([k, label, n]) => [
        `step_${k}`,
        W(
          'Step/Upcoming',
          { name: `Step / ${label}` },
          { number: { content: String(n) }, label: { content: label } },
        ),
      ]),
    ),
    line_review: W('Step/Line', { name: 'Line' }),
    line_deliver: W('Step/Line', { name: 'Line' }),
  }
  return {
    ...planBlocks(ui),
    shell,
    next,
    head,
    plan,
    pending,
    draftSteps,
  }
}
