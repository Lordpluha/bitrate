// Artist / Release — Launch (step=launch; widgets/ReleaseWorkspace LaunchStage, features/publish-release):
// Bitrate publication in every state — publish now or on a date, premiere scheduled (cancel), publishing,
// failed, live (take offline), offline (publish again), taken offline by Bitrate — the release links
// (copy, open in player) and "Prepare a promotion plan", coming soon.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { releaseKit } from './kit.mjs'

/** The release-launch page spec. */
export function releaseLaunchPage(ui, frames) {
  const { W, P, Btn, KV, St, inline } = ui
  const k = releaseKit(ui)
  const summary = (premiere) => [
    KV('Release', 'Night Signal · Single'),
    KV('Tracks', '2 tracks'),
    KV(
      'Timing',
      premiere ? 'Premiere on Nov 14, 2026, 18:00 UTC' : 'Right away, as soon as you publish it',
    ),
  ]
  const PUBLICATION = {
    approved: (o) => [
      P(
        'Muted',
        'Approved by Bitrate. Publishing makes your tracks playable in the Bitrate player and notifies your followers once. Stores are not involved.',
      ),
      ...summary(o.premiere),
      Btn(o.premiere ? 'Publish on Nov 14, 2026, 18:00 UTC' : 'Publish now', 'Primary', 'rocket'),
      P('Caption', 'Need another look? Every stage stays open until you publish.'),
    ],
    confirm: () => [
      P('Muted', 'Need another look? Every stage stays open until you publish.'),
      ...summary(true),
      inline('Actions', [
        Btn('Keep reviewing', 'Ghost'),
        Btn('Schedule premiere', 'Primary', 'calendar-clock'),
      ]),
    ],
    scheduled: (o) => [
      k.note(
        'Info',
        'Premiere scheduled for Nov 14, 2026, 18:00 UTC. Your release goes live on Bitrate then. Cancel it to change the timing.',
      ),
      W('Countdown', { name: 'Countdown' }),
      Btn(
        o.busy ? 'Cancelling…' : 'Cancel premiere',
        'Outline',
        o.busy ? 'loader-circle' : 'calendar-x',
      ),
    ],
    publishing: () => [
      k.note(
        'Info',
        'Publishing on Bitrate… Your tracks are being prepared for the player, which usually takes a few minutes. Listeners see the release once every track is ready.',
      ),
    ],
    failed: () => [
      k.note(
        'Error',
        'Publishing failed — Bitrate has been notified and will retry. Your release stays approved.',
      ),
    ],
    released: (o) => [
      k.note(
        'Success',
        'Live on Bitrate. Taking it offline stops its tracks everywhere until you publish it again.',
      ),
      Btn(
        o.busy ? 'Taking offline…' : 'Take offline',
        'Danger',
        o.busy ? 'loader-circle' : 'circle-pause',
      ),
    ],
    unpublished: (o) => [
      k.note(
        'Warning',
        'Offline. Publishing it again needs no new review and does not notify your followers again.',
      ),
      Btn(o.busy ? 'Publishing…' : 'Publish again', 'Primary', o.busy ? 'loader-circle' : 'rocket'),
    ],
    admin: () => [
      k.note('Error', 'Bitrate took this release offline. Contact support to discuss it.'),
    ],
  }
  const live = (status) => status === 'released'
  const links = (status) =>
    k.tile('Release links', 'link', [
      P('Muted', 'Availability is shown per destination; missing links are never implied.'),
      W(
        'Row/Link',
        { name: 'Primary release page', width: 'fill_container' },
        {
          meta: {
            content: live(status)
              ? 'bitrate.fm/main/album/night-signal'
              : 'Published when the release goes live',
          },
          trail: inline(
            'Trail',
            live(status)
              ? [
                  St('Ready', 'Available'),
                  Btn('Copy link', 'Compact Ghost', 'copy'),
                  Btn('Open in player', 'Compact Ghost', 'external-link'),
                ]
              : [St('Neutral', 'Not live')],
          ),
        },
      ),
      ...(live(status)
        ? [P('Caption', 'Ready to share')]
        : [P('Caption', 'Available once the release goes live on Bitrate.')]),
    ])
  const next = () =>
    k.tile('After the release goes live', 'sparkles', [
      W(
        'Row/Link',
        { name: 'Promotion plan', width: 'fill_container' },
        {
          icon: { icon: 'megaphone' },
          title: { content: 'Prepare a promotion plan' },
          meta: { content: 'Optional' },
          trail: inline('Trail', [St('Brand', 'Coming soon', 'clock-3')]),
        },
      ),
      P('Caption', 'Only Bitrate publication is shown as complete here.'),
    ])
  const page = (m, status = 'approved', kind = status, o = {}) =>
    k.stage(m, status, 'launch', [
      ...(o.notice ? [o.notice] : []),
      k.columns(
        m,
        [links(status), next()],
        [k.tile('Bitrate publication', 'rocket', PUBLICATION[kind](o))],
      ),
    ])
  const states = [
    ['Publish on a date', (m) => page(m, 'approved', 'approved', { premiere: true })],
    ['Confirm premiere', (m) => page(m, 'approved', 'confirm')],
    ['Scheduled', (m) => page(m, 'scheduled')],
    ['Cancelling premiere', (m) => page(m, 'scheduled', 'scheduled', { busy: true })],
    ['Publishing', (m) => page(m, 'publishing')],
    ['Publishing failed', (m) => page(m, 'failed')],
    ['Live', (m) => page(m, 'released')],
    [
      'Link copied',
      (m) => page(m, 'released', 'released', { notice: k.note('Success', 'Link copied') }),
    ],
    [
      'Copy failed',
      (m) =>
        page(m, 'released', 'released', {
          notice: k.note(
            'Error',
            'Could not copy the link. Copy it manually: https://bitrate.fm/main/album/night-signal',
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
