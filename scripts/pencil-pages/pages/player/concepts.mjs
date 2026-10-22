// Web-player page specs: concepts.
import { img } from '../../kit.mjs'
import {
  ART,
  Button,
  Chips,
  Col,
  Concept,
  Desktop,
  EmptyState,
  ErrorState,
  MHeader,
  Mobile,
  MobileTrack,
  Panel,
  R,
  Row,
  Skeleton,
  Tx,
  state,
} from '../../ui.mjs'
import { pageTitle, std, ARTISTS } from './shared.mjs'

function activity() {
  return [
    ['avatar2', 'Jonah', 'liked', 'Night Signal', 'night', '12 min ago'],
    ['avatar3', 'Ana', 'added 3 tracks to', 'Rain Drive', 'drift', '1 h ago'],
    ['avatar4', 'Leo', 'started following', 'Luma Vale', 'luma', '3 h ago'],
    ['avatar1', 'Maya', 'is listening to', 'Afterglow', 'afterglow', 'now'],
  ].map(([av, n, a, item, art, t]) =>
    R(
      'Activity Row',
      {},
      {
        avatar: {
          fill: { type: 'image', url: `../design-system/assets/avatars/${av}.jpg`, mode: 'cover' },
        },
        name: { content: n },
        action: { content: a },
        item: { content: item },
        time: { content: t },
        cover: { fill: img(ART[art]) },
      },
    ),
  )
}
function stat(label, value, sub) {
  return R(
    'Stat Tile',
    {},
    { label: { content: label }, value: { content: value }, sub: { content: sub } },
  )
}
function bars() {
  return Row(
    { name: 'Listening By Day', width: 'fill_container', height: 180, gap: 18, alignItems: 'end' },
    [
      ['Mon', 46],
      ['Tue', 62],
      ['Wed', 38],
      ['Thu', 74],
      ['Fri', 100],
      ['Sat', 88],
      ['Sun', 56],
    ].map(([d, v]) =>
      R(
        v === 100 ? 'Bar Chart/Bar Highlight' : 'Bar Chart/Bar',
        {},
        { bar: { height: Math.round((150 * v) / 100) }, label: { content: d } },
      ),
    ),
  )
}
function notes() {
  return [
    ['user-plus', 'Jonah started following you', '5 min ago', true],
    ['disc-3', 'Luma Vale released a new single: Low Orbit', '2 h ago', true],
    ['list-music', 'Ana added 3 tracks to Rain Drive', 'Yesterday', false],
    ['calendar', 'Mira Sol announced a live session on 18 Oct', '2 days ago', false],
  ].map(([icon, text, time, unread]) =>
    R(
      unread ? 'Notification Row/Unread' : 'Notification Row/Read',
      {},
      { icon: { icon }, text: { content: text }, time: { content: time } },
    ),
  )
}

export const conceptsPages = {
  /* ---------- concepts from the docs ---------- */
  'activity-feed': {
    more: ['notifications', '20 of 80'],
    title: 'Activity feed',
    route: 'concept — roadmap "Activity feed", "Follow users"',
    context: 'What the people you follow are doing. Concept.',
    desktop: () =>
      Desktop(
        'Activity',
        [
          pageTitle('Activity', null, true),
          Chips(['All', 'Listening', 'Likes', 'Playlists']),
          Col({ width: 760, gap: 0 }, activity()),
        ],
        { nowPlaying: true },
      ),
    mobile: () =>
      Mobile('Activity', [Chips(['All', 'Listening', 'Likes']), ...activity()], {
        header: MHeader('Activity', { back: false }),
      }),
    states: [
      state(
        'Empty',
        () =>
          Desktop('Empty', [
            pageTitle('Activity', null, true),
            EmptyState(
              'Follow listeners to see their activity',
              'Their likes, playlists and what they are playing will show up here.',
              'Find people to follow →',
              'users',
            ),
          ]),
        () =>
          Mobile(
            'Empty',
            [
              EmptyState(
                'Follow listeners to see their activity',
                'Their likes and playlists will show up here.',
                'Find people to follow →',
                'users',
              ),
            ],
            { header: MHeader('Activity', { back: false }) },
          ),
      ),
      ...std('Activity', {
        loading: 'notifications',
        error: ['Activity is unavailable', 'Try again in a moment.'],
      }),
    ],
  },
  'listening-analytics': {
    title: 'Listening analytics',
    route: 'concept — backlog "Listening Analytics"',
    context: 'Personal listening statistics. Concept.',
    desktop: () =>
      Desktop(
        'Analytics',
        [
          pageTitle('Your listening', null, true),
          Tx('Muted', 'October so far. Only visible to you.'),
          Row({ width: 'fill_container', gap: 16 }, [
            stat('Minutes listened', '1,284', '+18% vs September'),
            stat('Tracks', '342', '96 new to you'),
            stat('Top genre', 'Synth pop', '41% of listening'),
            stat('Streak', '12 days', 'Longest this year'),
          ]),
          Row({ width: 'fill_container', gap: 16, alignItems: 'start' }, [
            Panel([Tx('Body Strong', 'Listening by day'), bars()]),
            Panel(
              [
                Tx('Body Strong', 'Top artists'),
                ...ARTISTS.slice(4)
                  .concat(ARTISTS.slice(1, 3))
                  .map(([a, art]) => MobileTrack(a, 'Artist', art)),
              ],
              { width: 380 },
            ),
          ]),
        ],
        { library: false },
      ),
    mobile: () =>
      Mobile(
        'Analytics',
        [
          Row({ gap: 12, width: 'fill_container' }, [
            stat('Minutes', '1,284', '+18%'),
            stat('Tracks', '342', '96 new'),
          ]),
          Panel([Tx('Body Strong', 'Listening by day'), bars()]),
          Tx('H4', 'Top artists'),
          ...ARTISTS.slice(1, 4).map(([a, art]) => MobileTrack(a, 'Artist', art)),
        ],
        { tab: 'library', header: MHeader('Your listening') },
      ),
    states: [
      state(
        'Not enough data',
        () =>
          Desktop(
            'Not enough',
            [
              pageTitle('Your listening', null, true),
              EmptyState(
                'Not enough listening yet',
                'Listen for a few days and your statistics will appear here.',
                'Find something to play →',
                'chart-column',
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Not enough',
            [
              EmptyState(
                'Not enough listening yet',
                'Listen for a few days and your statistics will appear here.',
                'Find something to play →',
                'chart-column',
              ),
            ],
            { tab: 'library', header: MHeader('Your listening') },
          ),
      ),
      ...std('Analytics', {
        loading: 'grid',
        error: ['Statistics are unavailable', 'Try again in a moment.'],
        desktopOpts: { library: false },
        mobileOpts: { tab: 'library' },
      }),
    ],
  },
  notifications: {
    more: ['notifications', '20 of 64'],
    title: 'Notifications',
    route: 'concept — header popover exists; full page parked until a backend exists',
    context: 'Followers, releases, playlists and events. Concept.',
    desktop: () =>
      Desktop('Notifications', [
        Row({ width: 760, justifyContent: 'space_between' }, [
          Row({ gap: 10 }, [Tx('H1', 'Notifications'), Concept()]),
          Button('Mark all read', 'ghost'),
        ]),
        Chips(['All', 'Followers', 'Releases', 'Playlists', 'Events']),
        Col({ gap: 4, width: 760 }, notes()),
      ]),
    mobile: () =>
      Mobile('Notifications', [Chips(['All', 'Followers', 'Releases']), ...notes()], {
        header: MHeader('Notifications', { actions: ['check-check'] }),
      }),
    states: [
      state(
        'All caught up',
        () =>
          Desktop('Caught up', [
            Tx('H1', 'Notifications'),
            EmptyState(
              "You're all caught up",
              'Watch this space for news on your followers, playlists, events and more.',
              null,
              'circle-check',
            ),
          ]),
        () =>
          Mobile(
            'Caught up',
            [
              EmptyState(
                "You're all caught up",
                'Watch this space for news on your followers, playlists, events and more.',
                null,
                'circle-check',
              ),
            ],
            { header: MHeader('Notifications') },
          ),
      ),
      state(
        'Loading',
        () => Desktop('Loading', [Tx('H1', 'Notifications'), Skeleton('notifications')]),
        () =>
          Mobile('Loading', [Skeleton('notifications', true)], {
            header: MHeader('Notifications'),
          }),
      ),
      state(
        'Error',
        () =>
          Desktop('Error', [
            Tx('H1', 'Notifications'),
            ErrorState('Notifications are unavailable right now.', 'Try again in a moment.'),
          ]),
        () =>
          Mobile(
            'Error',
            [ErrorState('Notifications are unavailable right now.', 'Try again in a moment.')],
            { header: MHeader('Notifications') },
          ),
      ),
    ],
  },
}
