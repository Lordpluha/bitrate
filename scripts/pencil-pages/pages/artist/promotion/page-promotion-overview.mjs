// Artist / Promotion calendar: upcoming plan steps across releases as bento tiles — the numbers tile,
// this week and later on eight columns with the active plans table, releases without a plan and the
// promise on four. Nothing is posted automatically.
import { activePlans } from './promo-calendar.mjs'
import { pageSpec } from '../../../artist-ws/spec.mjs'

/** The promotion-overview page spec. */
export function promotionOverviewPage(ui, frames) {
  const { W, Btn, St, Tile, Setting, DateRow, Alert, Tabs, Stats, Empty, ErrorState } = ui
  const { grid, pageHead } = frames
  const shell = {
    nav: 'promotion',
    crumb: 'Promotion',
    action: 'Promotion profile',
    actionIcon: 'id-card',
  }
  const busy = { ...shell, action: null }
  const head = (sub = 'Upcoming steps from your release plans') => pageHead('Promotion', sub)
  const calendar = (m) => [
    head(),
    Tabs(['Upcoming', 'This month', 'Past'], 0),
    Tile('At a glance', 'chart-no-axes-column', [
      ...(m
        ? [
            Stats([
              ['THIS WEEK', '3', 'Steps due'],
              ['APPROVED', '12', 'Across 2 releases'],
            ]),
            Stats([
              ['AWAITING YOU', '5', 'Suggested steps'],
              ['AI ALLOWANCE', '$0.42', 'of $2.00 this month'],
            ]),
          ]
        : [
            Stats([
              ['THIS WEEK', '3', 'Steps due'],
              ['APPROVED', '12', 'Across 2 releases'],
              ['AWAITING YOU', '5', 'Suggested steps'],
              ['AI ALLOWANCE', '$0.42', 'of $2.00 this month'],
            ]),
          ]),
    ]),
    grid(m, [
      [
        8,
        [
          Tile(
            'This week',
            'calendar-days',
            [
              DateRow(
                'SEP',
                '19',
                'Share a 15-second hook — Afterglow',
                'Post · TikTok, YouTube Shorts',
                St('Brand', 'Suggested', 'sparkles'),
              ),
              DateRow(
                'SEP',
                '21',
                'Behind the song — Night Signal',
                'Post · Instagram',
                St('Ready', 'Approved', 'circle-check'),
              ),
              DateRow(
                'SEP',
                '23',
                'Send the track to music channel hosts — Afterglow',
                'Action',
                St('Processing', 'Edited', 'pencil'),
              ),
            ],
            { hue: true },
          ),
          Tile('Later', 'calendar-clock', [
            DateRow(
              'SEP',
              '26',
              'Release day — Afterglow',
              'Follower message · Post',
              St('Brand', 'Suggested', 'sparkles'),
            ),
            DateRow(
              'OCT',
              '02',
              'Thank listeners — Afterglow',
              'Post · Instagram, Telegram',
              St('Brand', 'Suggested', 'sparkles'),
            ),
            DateRow(
              'OCT',
              '17',
              'Release day — Night Signal',
              'Follower message',
              St('Ready', 'Approved', 'circle-check'),
            ),
          ]),
          activePlans(ui, m),
        ],
      ],
      [
        4,
        [
          Tile('Scheduled without a plan', 'calendar-plus', [
            Setting('Midnight Drive', 'Single · Nov 7', St('Neutral', 'No plan', 'circle-dashed')),
            Btn('Create plan', 'Secondary', 'sparkles', { width: 'fill_container' }),
          ]),
          Alert(
            'Info',
            'Nothing is published for you',
            'Every step needs your approval. Bitrate never posts to your social accounts.',
          ),
        ],
      ],
    ]),
  ]
  const skeleton = (n) => W('Skeleton/Tile', { name: `Loading ${n}`, width: 'fill_container' })
  return pageSpec(
    frames,
    {
      title: 'Artist / Promotion calendar',
      route: 'planned — /dashboard/promotion',
      context:
        'Upcoming plan steps across releases; nothing is posted automatically. Bento tiles on the 12-column grid.',
    },
    shell,
    calendar,
    [
      [
        'No plans yet',
        shell,
        (m) => [
          head(),
          Empty(
            'No promotion plans yet',
            'Schedule a release, then generate a plan from its Promotion step.',
            'Open music',
            'megaphone',
            m,
          ),
        ],
      ],
      [
        'No promotion profile',
        busy,
        (m) => [
          head(),
          Empty(
            'Set up your promotion profile',
            'Tell Bitrate your goal, channels and voice once. Every release plan uses it.',
            'Set up profile',
            'megaphone',
            m,
          ),
        ],
      ],
      [
        'Loading',
        busy,
        (m) => [
          head('Loading your plans…'),
          skeleton('numbers'),
          grid(m, [
            [8, [skeleton(1), skeleton(2)]],
            [4, [skeleton(3)]],
          ]),
        ],
      ],
      [
        'Load failed',
        busy,
        (m) => [
          head(),
          ErrorState(
            'Promotion could not be loaded',
            'Check your connection and try again.',
            'Try again',
            'triangle-alert',
            m,
          ),
        ],
      ],
    ],
  )
}
