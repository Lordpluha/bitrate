// Web-player page specs: artist profile.
import { TRACKS, img } from '../../kit.mjs'
import {
  ART,
  AlbumCard,
  ArtistCard,
  Avatar,
  Button,
  CardRow,
  Chips,
  Col,
  Desktop,
  EmptyState,
  Ic,
  IconBtn,
  L,
  MHeader,
  Mobile,
  MobileTrack,
  Panel,
  Play,
  PlaylistCard,
  R,
  Row,
  SectionHeader,
  Spacer,
  TrackTable,
  Tx,
  state,
} from '../../ui.mjs'
import { APP_STATES } from '../../pages-app.mjs'
import { CONTEXT_STATES } from '../../pages-context-menu.mjs'
import { mrows, std, songs, ARTISTS, artistRow } from './shared.mjs'

/* profile: bento tiles */
function profileTile(title, sub, body, o = {}) {
  return Panel(
    [
      Row({ name: 'Tile Head', width: 'fill_container', justifyContent: 'space_between' }, [
        Col({ gap: 2 }, [Tx('H4', title), sub && Tx('Muted', sub)]),
        o.all !== false && Tx('Link', 'Show all'),
      ]),
      ...body,
    ],
    { width: o.w ?? 'fill_container', gap: 14 },
  )
}
function profileHead(m) {
  const actions = Row({ name: 'Actions', gap: 10 }, [
    Button('Edit profile', 'outline', { icon: 'pencil' }),
    IconBtn('settings', false),
  ])
  return m
    ? Col({ name: 'Head', gap: 14, width: 'fill_container' }, [
        Row({ gap: 16 }, [
          Avatar('avatar1', 88),
          Col({ gap: 4, width: 'fill_container' }, [
            Tx('Caption', 'Profile'),
            Tx('H2', 'Maya'),
            Tx('Muted', 'Night-bus playlists and too many synth records.'),
          ]),
        ]),
        actions,
      ])
    : R(
        'Profile Header',
        {},
        {
          avatar: { fill: img(ART.avatar1) },
          name: { content: 'Maya' },
          sub: { content: 'Night-bus playlists and too many synth records.' },
          action: L({ name: 'Action' }, [actions]),
        },
      )
}
function profileTiles(m) {
  const artists = profileTile('Top artists this month', 'Only visible to you', [
    Row(
      { name: 'Artists', gap: m ? 10 : 16 },
      ARTISTS.slice(0, m ? 3 : 5).map(([a, art]) => ArtistCard(a, 'Artist', art, m ? 106 : 148)),
    ),
  ])
  const tracks = profileTile(
    'Top tracks this month',
    'Only visible to you',
    m ? mrows(TRACKS.slice(0, 4)) : [TrackTable(TRACKS.slice(0, 4), { playing: -1 })],
  )
  const lists = profileTile('Your playlists', null, [
    Row(
      { name: 'Playlists', gap: m ? 10 : 16 },
      [
        ['Night Drive', 'Public playlist', 'night'],
        ['Afterglow Sessions', 'Public playlist', 'afterglow'],
        ['Focus', 'Private playlist', 'static'],
        !m && ['Rain Drive', 'Public playlist', 'drift'],
      ]
        .filter(Boolean)
        .slice(0, m ? 2 : 4)
        .map(([t, sub, art]) => PlaylistCard(t, sub, art, m ? 164 : 150)),
    ),
  ])
  const fArtists = profileTile(
    'Following artists',
    'Artists you follow',
    ARTISTS.slice(0, 4).map(([a, art]) => MobileTrack(a, 'Artist', art)),
    { w: m ? 'fill_container' : 340 },
  )
  const fPeople = profileTile(
    'Following',
    null,
    [
      Row(
        { name: 'People', gap: 12 },
        [
          ['Jonah', 'avatar2'],
          ['Ana', 'avatar3'],
          ['Theo', 'avatar4'],
        ].map(([n, a]) => Col({ gap: 6, alignItems: 'center' }, [Avatar(a, 64), Tx('Caption', n)])),
      ),
    ],
    { w: m ? 'fill_container' : 340 },
  )
  return { artists, tracks, lists, fArtists, fPeople }
}
function profileDesktop(name) {
  const t = profileTiles(false)
  return Desktop(
    name,
    [
      profileHead(false),
      Row({ name: 'Bento', width: 'fill_container', gap: 20, alignItems: 'start' }, [
        Col({ name: 'Main', width: 'fill_container', gap: 20 }, [t.artists, t.tracks, t.lists]),
        Col({ name: 'Side', width: 340, gap: 20 }, [t.fArtists, t.fPeople]),
      ]),
    ],
    { library: false, height: 1640 },
  )
}
function profileMobile(name) {
  const t = profileTiles(true)
  return Mobile(name, [profileHead(true), t.artists, t.tracks, t.lists, t.fArtists, t.fPeople], {
    header: MHeader('Profile', { back: false, actions: ['settings'] }),
    height: 2600,
  })
}

export const artistProfilePages = {
  artist: {
    extraStates: [...CONTEXT_STATES.artist, ...APP_STATES.artist],
    title: 'Artist',
    route: '/main/artist/[id]',
    context: 'Public artist page: popular, discography, related, about.',
    desktop: () =>
      Desktop(
        'Artist',
        [
          R('Artist Hero', {}, { name: { content: 'Luma Vale' } }),
          Row({ gap: 18 }, [
            Play(),
            Ic('shuffle', 'Muted', 26),
            Button('Follow', 'outline'),
            Ic('ellipsis', 'Muted', 26),
          ]),
          Row({ width: 'fill_container', gap: 32, alignItems: 'start' }, [
            Col({ width: 'fill_container', gap: 8 }, [
              Tx('H3', 'Popular'),
              songs(TRACKS.slice(0, 4)),
              Tx('Link', 'See more'),
            ]),
            Col({ width: 440, gap: 12 }, [
              Tx('H3', 'Discography'),
              Chips(['Popular releases', 'Albums', 'Singles and EPs']),
              CardRow([
                AlbumCard('Afterglow', '2026 · Album', 'afterglow', 130),
                AlbumCard('Night Signal', '2025 · Single', 'night', 130),
                AlbumCard('Low Orbit', '2024 · EP', 'static', 130),
              ]),
            ]),
          ]),
        ],
        { library: false },
      ),
    mobile: () =>
      Mobile(
        'Artist',
        [
          R('Artist Hero/Mobile', { width: 'fill_container' }, { name: { content: 'Luma Vale' } }),
          Row({ width: 'fill_container', gap: 14 }, [
            Button('Follow', 'outline'),
            Ic('ellipsis'),
            Spacer(),
            Ic('shuffle'),
            Play(true),
          ]),
          Tx('H4', 'Popular'),
          ...TRACKS.slice(0, 4).map((t) => MobileTrack(t[0], 'Released 2026', t[4])),
        ],
        { header: MHeader('') },
      ),
    states: [
      state(
        'More sections',
        () =>
          Desktop(
            'More',
            [
              Tx('H3', 'Featuring Luma Vale'),
              CardRow([
                PlaylistCard('This Is Luma Vale', 'The essential tracks', 'luma', 180),
                PlaylistCard('Luma Vale Radio', 'With Mira Sol, Kite Harbor', 'night', 180),
              ]),
              Tx('H3', 'Fans also like'),
              artistRow(4),
              Tx('H3', 'About'),
              Panel(
                [
                  Tx('Paragraph', 'Luma Vale writes late-night synth pop with spacious vocals.', {
                    wrap: true,
                  }),
                  Tx('Link', 'Show more'),
                ],
                { width: 720 },
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'More',
            [
              Tx('H4', 'Fans also like'),
              Row(
                { gap: 12 },
                ARTISTS.slice(0, 2).map(([a, art]) => ArtistCard(a, 'Artist', art, 171)),
              ),
              Tx('H4', 'About'),
              Panel([
                Tx('Paragraph', 'Luma Vale writes late-night synth pop with spacious vocals.', {
                  wrap: true,
                }),
              ]),
            ],
            { header: MHeader('Luma Vale') },
          ),
      ),
      state(
        'No music yet',
        () =>
          Desktop(
            'No music',
            [
              R('Artist Hero', {}, { name: { content: 'Luma Vale' } }),
              EmptyState(
                'This artist has no published music yet.',
                'Follow them to hear about their first release.',
                'Follow →',
                'mic-vocal',
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'No music',
            [
              EmptyState(
                'This artist has no published music yet.',
                'Follow them to hear about their first release.',
                'Follow →',
                'mic-vocal',
              ),
            ],
            { header: MHeader('Luma Vale') },
          ),
      ),
      ...std('Artist', {
        loading: 'collection',
        error: ['The catalogue could not be loaded right now.', 'Try again in a moment.'],
        notFound: [
          'Artist not found',
          "We couldn't find this artist. They may have been removed, or the link is incorrect.",
          'Back to home →',
          'mic-vocal',
        ],
        desktopOpts: { library: false },
      }),
    ],
  },
  profile: {
    title: 'Profile',
    route: '/main/profile',
    context:
      "The listener's own profile as bento tiles (top artists, top tracks, playlists, following). Edit profile opens Settings › Profile details, where username, bio and avatar are edited.",
    desktop: () => profileDesktop('Profile'),
    mobile: () => profileMobile('Profile'),
    states: [
      state(
        'Empty',
        () =>
          Desktop(
            'Empty',
            [
              R(
                'Profile Header',
                {},
                { name: { content: 'Maya' }, sub: { content: 'New listener' } },
              ),
              EmptyState(
                'No artists yet.',
                'Your top artists this month will appear as you listen.',
                'Find something to play →',
                'user-round',
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Empty',
            [
              EmptyState(
                'No artists yet.',
                'Your top artists this month will appear as you listen.',
                'Find something to play →',
                'user-round',
              ),
            ],
            { header: MHeader('Profile', { back: false }) },
          ),
      ),
      state(
        'Signed out',
        () =>
          Desktop(
            'Signed out',
            [
              EmptyState(
                'Sign in to view your profile.',
                'Log in to see your top artists, tracks and playlists.',
                'Log in →',
                'log-in',
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Signed out',
            [
              EmptyState(
                'Sign in to view your profile.',
                'Log in to see your top artists, tracks and playlists.',
                'Log in →',
                'log-in',
              ),
            ],
            { mini: false, header: MHeader('Profile', { back: false }) },
          ),
      ),
      ...std('Profile', {
        loading: 'profile',
        error: ['Profile could not be loaded', 'Something went wrong on our side. Try again.'],
        desktopOpts: { library: false },
      }),
    ],
  },
  user: {
    title: 'User',
    route: '/main/user/[id]',
    context: "Another listener's public profile.",
    desktop: () =>
      Desktop(
        'User',
        [
          R(
            'Profile Header',
            {},
            {
              avatar: {
                fill: {
                  type: 'image',
                  url: '../design-system/assets/avatars/avatar2.jpg',
                  mode: 'cover',
                },
              },
              name: { content: 'Jonah' },
              sub: { content: 'Collector of B-sides.' },
              action: L({ name: 'Action' }, [Button('Follow', 'outline')]),
            },
          ),
          SectionHeader('Public playlists'),
          CardRow([
            PlaylistCard('B-sides Forever', 'Public playlist', 'static'),
            PlaylistCard('Rain Drive', 'Public playlist', 'drift'),
            PlaylistCard('Choir Nights', 'Public playlist', 'echoes'),
          ]),
        ],
        { library: false },
      ),
    mobile: () =>
      Mobile(
        'User',
        [
          Row({ gap: 16 }, [
            Avatar('avatar2', 88),
            Col({ gap: 4 }, [Tx('Caption', 'Profile'), Tx('H2', 'Jonah')]),
          ]),
          Button('Follow', 'outline'),
          Tx('H4', 'Public playlists'),
          ...[
            ['B-sides Forever', 'static'],
            ['Rain Drive', 'drift'],
            ['Choir Nights', 'echoes'],
          ].map(([t, a]) => MobileTrack(t, 'Public playlist', a)),
        ],
        { header: MHeader('') },
      ),
    states: [
      state(
        'No playlists',
        () =>
          Desktop(
            'No playlists',
            [
              R(
                'Profile Header',
                {},
                { name: { content: 'Jonah' }, sub: { content: 'Collector of B-sides.' } },
              ),
              EmptyState('No public playlists yet.', null, null, 'list-music'),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'No playlists',
            [EmptyState('No public playlists yet.', null, null, 'list-music')],
            { header: MHeader('Jonah') },
          ),
      ),
      ...std('User', {
        loading: 'grid',
        error: [
          'Playlists could not be loaded. Try again later.',
          'Something went wrong on our side.',
        ],
        notFound: [
          'User not found',
          'This profile is unavailable or no longer exists.',
          'Back to home →',
          'user-x',
        ],
        desktopOpts: { library: false },
      }),
    ],
  },
}
