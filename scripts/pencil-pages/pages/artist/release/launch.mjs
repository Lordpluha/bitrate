// Artist / Release — Launch (step=launch; widgets/ReleaseWorkspace LaunchStage, features/publish-release):
// the "Bitrate publication" panel — the publish prompt or the status line with its one action — and the
// release links inside it; "What happens next" on the right (share the Bitrate link, promotion coming
// soon). The publish confirmation is the PublishDialog modal; link copy results are toasts.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { releaseKit } from './kit.mjs'

/** The release-launch page spec. */
export function releaseLaunchPage(ui, frames) {
  const { W, P, Row, Btn, KV, St, inline } = ui
  const k = releaseKit(ui)
  const PUBLICATION = {
    approved: (o) => [
      P(
        'Body',
        'Approved by Bitrate. Publishing makes your tracks playable in the Bitrate player and notifies your followers once. Stores are not involved.',
      ),
      Btn(o.premiere ? 'Publish on Dec 12, 2026, 18:00 UTC' : 'Publish now', 'Primary'),
    ],
    scheduled: (o) => [
      P(
        'Body',
        'Premiere scheduled for Dec 12, 2026, 18:00 UTC. Your release goes live on Bitrate then. Cancel it to change the timing.',
      ),
      Btn(o.busy ? 'Cancelling…' : 'Cancel premiere', 'Outline'),
    ],
    publishing: () => [
      P(
        'Body',
        'Publishing on Bitrate… Your tracks are being prepared for the player, which usually takes a few minutes. Listeners see the release once every track is ready.',
      ),
    ],
    failed: () => [
      P(
        'Error',
        'Publishing failed — Bitrate has been notified and will retry. Your release stays approved.',
      ),
    ],
    released: (o) => [
      P(
        'Body',
        'Live on Bitrate. Taking it offline stops its tracks everywhere until you publish it again.',
      ),
      Btn(o.busy ? 'Taking offline…' : 'Take offline', 'Outline'),
    ],
    unpublished: (o) => [
      P(
        'Body',
        'Offline. Publishing it again needs no new review and does not notify your followers again.',
      ),
      Btn(o.busy ? 'Publishing…' : 'Publish again', 'Outline'),
    ],
    admin: () => [P('Body', 'Bitrate took this release offline. Contact support to discuss it.')],
  }
  const linkActions = (live) =>
    live
      ? [
          St('Ready', 'Available'),
          Btn('Copy link', 'Compact Outline'),
          Btn('Open in player', 'Compact Outline', 'external-link'),
        ]
      : [St('Neutral', 'Not live'), k.locked('Copy link')]
  /* on a phone the actions sit under the link text instead of squeezing it */
  const links = (live, m) => [
    W('Divider', { name: 'Divider', width: 'fill_container' }),
    P('Body Strong', 'Release links'),
    P('Muted', 'Availability is shown per destination; missing links are never implied.'),
    W(
      'Row/Link',
      { name: 'Bitrate', width: 'fill_container' },
      {
        icon: { icon: 'link-2' },
        title: { content: 'Bitrate' },
        meta: { content: live ? 'Primary release page' : 'Published when the release goes live' },
        trail: m ? { enabled: false } : inline('Trail', linkActions(live)),
      },
    ),
    ...(m ? [Row({ name: 'Link actions', gap: 8, alignItems: 'center' }, linkActions(live))] : []),
  ]
  const next = (live) =>
    k.tile('What happens next', 'sparkles', [
      W(
        'Row/Link',
        { name: 'Share', width: 'fill_container' },
        {
          icon: { icon: 'share-2' },
          title: { content: 'Share the Bitrate link' },
          meta: { content: live ? 'Ready to share' : 'After the release goes live' },
          trail: { enabled: false },
        },
      ),
      W(
        'Row/Link',
        { name: 'Promotion', width: 'fill_container' },
        {
          icon: { icon: 'megaphone' },
          title: { content: 'Prepare a promotion plan' },
          meta: { content: 'Optional' },
          trail: inline('Trail', [St('Neutral', 'Coming soon')]),
        },
      ),
      P('Caption', 'Only Bitrate publication is shown as complete here.'),
    ])
  const page = (m, status = 'approved', kind = status, o = {}) => {
    const live = status === 'released'
    return k.stage(
      m,
      status,
      [
        ...(o.toast
          ? [Row({ name: 'Toast', width: 'fill_container', justifyContent: 'end' }, [o.toast])]
          : []),
        k.columns(
          m,
          [k.tile('Bitrate publication', 'rocket', [...PUBLICATION[kind](o), ...links(live, m)])],
          [next(live)],
        ),
      ],
      { premiere: status === 'scheduled' || Boolean(o.premiere) },
    )
  }
  const dialog = (m) => [
    k.header(m, 'approved'),
    k.stepper(m, 'approved'),
    k.modal(
      m,
      'Publish on Bitrate',
      [
        KV('Release', 'Night Signal'),
        KV('Tracks', '2'),
        KV('Timing', 'Right away'),
        P('Muted', 'Need another look? Every stage stays open until you publish.'),
      ],
      [Btn('Keep reviewing', 'Outline'), Btn('Publish now', 'Primary')],
      480,
    ),
  ]
  const toast = (tone, text, m) =>
    W(
      `Toast/${tone}`,
      { name: `Toast / ${tone}`, ...(m ? { width: 'fill_container' } : {}) },
      { text: { content: text } },
    )
  const states = [
    ['Publish dialog', dialog],
    ['Premiere planned', (m) => page(m, 'approved', 'approved', { premiere: true })],
    ['Scheduled', (m) => page(m, 'scheduled')],
    ['Cancelling premiere', (m) => page(m, 'scheduled', 'scheduled', { busy: true })],
    ['Publishing', (m) => page(m, 'publishing')],
    ['Publishing failed', (m) => page(m, 'failed')],
    ['Live', (m) => page(m, 'released')],
    [
      'Link copied',
      (m) => page(m, 'released', 'released', { toast: toast('Success', 'Link copied', m) }),
    ],
    [
      'Copy failed',
      (m) =>
        page(m, 'released', 'released', {
          toast: toast(
            'Error',
            'Could not copy the link. Copy it manually: https://bitrate.fm/main/album/night-signal',
            m,
          ),
        }),
    ],
    ['Taking offline', (m) => page(m, 'released', 'released', { busy: true })],
    ['Offline', (m) => page(m, 'unpublished')],
    ['Publishing again', (m) => page(m, 'unpublished', 'unpublished', { busy: true })],
    ['Taken offline by Bitrate', (m) => page(m, 'unpublished', 'admin')],
  ]
  return pageSpec(
    frames,
    {
      title: 'Artist / Release — Launch',
      route: '/dashboard/music/$releaseId?step=launch',
      context:
        'Publication on Bitrate (the player) and the release links. Stores are not involved; promotion is planned.',
    },
    k.shell,
    (m) => page(m),
    states.map(([label, build]) => [label, k.shell, build]),
  )
}
