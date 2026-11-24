// Artist / Release — Draft (views/ReleaseWorkspaceView, step=draft; widgets/ReleaseWorkspace DraftStage):
// timing, tracks, credits and rights in the main column, the readiness checklist with the submission
// on the right (folded on a phone until opened); locks once submitted, rejected, approved or released;
// loading, unavailable, and every dialog the draft opens.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { pageSkeleton } from '../workspace/page-skeleton.mjs'
import { creditDialogs } from './dialogs-credits.mjs'
import { mediaDialogs } from './dialogs-media.mjs'
import { draftRights } from './draft-rights.mjs'
import { draftTiles } from './draft-tiles.mjs'
import { releaseKit } from './kit.mjs'

/** The release-draft page spec. */
export function releaseDraftPage(ui, frames) {
  const { Tx, P, Row, Col, Btn } = ui
  const k = releaseKit(ui)
  const t = { ...draftTiles(ui, k), ...draftRights(ui, k) }
  const md = mediaDialogs(ui, k)
  const cd = creditDialogs(ui, k)
  const skeleton = pageSkeleton(ui)
  const halves = (m, a, b) =>
    m
      ? [a, b]
      : [Row({ name: 'Halves', gap: 20, width: 'fill_container', alignItems: 'start' }, [a, b])]
  const draft = (m, o = {}) => {
    const s = { status: 'draft', ...o }
    return k.stage(
      m,
      s.status,
      [
        k.columns(
          m,
          [t.timing(s), t.tracks(s, m), ...halves(m, t.credits(s), t.rights(s))],
          [t.readiness(s, m)],
        ),
      ],
      { saved: o.saved, premiere: true },
    )
  }
  const done = { done: true }
  const over = (dialog) => (m) => [k.header(m, 'draft', true), k.stepper(m, 'draft'), dialog(m)]
  const mobileOnly = { side: 'mobile', reason: 'the checklist folds on phones only' }
  const states = [
    ['Checklist open', (m) => draft(m, { open: true }), mobileOnly],
    ['Ready to submit', (m) => draft(m, { ...done, status: 'draftReady' })],
    ['Empty draft', (m) => draft(m, { empty: true })],
    ['Compilation', (m) => draft(m, { empty: true, compilation: true })],
    ['Draft updated', (m) => draft(m, { saved: true })],
    ['Submitted', (m) => draft(m, { ...done, status: 'submitted' })],
    ['Withdrawing', (m) => draft(m, { ...done, status: 'submitted', busy: true })],
    ['Rejected', (m) => draft(m, { ...done, status: 'rejected' })],
    ['Approved', (m) => draft(m, { ...done, status: 'approved' })],
    ['Released', (m) => draft(m, { ...done, status: 'released' })],
    ['Loading', (m) => skeleton(m, 'release')],
    [
      'Unavailable',
      () => [
        Col({ name: 'Unavailable', gap: 14, width: 'fill_container', padding: [32, 0] }, [
          Tx('H1', 'Release workspace unavailable'),
          P('Body', 'Could not load this release workspace. Please try again.'),
          Btn('Try again', 'Outline'),
          Tx('Link Underline', 'Return to Music'),
        ]),
      ],
    ],
    ['Edit draft', over(md.editRelease)],
    ['Edit timing', over(md.schedule)],
    ['Edit artwork', over(md.artwork)],
    ['Upload track', over(md.upload)],
    ['Upload track — dropping', over((m) => md.upload(m, { active: true }))],
    ['Upload track — uploading', over((m) => md.upload(m, { progress: true }))],
    ['Upload track — file too large', over((m) => md.upload(m, { error: true }))],
    ['Replace audio', over((m) => md.upload(m, { replace: true }))],
    ['Rename track', over(md.rename)],
    ['Track ISRC', over((m) => md.isrc(m, true))],
    ['Track genres', over(md.genres)],
    ['Remove track', over(md.removeTrack)],
    ['Add contributor', over(cd.contributor)],
    ['Contributor needs a role', over((m) => cd.contributor(m, { error: true }))],
    ['Edit contributor — loading', over((m) => cd.contributor(m, { loading: true }))],
    ['Edit contributor — not a draft', over((m) => cd.contributor(m, { notDraft: true }))],
    ['Credit me alone', over(cd.creditSelf)],
    ['Remove contributor', over(cd.removeContributor)],
    ['Splits', over(cd.splits)],
    ['Splits over 100%', over((m) => cd.splits(m, true))],
    ['Rights', over(cd.rights)],
    ['Release UPC', over((m) => cd.upc(m, true))],
    ['Compilation picker', over(cd.compilation)],
    ['Compilation — no matches', over((m) => cd.compilation(m, { empty: true }))],
    ['Delete release', over(md.deleteRelease)],
  ]
  return pageSpec(
    frames,
    {
      title: 'Artist / Release — Draft',
      route: '/dashboard/music/$releaseId?step=draft',
      context:
        'Where a release is prepared. The checklist links each item to its panel; nothing here publishes or delivers the release.',
    },
    k.shell,
    (m) => draft(m),
    states.map(([label, build, only]) => [label, k.shell, build, only]),
  )
}
