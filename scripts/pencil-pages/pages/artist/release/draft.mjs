// Artist / Release — Draft (views/ReleaseWorkspaceView, step=draft; widgets/ReleaseWorkspace DraftStage):
// the readiness checklist beside timing, tracks, credits and rights, then the danger zone; lock banners
// once submitted, rejected, approved or released (with the changes-after-publication panel); loading,
// unavailable, uploads and every dialog the draft opens.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { creditDialogs } from './dialogs-credits.mjs'
import { mediaDialogs } from './dialogs-media.mjs'
import { draftTiles } from './draft-tiles.mjs'
import { releaseKit } from './kit.mjs'

const LOCK = {
  submitted: 'Locked while Bitrate reviews this release. Withdraw it from review to edit.',
  rejected: 'Choose Start revising on the Review step to edit the draft.',
  approved: 'Approved releases can no longer be edited.',
  released: 'Released releases can no longer be edited.',
}
const REACHED = { submitted: 'review', rejected: 'review', approved: 'deliver', released: 'launch' }

/** The release-draft page spec. */
export function releaseDraftPage(ui, frames) {
  const { W, Tx, P, Row, Col, Btn, inline } = ui
  const k = releaseKit(ui)
  const t = draftTiles(ui, k)
  const md = mediaDialogs(ui, k)
  const cd = creditDialogs(ui, k)
  const halves = (m, a, b) =>
    m
      ? [a, b]
      : [Row({ name: 'Halves', gap: 20, width: 'fill_container', alignItems: 'start' }, [a, b])]
  const body = (m, o = {}) => [
    ...(o.notice ? [o.notice] : []),
    k.columns(
      m,
      [t.readiness(o)],
      [t.timing(o), t.tracks(o), ...halves(m, t.credits(o), t.rights(o))],
    ),
    ...(o.after ?? []),
    ...(o.locked ? [] : [t.danger()]),
  ]
  const draft = (m, o = {}, status = 'draft', reached = 'draft') =>
    k.stage(m, status, reached, body(m, o))
  const locked = (status) => (m) => {
    const o = { locked: true, complete: true, lockText: LOCK[status] }
    const changes =
      status === 'released'
        ? [
            k.tile(
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
                    label: { content: 'Release title' },
                    value: { content: 'Night Signal → Night Signal (Deluxe)' },
                    trail: inline('Trail', [
                      W(
                        'Status/Processing',
                        { name: 'In review' },
                        { label: { content: 'In review' } },
                      ),
                      Btn('Withdraw', 'Compact Ghost'),
                    ]),
                  },
                ),
              ],
              {},
              [Btn('Propose changes', 'Compact Outline', 'file-pen')],
            ),
          ]
        : []
    return draft(m, { ...o, after: changes }, status, REACHED[status])
  }
  const over = (dialog) => (m) => [k.header(m), k.stepper(m, 'draft'), dialog(m)]
  const ready = { complete: true }
  const uploads = (variant) => ({
    rows: [
      ['', 'Night Signal', 'Original · 3:42 · ISRC GB-BTR-26-00012', '1', ['Synthwave']],
      [variant, 'Low Tide', 'Original · No ISRC yet', '2', []],
    ],
  })
  return pageSpec(
    frames,
    {
      title: 'Artist / Release — Draft',
      route: '/dashboard/music/$releaseId?step=draft',
      context:
        'Where a release is prepared. The checklist links each item to its tile; nothing here publishes or delivers the release.',
    },
    k.shell,
    (m) => draft(m),
    [
      ['Ready to submit', k.shell, (m) => draft(m, ready, 'ready')],
      ['Empty draft', k.shell, (m) => draft(m, { empty: true })],
      ['Draft updated', k.shell, (m) => draft(m, { notice: k.note('Success', 'Draft updated.') })],
      ['Uploading audio', k.shell, (m) => draft(m, uploads('Uploading'))],
      ['Upload failed', k.shell, (m) => draft(m, uploads('Failed'))],
      ['Submitted', k.shell, locked('submitted')],
      ['Rejected', k.shell, locked('rejected')],
      ['Approved', k.shell, locked('approved')],
      ['Released', k.shell, locked('released')],
      [
        'Loading',
        k.shell,
        () => [
          Tx('Muted', 'Loading release workspace…'),
          ...[1, 2, 3].map((i) =>
            W('Skeleton/Tile', { name: `Skeleton ${i}`, width: 'fill_container' }),
          ),
        ],
      ],
      [
        'Unavailable',
        k.shell,
        () => [
          Col({ name: 'Unavailable', gap: 14, width: 'fill_container', padding: [48, 0] }, [
            Tx('H1', 'Release workspace unavailable'),
            Row({ name: 'Actions', gap: 10 }, [
              Btn('Try again', 'Outline', 'refresh-cw'),
              Btn('Return to Music', 'Ghost', 'arrow-left'),
            ]),
          ]),
        ],
      ],
      ['Edit details', k.shell, over(md.editRelease)],
      ['Edit timing', k.shell, over(md.schedule)],
      ['Edit artwork', k.shell, over(md.artwork)],
      ['Upload track', k.shell, over(md.upload)],
      ['Upload track — dropping', k.shell, over((m) => md.upload(m, { active: true }))],
      ['Upload track — uploading', k.shell, over((m) => md.upload(m, { progress: true }))],
      ['Upload track — file too large', k.shell, over((m) => md.upload(m, { error: true }))],
      ['Replace audio', k.shell, over((m) => md.upload(m, { replace: true }))],
      ['Rename track', k.shell, over(md.rename)],
      ['Track ISRC', k.shell, over((m) => md.isrc(m, true))],
      ['Track genres', k.shell, over(md.genres)],
      ['Remove track', k.shell, over(md.removeTrack)],
      ['Add contributor', k.shell, over(cd.contributor)],
      ['Contributor needs a role', k.shell, over((m) => cd.contributor(m, true))],
      ['Credit me alone', k.shell, over(cd.creditSelf)],
      ['Remove contributor', k.shell, over(cd.removeContributor)],
      ['Splits', k.shell, over(cd.splits)],
      ['Splits over 100%', k.shell, over((m) => cd.splits(m, true))],
      ['Rights', k.shell, over(cd.rights)],
      ['Release UPC', k.shell, over((m) => cd.upc(m, true))],
      ['Compilation picker', k.shell, over(cd.compilation)],
      ['Compilation — no matches', k.shell, over((m) => cd.compilation(m, { empty: true }))],
      ['Delete release', k.shell, over(md.deleteRelease)],
    ],
  )
}
