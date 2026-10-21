// Web-player page specs: public.
import { TRACKS, img } from '../../kit.mjs'
import {
  ART,
  Alert,
  AuthMobile,
  Badge,
  Blank,
  Button,
  Chips,
  Col,
  Desktop,
  Divider,
  ErrorState,
  Ic,
  L,
  Logo,
  MHeader,
  Mobile,
  OfflineState,
  Panel,
  R,
  Row,
  TrackTable,
  Tx,
  state,
} from '../../ui.mjs'
import { mrows } from './shared.mjs'

/* 404 "signal lost": the missing page as a track that cannot play */
function lost(m, reported, guest) {
  const card = Panel(
    [
      Row({ width: 'fill_container', justifyContent: 'space_between' }, [
        Tx('Eyebrow', 'NOW PLAYING · SIGNAL LOST'),
        R('Status/Error', {}, { label: { content: 'No signal' } }),
      ]),
      Row({ name: 'Track', gap: 16, width: 'fill_container' }, [
        R('Media/Cover', {
          width: m ? 64 : 88,
          height: m ? 64 : 88,
          fill: img(ART.night),
          opacity: 0.45,
        }),
        Col({ gap: 2, width: 'fill_container' }, [
          Tx(m ? 'H3' : 'H2', 'Page not found'),
          Tx('Muted', 'The 404s · Lost Frequencies (B-side)'),
        ]),
      ]),
      R('NotFound/Flatline', m ? { width: 'fill_container' } : {}),
      R(
        'Seek Bar',
        {},
        {
          elapsedBar: { width: m ? 260 : 420 },
          elapsed: { content: '4:04' },
          duration: { content: '4:04' },
        },
      ),
      Row({ name: 'Actions', gap: 10, width: 'fill_container' }, [
        Button(guest ? 'Back to the start' : 'Play something else', 'large-default', {
          icon: 'play',
          width: m ? 'fill_container' : undefined,
        }),
        !m && Button('Search', 'large-outline', { icon: 'search' }),
      ]),
      reported
        ? Alert(
            'Thanks — link reported',
            'We will fix where it points. You can keep listening meanwhile.',
          )
        : Tx('Link', 'Report a broken link'),
    ],
    { width: m ? 'fill_container' : 620, gap: 18 },
  )
  const tips = guest
    ? null
    : Col({ name: 'Try instead', gap: 12, width: m ? 'fill_container' : 620 }, [
        Tx('H4', 'Try these instead'),
        (m ? Col : Row)({ gap: 12, width: 'fill_container' }, [
          R('Quick Tile/Liked', { width: 'fill_container' }, { title: { content: 'Liked Songs' } }),
          R(
            'Quick Tile',
            { width: 'fill_container' },
            { cover: { fill: img(ART.luma) }, title: { content: 'Discover' } },
          ),
          !m &&
            R(
              'Quick Tile',
              { width: 'fill_container' },
              { cover: { fill: img(ART.drift) }, title: { content: 'Your Library' } },
            ),
        ]),
      ])
  return Blank(m ? '404' : '404', m ? 390 : 1440, m ? 844 : 900, [
    Logo(),
    Tx('Display Primary', '404'),
    Tx('Paragraph', 'This track skipped. The page you are looking for is not on the setlist.', {
      wrap: true,
      textAlign: 'center',
      width: m ? 'fill_container' : 520,
    }),
    card,
    tips,
  ])
}

/* offline: the page offers the beta offline version, which plays what is on this device */
function offlineBeta(m) {
  return Panel(
    [
      Row({ name: 'Head', gap: 10, width: 'fill_container' }, [
        Ic('hard-drive-download', 'Primary', 22),
        Tx('H4', 'Offline version'),
        Badge('Beta', 'default'),
      ]),
      Tx(
        'Paragraph',
        'Play your downloaded music and liked songs without a connection. Likes and playlist edits wait here and sync when you are back online.',
        { wrap: true },
      ),
      Row({ name: 'Facts', gap: 16 }, [
        Tx('Muted', '214 downloaded tracks'),
        Tx('Muted', '1.8 GB on this device'),
      ]),
      Button('Try the offline version', 'large-default', {
        icon: 'arrow-right',
        width: m ? 'fill_container' : undefined,
      }),
    ],
    { width: m ? 'fill_container' : 520 },
  )
}
function offlinePage(m) {
  return Blank('Offline', m ? 390 : 1440, m ? 844 : 900, [
    Logo(),
    OfflineState(
      'You are offline',
      'Check your connection and try opening the page again.',
      'Try again',
    ),
    offlineBeta(m),
  ])
}
function offlineApp(m, back) {
  const banner = back
    ? Alert('You are back online', 'Syncing 3 changes made offline — likes and one playlist edit.')
    : Alert('Offline mode · Beta', 'Playing from this device. Changes sync when you reconnect.')
  const rows = TRACKS.slice(0, 5)
  const body = [
    banner,
    Row({ gap: 10 }, [
      Tx(m ? 'H2' : 'H1', 'Downloaded'),
      Badge('214 tracks', 'secondary'),
      !m &&
        R(
          back ? 'Status/Syncing' : 'Status/Queued',
          {},
          { label: { content: back ? 'Syncing 3' : '3 changes queued' } },
        ),
    ]),
    Chips(['All', 'Liked Songs', 'Night drive', 'Rain Drive']),
    m ? mrows(rows) : TrackTable(rows),
    Tx(
      'Caption',
      'Not downloaded items are hidden while offline. Search and recommendations return when you are back.',
      { wrap: true },
    ),
  ]
  return m
    ? Mobile(back ? 'Back online' : 'Offline version', body.flat(), {
        tab: 'library',
        header: MHeader('Offline', { back: false }),
      })
    : Desktop(back ? 'Back online' : 'Offline version', body, { nowPlaying: true })
}

function legal() {
  return [
    R(
      'Alert/Warning',
      {},
      {
        text: {
          content:
            'Draft — pending legal review. Text in [[double brackets]] is not filled in yet.',
        },
      },
    ),
    Tx('Eyebrow', 'LEGAL'),
    Tx('H1', 'Terms of Use'),
    Tx(
      'Paragraph',
      'These terms govern your use of Bitrate — the web player, the mobile apps and the artist tools.',
      { wrap: true },
    ),
    ...[
      ['1. Acceptance and eligibility', 'You must be at least 16 years old to use Bitrate.'],
      [
        '2. Your account',
        'Keep your login details safe. Tell us at [[support email]] if you suspect unauthorised access.',
      ],
      [
        '3. Using the service',
        'Bitrate gives you a personal, non-transferable licence to stream music for private listening.',
      ],
    ].flatMap(([h, b]) => [Tx('H3', h), Tx('Paragraph', b, { wrap: true })]),
    R(
      'Note',
      {},
      {
        text: {
          content:
            'Note — these terms do not limit rights you have under the consumer law of your country.',
        },
      },
    ),
    Divider(),
    Tx('Body Strong', 'Other legal documents'),
    ...[
      'Privacy Policy',
      'Community Guidelines',
      'Complaints and reports',
      'Copyright and notice-and-action',
    ].map((d) => Row({ gap: 8 }, [Ic('file-text', 'Muted', 16), Tx('Link', d)])),
  ]
}

export const publicPages = {
  legal: {
    assistant: true,
    title: 'Legal / Document',
    route: '/legal/[slug] — terms, privacy, community, complaints, copyright',
    context: 'One template renders every legal document; shown with Terms of Use.',
    desktop: () =>
      Blank('Legal', 1440, 1500, [
        R('Public Header'),
        L(
          {
            name: 'Document Column',
            width: 'fill_container',
            height: 'fill_container',
            justifyContent: 'center',
            padding: [48, 0],
          },
          [Col({ name: 'Document', width: 760, gap: 18 }, legal())],
        ),
      ]),
    mobile: () => AuthMobile('Legal', legal()),
  },
  'not-found': {
    assistant: true,
    title: 'Not found (404)',
    route: 'any unknown route',
    context:
      'Global not-found page (app/not-found.tsx) as "Signal lost": the page is a track that does not exist — The 404s, stuck at 4:04, a flatline in the middle of the spectrum. Play goes home; search and report a broken link; suggestions below.',
    desktop: () => lost(false),
    mobile: () => lost(true),
    states: [
      state(
        'Broken link reported',
        () => lost(false, true),
        () => lost(true, true),
      ),
      state(
        'Signed out',
        () => lost(false, false, true),
        () => lost(true, false, true),
      ),
    ],
  },
  error: {
    assistant: true,
    title: 'Error',
    route: 'app/main/error.tsx · app/error.tsx · global-error',
    context: 'Error boundaries: a page inside the player, the app root, and a failed start.',
    desktop: () =>
      Desktop('Page error', [
        ErrorState(
          'Something went wrong',
          'This page could not be loaded. Try again, or head back home.',
        ),
      ]),
    mobile: () =>
      Mobile(
        'Page error',
        [
          ErrorState(
            'Something went wrong',
            'This page could not be loaded. Try again, or head back home.',
          ),
        ],
        { header: MHeader('', { back: true }) },
      ),
    states: [
      state(
        'Root error',
        () =>
          Blank('Root error', 1440, 900, [
            Logo(),
            ErrorState(
              'Something went wrong',
              'Something went wrong on our side. Try again, or head back home.',
            ),
          ]),
        () =>
          Blank('Root error', 390, 844, [
            Logo(),
            ErrorState(
              'Something went wrong',
              'Something went wrong on our side. Try again, or head back home.',
            ),
          ]),
      ),
      state(
        'Global failure',
        () =>
          Blank('Global failure', 1440, 900, [
            Logo(),
            ErrorState(
              'The app failed to load',
              'An unexpected error stopped the player from starting. Reloading usually fixes it.',
              'Reload the app',
              'power',
              null,
            ),
          ]),
        () =>
          Blank('Global failure', 390, 844, [
            Logo(),
            ErrorState(
              'The app failed to load',
              'An unexpected error stopped the player from starting. Reloading usually fixes it.',
              'Reload the app',
              'power',
              null,
            ),
          ]),
      ),
    ],
  },
  offline: {
    assistant: true,
    title: 'Offline',
    route: '/offline',
    context:
      'Shown by the service worker without a connection. Bitrate keeps working offline: the beta offline version plays downloaded and liked music and queues changes to sync later.',
    desktop: () => offlinePage(false),
    mobile: () => offlinePage(true),
    states: [
      state(
        'Offline version (beta)',
        () => offlineApp(false),
        () => offlineApp(true),
      ),
      state(
        'Back online',
        () => offlineApp(false, true),
        () => offlineApp(true, true),
      ),
    ],
  },
}
