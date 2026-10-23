// Web-player page specs: library.
import { TRACKS } from '../../kit.mjs'
import {
  Badge,
  BigCover,
  Button,
  Chips,
  Col,
  CollectionHeader,
  Desktop,
  EmptyState,
  ErrorState,
  Ic,
  Input,
  L,
  MHeader,
  Menu,
  Mobile,
  MobileTrack,
  Panel,
  Play,
  R,
  Row,
  Select,
  Spacer,
  Switch,
  TrackTable,
  Tx,
  state,
} from '../../ui.mjs'
import { CONTEXT_STATES } from '../../pages-context-menu.mjs'
import {
  T5,
  mrows,
  pageTitle,
  std,
  libHead,
  libTabs,
  LIB_ITEMS,
  cardGrid,
  libMobileHeader,
} from './shared.mjs'

const bar = ({ like, invite, download = true } = {}) =>
  R(
    'Action Bar',
    {},
    {
      like: like ? undefined : { enabled: false },
      invite: invite ? undefined : { enabled: false },
      download: download ? undefined : { enabled: false },
    },
  )
const mobileHero = (art, t, sub) => [
  Row({ name: 'Cover Area', width: 'fill_container', justifyContent: 'center' }, [
    art === 'liked' ? R('Media/Liked Cover', { width: 220, height: 220 }) : BigCover(art, 220),
  ]),
  Col({ gap: 4, width: 'fill_container' }, [Tx('H2', t, { wrap: true }), Tx('Muted', sub)]),
  Row({ width: 'fill_container', gap: 18 }, [
    Ic('heart'),
    Ic('circle-arrow-down'),
    Ic('ellipsis'),
    Spacer(),
    Ic('shuffle'),
    Play(true),
  ]),
]

export const libraryPages = {
  library: {
    title: 'Library',
    route: '/main/library (?create=playlist)',
    context: 'Saved collection: tabs, filter, sort; inline create form.',
    desktop: () =>
      Desktop(
        'Library',
        [
          libHead(),
          libTabs(),
          Row({ width: 'fill_container', gap: 12 }, [
            Input(null, 'Filter your library', 320),
            Spacer(),
            Select(null, 'Recents', 180),
          ]),
          cardGrid(LIB_ITEMS),
        ],
        { library: false },
      ),
    mobile: () =>
      Mobile(
        'Library',
        [
          /* Jam is a Library filter; the row scrolls sideways when it overflows */
          L({ name: 'Filter Scroller', width: 374, clip: true }, [
            Chips(['Playlists', 'Jam · 2', 'Liked tracks', 'Albums', 'History']),
          ]),
          Row({ name: 'Live Head', width: 'fill_container', justifyContent: 'space_between' }, [
            Tx('H4', 'Live now'),
            Tx('Link', 'All Jams'),
          ]),
          R('Jam/Card', { width: 'fill_container' }),
          Row({ width: 'fill_container', justifyContent: 'space_between' }, [
            Row({ gap: 6 }, [Ic('arrow-down-up', 'Foreground', 16), Tx('Body Strong', 'Recents')]),
            Ic('layout-grid'),
          ]),
          ...LIB_ITEMS.slice(0, 4).map(([t, m, a]) => MobileTrack(t, m, a)),
        ],
        { tab: 'library', header: libMobileHeader() },
      ),
    states: [
      state(
        'Create playlist',
        () =>
          Desktop(
            'Create',
            [
              libHead(),
              libTabs(),
              Panel(
                [
                  Tx('H4', 'New playlist'),
                  Input('Playlist title', 'My playlist #4'),
                  Input('Description', 'Add an optional description'),
                  Switch('Public playlist', true),
                  Row({ gap: 10 }, [Button('Create', 'default'), Button('Cancel', 'ghost')]),
                ],
                { width: 560 },
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Create',
            [
              Tx('H3', 'New playlist'),
              Input('Playlist title', 'My playlist #4'),
              Input('Description', 'Add an optional description'),
              Switch('Public playlist', true),
              Button('Create', 'large-default', { width: 'fill_container' }),
              Button('Cancel', 'large-outline', { width: 'fill_container' }),
            ],
            { tab: 'create', mini: false, header: MHeader('Create playlist') },
          ),
      ),
      state(
        'Create menu',
        () =>
          Desktop(
            'Create menu',
            [
              libHead(),
              Row({ width: 'fill_container', justifyContent: 'end' }, [
                Menu([
                  ['Playlist — Create a playlist with songs or episodes'],
                  ["Blend — Combine your friends' tastes into a playlist", 'disabled'],
                  ['Folder — Organize your playlists', 'disabled'],
                ]),
              ]),
              libTabs(),
              cardGrid(LIB_ITEMS.slice(0, 5)),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Create menu',
            [Menu([['Playlist'], ['Blend', 'disabled'], ['Folder', 'disabled']])],
            { tab: 'create', header: libMobileHeader() },
          ),
      ),
      state(
        'Empty',
        () =>
          Desktop(
            'Empty',
            [
              libHead(),
              libTabs(),
              EmptyState(
                'Nothing here yet.',
                'Playlists you create and albums you save will show up here.',
                'Create playlist →',
                'library-big',
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Empty',
            [
              EmptyState(
                'Nothing here yet.',
                'Playlists you create and albums you save will show up here.',
                'Create playlist →',
                'library-big',
              ),
            ],
            { tab: 'library', header: libMobileHeader() },
          ),
      ),
      ...std('Library', {
        loading: 'grid',
        error: ['Your library could not be loaded', 'Something went wrong on our side. Try again.'],
        desktopOpts: { library: false },
        mobileOpts: { tab: 'library', header: libMobileHeader() },
      }),
    ],
  },
  'liked-songs': {
    more: ['track', '50 of 128'],
    title: 'Liked Songs',
    route: '/main/liked-songs',
    context: 'Liked tracks presented as a playlist.',
    desktop: () =>
      Desktop('Liked', [
        CollectionHeader({
          type: 'Playlist',
          title: 'Liked Songs',
          owner: 'Your Library',
          meta: '· 128 songs',
          art: 'liked',
        }),
        bar(),
        TrackTable(TRACKS.slice(0, 6)),
      ]),
    mobile: () =>
      Mobile(
        'Liked',
        [...mobileHero('liked', 'Liked Songs', 'Your Library · 128 songs'), ...mrows(T5)],
        { tab: 'library', header: MHeader('') },
      ),
    states: [
      state(
        'Empty',
        () =>
          Desktop('Liked empty', [
            CollectionHeader({
              type: 'Playlist',
              title: 'Liked Songs',
              owner: 'Your Library',
              meta: '· 0 songs',
              art: 'liked',
            }),
            EmptyState(
              'No liked tracks yet',
              "You haven't liked any songs yet. Start exploring and like your favorite tracks!",
              'Find something to play →',
              'heart',
            ),
          ]),
        () =>
          Mobile(
            'Liked empty',
            [
              EmptyState(
                'No liked tracks yet',
                "You haven't liked any songs yet. Start exploring and like your favorite tracks!",
                'Find something to play →',
                'heart',
              ),
            ],
            { tab: 'library', header: MHeader('Liked Songs') },
          ),
      ),
      ...std('Liked', {
        loading: 'collection',
        error: ['Liked songs could not be loaded', 'Something went wrong on our side. Try again.'],
        notFound: [
          'No liked songs found',
          "You haven't liked any songs yet. Start exploring and like your favorite tracks!",
          'Back to home →',
          'heart',
        ],
        mobileOpts: { tab: 'library', header: MHeader('') },
      }),
    ],
  },
  playlist: {
    more: ['track', '20 of 24'],
    extraStates: CONTEXT_STATES.playlist,
    title: 'Playlist',
    route: '/main/playlist/[id]',
    context: 'Playlist detail with owner actions, finder, menus and error states.',
    desktop: () =>
      Desktop('Playlist', [
        CollectionHeader({
          type: 'Public playlist',
          title: 'Night Drive',
          owner: 'Maya',
          meta: '· 24 songs, 1 h 32 min',
          art: 'night',
        }),
        Row({ gap: 18 }, [bar({ invite: true }), Badge('Mix', 'outline')]),
        TrackTable(T5),
      ]),
    mobile: () =>
      Mobile('Playlist', [...mobileHero('night', 'Night Drive', 'Maya · 24 songs'), ...mrows(T5)], {
        tab: 'library',
        header: MHeader(''),
      }),
    states: [
      state(
        'Find songs',
        () =>
          Desktop('Finder', [
            CollectionHeader({
              type: 'Public playlist',
              title: 'Night Drive',
              owner: 'Maya',
              meta: '· 0 songs',
              art: 'night',
            }),
            Panel([
              Tx('H3', "Let's find something for your playlist"),
              Input(null, 'Search for songs or episodes', 420),
              ...TRACKS.slice(0, 3).map((t) =>
                Row({ width: 'fill_container', gap: 12 }, [
                  MobileTrack(t[0], t[1], t[4]),
                  Button('Add', 'outline'),
                ]),
              ),
            ]),
          ]),
        () =>
          Mobile(
            'Finder',
            [
              Tx('H3', "Let's find something for your playlist"),
              Input(null, 'Search for songs or episodes'),
              ...TRACKS.slice(0, 4).map((t) =>
                Row({ width: 'fill_container', gap: 8 }, [
                  MobileTrack(t[0], t[1], t[4]),
                  Button('Add', 'outline'),
                ]),
              ),
            ],
            { tab: 'library', header: MHeader('Night Drive') },
          ),
      ),
      CONTEXT_STATES.playlistMore,
      state(
        'Edit details',
        () =>
          Desktop('Edit', [
            CollectionHeader({
              type: 'Public playlist',
              title: 'Night Drive',
              owner: 'Maya',
              meta: '· 24 songs',
              art: 'night',
            }),
            Panel(
              [
                Tx('H4', 'Edit details'),
                Input('Title', 'Night Drive'),
                Input('Description', 'Late streets, low volume.'),
                Row({ gap: 10 }, [Button('Save', 'default'), Button('Cancel', 'ghost')]),
              ],
              { width: 560 },
            ),
          ]),
        () =>
          Mobile(
            'Edit',
            [
              Input('Title', 'Night Drive'),
              Input('Description', 'Late streets, low volume.'),
              Button('Save', 'large-default', { width: 'fill_container' }),
            ],
            { tab: 'library', mini: false, header: MHeader('Edit details') },
          ),
      ),
      state(
        'Report',
        () =>
          Desktop('Report', [
            CollectionHeader({
              type: 'Public playlist',
              title: 'Night Drive',
              owner: 'Maya',
              meta: '· 24 songs',
              art: 'night',
            }),
            Panel(
              [
                Tx('H3', 'Report playlist'),
                Select('Reason', 'Spam or misleading content', 'fill_container'),
                Row({ gap: 10 }, [Button('Send report', 'default'), Button('Cancel', 'ghost')]),
              ],
              { width: 480 },
            ),
          ]),
        () =>
          Mobile(
            'Report',
            [
              Tx('H3', 'Report playlist'),
              Select('Reason', 'Spam or misleading content'),
              Button('Send report', 'large-default', { width: 'fill_container' }),
            ],
            { tab: 'library', mini: false, header: MHeader('Report') },
          ),
      ),
      state(
        'Empty',
        () =>
          Desktop('Empty', [
            CollectionHeader({
              type: 'Public playlist',
              title: 'Night Drive',
              owner: 'Maya',
              meta: '· 0 songs',
              art: 'night',
            }),
            EmptyState(
              'No tracks in this playlist.',
              "Let's find something for your playlist.",
              'Search tracks →',
              'list-music',
            ),
          ]),
        () =>
          Mobile(
            'Empty',
            [
              EmptyState(
                'No tracks in this playlist.',
                "Let's find something for your playlist.",
                'Search tracks →',
                'list-music',
              ),
            ],
            { tab: 'library', header: MHeader('Night Drive') },
          ),
      ),
      state(
        'Private',
        () =>
          Desktop('Private', [
            ErrorState(
              'Playlist is private',
              'Only its owner and collaborators can open it.',
              'Try again →',
              'lock',
            ),
          ]),
        () =>
          Mobile(
            'Private',
            [
              ErrorState(
                'Playlist is private',
                'Only its owner and collaborators can open it.',
                'Try again →',
                'lock',
              ),
            ],
            { tab: 'library' },
          ),
      ),
      state(
        'Session expired',
        () =>
          Desktop('Expired', [
            ErrorState(
              'Your session has expired',
              'Log in again to keep listening.',
              'Log in →',
              'log-in',
            ),
          ]),
        () =>
          Mobile(
            'Expired',
            [
              ErrorState(
                'Your session has expired',
                'Log in again to keep listening.',
                'Log in →',
                'log-in',
              ),
            ],
            { tab: 'library' },
          ),
      ),
      ...std('Playlist', {
        loading: 'collection',
        error: ['Unable to load playlist', 'Something went wrong on our side. Try again.'],
        notFound: [
          'Playlist not found',
          'This playlist may have been removed, or the link is incorrect.',
          'Back to home →',
          'list-music',
        ],
        mobileOpts: { tab: 'library' },
      }),
    ],
  },
  album: {
    extraStates: CONTEXT_STATES.album,
    title: 'Album',
    route: '/main/album/[id]',
    context: 'Album hero, like, track list.',
    desktop: () =>
      Desktop('Album', [
        CollectionHeader({
          type: 'Album',
          title: 'Afterglow',
          owner: 'Nova & the Static',
          meta: '· 2026 · 9 songs, 36 min',
          art: 'afterglow',
        }),
        bar({ like: true }),
        TrackTable(
          T5.map((t) => [t[0], 'Nova & the Static', 'Afterglow', t[3], 'afterglow']),
          { added: false },
        ),
      ]),
    mobile: () =>
      Mobile(
        'Album',
        [
          ...mobileHero('afterglow', 'Afterglow', 'Album · Nova & the Static · 2026'),
          ...T5.map((t) => MobileTrack(t[0], 'Nova & the Static', 'afterglow')),
        ],
        { header: MHeader('') },
      ),
    states: [
      state(
        'Empty',
        () =>
          Desktop('Empty', [
            CollectionHeader({
              type: 'Album',
              title: 'Afterglow',
              owner: 'Nova & the Static',
              meta: '· 2026',
              art: 'afterglow',
            }),
            EmptyState(
              'No tracks in this album',
              'Tracks will appear here once they are published.',
              null,
              'disc-3',
            ),
          ]),
        () =>
          Mobile(
            'Empty',
            [
              EmptyState(
                'No tracks in this album',
                'Tracks will appear here once they are published.',
                null,
                'disc-3',
              ),
            ],
            { header: MHeader('Afterglow') },
          ),
      ),
      ...std('Album', {
        loading: 'collection',
        error: ['Album could not be loaded', 'Something went wrong on our side. Try again.'],
        notFound: [
          'Album not found.',
          'This album may have been removed, or the link is incorrect.',
          'Back to home →',
          'disc-3',
        ],
      }),
    ],
  },
  recents: {
    more: ['track', 'Loading earlier days'],
    title: 'Recents',
    route: '/main/recents',
    context: 'Listening history grouped by day.',
    desktop: () =>
      Desktop('Recents', [
        pageTitle('Recents', Button('Clear listening history', 'ghost')),
        Tx('H4', 'Today'),
        TrackTable(TRACKS.slice(0, 3), { playing: -1 }),
        Tx('H4', 'Yesterday'),
        TrackTable(TRACKS.slice(3, 5), { playing: -1 }),
        Tx('H4', '6 October'),
        TrackTable(TRACKS.slice(5, 6), { playing: -1 }),
      ]),
    mobile: () =>
      Mobile(
        'Recents',
        [
          Tx('Body Strong', 'Today'),
          ...mrows(TRACKS.slice(0, 3)),
          Tx('Body Strong', 'Yesterday'),
          ...mrows(TRACKS.slice(3, 6)),
        ],
        { header: MHeader('Recents', { actions: ['trash-2'] }) },
      ),
    states: [
      state(
        'Empty',
        () =>
          Desktop('Empty', [
            Tx('H1', 'Recents'),
            EmptyState(
              'No recent listening activity yet.',
              'Tracks you play will show up here.',
              'Find something to play →',
              'history',
            ),
          ]),
        () =>
          Mobile(
            'Empty',
            [
              EmptyState(
                'No recent listening activity yet.',
                'Tracks you play will show up here.',
                'Find something to play →',
                'history',
              ),
            ],
            { header: MHeader('Recents') },
          ),
      ),
      ...std('Recents', {
        loading: 'table',
        error: ['Recents could not be loaded', 'Something went wrong on our side. Try again.'],
      }),
    ],
  },
}
