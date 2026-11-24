// Review-stage parts (widgets/ReleaseWorkspace ReviewStage ReadinessSummary, WorkspaceReview): the
// four-item readiness summary with "Back to the draft" for a draft, and the review decision panel.

const FEEDBACK =
  'The artwork shows a third-party logo in the bottom corner. Replace it with artwork you own the rights to, then submit again.'

/** Readiness and decision builders bound to the screen helpers `ui` and the release kit `k`. */
export function reviewParts(ui, k) {
  const { P, Btn, Check } = ui
  const readiness = (all, draft) =>
    k.tile('Release readiness', 'list-checks', [
      Check(true, 'Artwork'),
      Check(all, 'Tracks and audio'),
      Check(all, 'Credits & splits'),
      Check(all, 'Rights'),
      ...(draft ? [Btn('Back to the draft', 'Primary', null, { width: 'fill_container' })] : []),
    ])
  const decision = (approved) =>
    k.tile(
      approved ? 'Approved by Bitrate' : 'Changes requested',
      approved ? 'circle-check' : 'circle-alert',
      [
        P('Caption', 'Reviewed Nov 22, 2026, 16:40 UTC'),
        ...(approved ? [] : [P('Body', FEEDBACK)]),
      ],
    )
  return { readiness, decision }
}
