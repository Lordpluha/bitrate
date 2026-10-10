// Friends flow — list with online status, search & add, requests. Concept; composed only from library instances.
import { id, img } from './kit.mjs'
import {
  R,
  Row,
  Col,
  Tx,
  Chips,
  IconBtn,
  Concept,
  ErrorState,
  EmptyState,
  OfflineState,
  Skeleton,
  Panel,
  Menu,
  SectionHeader,
  Desktop,
  Mobile,
  MHeader,
  state,
  Button,
  Input,
  Select,
  Switch,
  Badge,
  Tab,
  Alert,
  C,
  ART,
} from './ui.mjs'

/* people (demo data); presence is visible to friends only */
const FRIENDS = [
  ['Maya Rivers', 'avatar1', 'Listening', 'Listening to Afterglow · Nova & the Static'],
  ['Jonah Pike', 'avatar2', 'Online', 'Online'],
  ['Ana Sol', 'avatar3', 'Online', 'Online'],
  ['Theo Lark', 'avatar4', 'Away', 'Away · 12 min'],
  ['Iris Hale', 'avatar1', 'Offline', 'Last seen 2 h ago'],
  ['Remy Cole', 'avatar4', 'Offline', 'Last seen yesterday'],
]
const ONLINE = FRIENDS.filter((f) => f[2] !== 'Offline')
const OFFLINE = FRIENDS.filter((f) => f[2] === 'Offline')

const slotOf = (children, name = 'Actions') => ({
  type: 'frame',
  id: id(),
  name,
  gap: 6,
  alignItems: 'center',
  children: children.filter(Boolean),
})
const friendActions = (presence, mobile) =>
  presence === 'Listening'
    ? [
        mobile ? IconBtn('headphones') : Button('Listen along', 'outline', { icon: 'headphones' }),
        IconBtn('ellipsis'),
      ]
    : [IconBtn('ellipsis')]
const friendRow = ([name, art, presence, status], mobile, actions) =>
  R(
    `Friend Row/${presence}`,
    {},
    {
      avatar: { fill: img(ART[art]) },
      name: { content: name },
      status: { content: status },
      actions: slotOf(actions ?? friendActions(presence, mobile)),
    },
  )
const tile = ([name, art, presence]) =>
  R(
    `Friend Tile/${presence}`,
    {},
    { avatar: { fill: img(ART[art]) }, name: { content: name.split(' ')[0] } },
  )
const person = (name, art, meta, actions) =>
  R(
    'People Row',
    {},
    {
      avatar: { fill: img(ART[art]) },
      name: { content: name },
      meta: { content: meta },
      actions: slotOf(actions),
    },
  )
const title = (t, right) =>
  Row({ name: 'Page Title', width: 'fill_container', justifyContent: 'space_between' }, [
    Row({ gap: 10 }, [Tx('H1', t), Concept()]),
    right,
  ])
const tabs = (items, active) =>
  Row(
    { name: 'Tabs', gap: 4 },
    items.map((t, i) => Tab(t, i === active)),
  )
const privacyNote = () =>
  R(
    'Note',
    { width: 'fill_container' },
    {
      text: {
        content:
          'Only friends see your online status and what you are playing. Change it in Privacy.',
      },
    },
  )
const onlineStrip = (n) =>
  Col({ name: 'Online Now', gap: 12, width: 'fill_container' }, [
    SectionHeader(`Online now · ${ONLINE.length}`, null),
    Row({ name: 'Tiles', gap: 12 }, ONLINE.slice(0, n).map(tile)),
  ])
const list = (mobile, { offline = true } = {}) => [
  SectionHeader(`Online · ${ONLINE.length}`, null),
  Col(
    { name: 'Online', gap: 0, width: 'fill_container' },
    ONLINE.map((f) => friendRow(f, mobile)),
  ),
  offline && SectionHeader(`Offline · ${OFFLINE.length}`, null),
  offline &&
    Col(
      { name: 'Offline', gap: 0, width: 'fill_container' },
      OFFLINE.map((f) => friendRow(f, mobile)),
    ),
]
const findBtn = (m) => (m ? null : Button('Find friends', 'default', { icon: 'user-plus' }))
const D = (name, content, o) => Desktop(name, content, { nowPlaying: true, ...o })
const M = (name, content, header) => Mobile(name, content, { tab: 'library', header })
const scrim = (name, w, h, panel) => ({
  type: 'frame',
  id: id(),
  name,
  width: w,
  height: h,
  layout: 'vertical',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 16,
  fill: C.scrim,
  children: [panel],
})

/* ---------------- /friends ---------------- */
const removeDialog = (w) =>
  Panel(
    [
      Tx('H3', 'Remove Theo Lark?'),
      Tx(
        'Paragraph',
        'You will stop seeing each other’s online status and listening. Theo is not notified.',
        { wrap: true },
      ),
      Row({ width: 'fill_container', justifyContent: 'end', gap: 8 }, [
        Button('Cancel', 'outline'),
        Button('Remove friend', 'destructive'),
      ]),
    ],
    { width: w },
  )
const privacyPanel = (w) =>
  Panel(
    [
      Tx('H3', 'Online status'),
      Tx(
        'Paragraph',
        'Choose what your friends see. People who are not your friends never see your status.',
        { wrap: true },
      ),
      Switch('Show when I am online', true),
      Switch('Show what I am listening to', true),
      Select('Who can see it', 'All friends'),
      Row({ width: 'fill_container', justifyContent: 'end', gap: 8 }, [Button('Done', 'default')]),
    ],
    { width: w },
  )

export const friends = {
  title: 'Friends',
  route: 'concept — /friends (roadmap "Friend Profiles", "Listening Rooms")',
  context:
    'Friends with live presence: online, listening (with track), away, offline with last seen. Presence is shown to friends only and can be hidden in Privacy. Concept.',
  desktop: () =>
    D('Friends', [
      title('Friends', findBtn(false)),
      tabs(['All · 6', 'Online · 4', 'Requests · 2'], 0),
      onlineStrip(4),
      Col({ name: 'List', gap: 12, width: 760 }, list(false)),
    ]),
  mobile: () =>
    M(
      'Friends',
      [Chips(['All', 'Online', 'Requests · 2']), onlineStrip(4), ...list(true)],
      MHeader('Friends', { back: false, actions: ['user-plus'] }),
    ),
  states: [
    state(
      'Online filter',
      () =>
        D('Online filter', [
          title('Friends', findBtn(false)),
          tabs(['All · 6', 'Online · 4', 'Requests · 2'], 1),
          Col({ name: 'List', gap: 12, width: 760 }, [
            ...list(false, { offline: false }),
            privacyNote(),
          ]),
        ]),
      () =>
        M(
          'Online filter',
          [
            Chips(['All', 'Online', 'Requests · 2'], 1),
            ...list(true, { offline: false }),
            privacyNote(),
          ],
          MHeader('Friends', { back: false, actions: ['user-plus'] }),
        ),
    ),
    state(
      'Nobody online',
      () =>
        D('Nobody online', [
          title('Friends', findBtn(false)),
          tabs(['All · 6', 'Online · 0', 'Requests · 2'], 1),
          EmptyState(
            'Nobody is online right now',
            'When a friend comes online, they appear here first.',
            null,
            'moon',
          ),
        ]),
      () =>
        M(
          'Nobody online',
          [
            Chips(['All', 'Online', 'Requests · 2'], 1),
            EmptyState(
              'Nobody is online right now',
              'When a friend comes online, they appear here first.',
              null,
              'moon',
            ),
          ],
          MHeader('Friends', { back: false, actions: ['user-plus'] }),
        ),
    ),
    state(
      'No friends yet',
      () =>
        D('No friends', [
          title('Friends', findBtn(false)),
          EmptyState(
            'No friends yet',
            'Add people you know to see when they are online and what they are playing.',
            'Find friends',
            'users',
          ),
        ]),
      () =>
        M(
          'No friends',
          [
            EmptyState(
              'No friends yet',
              'Add people you know to see when they are online and what they are playing.',
              'Find friends',
              'users',
            ),
          ],
          MHeader('Friends', { back: false, actions: ['user-plus'] }),
        ),
    ),
    state(
      'Friend menu',
      () =>
        D('Friend menu', [
          title('Friends', findBtn(false)),
          Row({ name: 'Row + Menu', gap: 16, alignItems: 'start', width: 'fill_container' }, [
            Col(
              { name: 'List', gap: 0, width: 760 },
              ONLINE.map((f) => friendRow(f, false)),
            ),
            Menu([
              ['View profile'],
              ['Listen along', 'disabled'],
              ['Hide my status from Theo'],
              ['Remove friend', 'destructive'],
            ]),
          ]),
        ]),
      () =>
        M(
          'Friend menu',
          [
            friendRow(ONLINE[3], true),
            R(
              'Surface/Sheet',
              { width: 'fill_container' },
              {
                content: {
                  type: 'frame',
                  id: id(),
                  name: 'Sheet Content',
                  layout: 'vertical',
                  gap: 4,
                  width: 'fill_container',
                  children: [
                    Menu([
                      ['View profile'],
                      ['Hide my status from Theo'],
                      ['Remove friend', 'destructive'],
                    ]),
                  ],
                },
              },
            ),
          ],
          MHeader('Friends', { back: false }),
        ),
    ),
    state(
      'Remove friend',
      () => scrim('Remove friend', 1440, 900, removeDialog(420)),
      () => scrim('Remove friend', 390, 844, removeDialog('fill_container')),
    ),
    state(
      'Status privacy',
      () => scrim('Status privacy', 1440, 900, privacyPanel(440)),
      () => scrim('Status privacy', 390, 844, privacyPanel('fill_container')),
    ),
    state(
      'Loading',
      () => D('Loading', [title('Friends', findBtn(false)), Skeleton('people')]),
      () => M('Loading', [Skeleton('people', true)], MHeader('Friends', { back: false })),
    ),
    state(
      'Error',
      () =>
        D('Error', [
          title('Friends', findBtn(false)),
          ErrorState('Friends are unavailable right now', 'Try again in a moment.'),
        ]),
      () =>
        M(
          'Error',
          [ErrorState('Friends are unavailable right now', 'Try again in a moment.')],
          MHeader('Friends', { back: false }),
        ),
    ),
    state(
      'Offline',
      () =>
        D('Offline', [
          title('Friends', null),
          OfflineState('You are offline', 'Online status updates when you reconnect.', 'Try again'),
        ]),
      () =>
        M(
          'Offline',
          [
            OfflineState(
              'You are offline',
              'Online status updates when you reconnect.',
              'Try again',
            ),
          ],
          MHeader('Friends', { back: false }),
        ),
    ),
  ],
}

/* ---------------- /friends/find ---------------- */
const RESULTS = [
  ['Maya Rivers', 'avatar1', '@mayarivers · 4 mutual friends', 'add'],
  ['Maya Chen', 'avatar3', '@mchen · Similar taste: Dream pop', 'requested'],
  ['Mayan Echo', 'avatar1', '@mayanecho · 1 mutual friend', 'incoming'],
  ['Maya Ortiz', 'avatar1', '@maya.o · Friends', 'friends'],
]
const SUGGESTED = [
  ['Lena Voss', 'avatar3', '6 mutual friends'],
  ['Kai Moreno', 'avatar2', 'Also follows Luma Vale'],
  ['Noor Aziz', 'avatar3', 'Similar taste: Ambient'],
]
const resultAction = (kind, m) =>
  ({
    add: [Button(m ? 'Add' : 'Add friend', 'default', { icon: 'user-plus' })],
    sent: [Button('Requested', 'outline', { icon: 'clock' })],
    requested: [Button('Requested', 'outline', { icon: 'clock' })],
    incoming: [Button('Accept', 'default'), !m && Button('Decline', 'ghost')],
    friends: [Badge('Friends', 'secondary')],
  })[kind]
const results = (m, sent) =>
  Col(
    { name: 'Results', gap: 0, width: 'fill_container' },
    RESULTS.map(([n, a, meta, kind], i) =>
      person(n, a, meta, resultAction(sent && i === 0 ? 'sent' : kind, m)),
    ),
  )
const suggested = (m) =>
  Col({ name: 'Suggested', gap: 8, width: 'fill_container' }, [
    SectionHeader('People you may know', null),
    ...SUGGESTED.map(([n, a, meta]) => person(n, a, meta, resultAction('add', m))),
  ])
const invite = () =>
  Panel([
    Tx('H4', 'Invite by link'),
    Tx('Muted', 'Anyone with the link can send you a friend request.'),
    Input(null, 'bitrate.app/invite/you-4f2k'),
    Button('Copy link', 'outline', { icon: 'copy', width: 'fill_container' }),
  ])
const search = (q) => Input(null, q ?? 'Search by name or @username')
const findD = (name, main, side = [suggested(false), invite()]) =>
  D(name, [
    title('Find friends', null),
    Row({ name: 'Columns', gap: 32, alignItems: 'start', width: 'fill_container' }, [
      Col({ name: 'Search', gap: 16, width: 'fill_container' }, [search(main.q), ...main.body]),
      Col({ name: 'Side', gap: 20, width: 360 }, side),
    ]),
  ])
const findM = (name, q, body) => M(name, [search(q), ...body], MHeader('Find friends'))

export const friendsFind = {
  title: 'Find friends',
  route: 'concept — /friends/find',
  context:
    'Search people by name or @username, add, accept incoming, see sent requests; suggestions and invite link. Strangers never see presence. Concept.',
  desktop: () =>
    findD('Find friends', {
      q: 'maya',
      body: [Tx('Muted', '4 people for “maya”'), results(false)],
    }),
  mobile: () => findM('Find friends', 'maya', [Tx('Muted', '4 people for “maya”'), results(true)]),
  states: [
    state(
      'Before search',
      () => findD('Before search', { body: [suggested(false)] }, [invite()]),
      () => findM('Before search', null, [suggested(true), invite()]),
    ),
    state(
      'Request sent',
      () =>
        findD('Request sent', {
          q: 'maya',
          body: [
            Alert('Friend request sent', 'Maya Rivers will see it in their requests.'),
            results(false, true),
          ],
        }),
      () =>
        findM('Request sent', 'maya', [
          Alert('Friend request sent', 'Maya Rivers will see it in their requests.'),
          results(true, true),
        ]),
    ),
    state(
      'No results',
      () =>
        findD('No results', {
          q: 'mayaa',
          body: [
            EmptyState(
              'No one found for “mayaa”',
              'Check the spelling, or share your invite link instead.',
              'Copy invite link',
              'search',
            ),
          ],
        }),
      () =>
        findM('No results', 'mayaa', [
          EmptyState(
            'No one found for “mayaa”',
            'Check the spelling, or share your invite link instead.',
            'Copy invite link',
            'search',
          ),
        ]),
    ),
    state(
      'Searching',
      () => findD('Searching', { q: 'maya', body: [Skeleton('people')] }),
      () => findM('Searching', 'maya', [Skeleton('people', true)]),
    ),
    state(
      'Error',
      () =>
        findD('Error', {
          q: 'maya',
          body: [ErrorState('Search is unavailable right now', 'Try again in a moment.')],
        }),
      () =>
        findM('Error', 'maya', [
          ErrorState('Search is unavailable right now', 'Try again in a moment.'),
        ]),
    ),
  ],
}

/* ---------------- /friends/requests ---------------- */
const RECEIVED = [
  ['Mayan Echo', 'avatar1', '1 mutual friend · 2 h ago'],
  ['Lena Voss', 'avatar3', '6 mutual friends · Yesterday'],
]
const SENT = [['Maya Chen', 'avatar3', 'Sent 3 days ago']]
const received = (m) =>
  Col(
    { name: 'Received', gap: 0, width: 'fill_container' },
    RECEIVED.map(([n, a, meta]) =>
      person(n, a, meta, [
        Button('Accept', 'default'),
        m ? IconBtn('x') : Button('Decline', 'outline'),
      ]),
    ),
  )
const reqD = (name, active, body) =>
  D(name, [
    title('Friend requests', null),
    tabs(['Received · 2', 'Sent · 1'], active),
    Col({ name: 'List', gap: 16, width: 760 }, body),
  ])
const reqM = (name, active, body) =>
  M(name, [Chips(['Received · 2', 'Sent · 1'], active), ...body], MHeader('Requests'))

export const friendsRequests = {
  title: 'Friend requests',
  route: 'concept — /friends/requests',
  context:
    'Received requests to accept or decline, sent requests to cancel; accepting reveals presence. Concept.',
  desktop: () => reqD('Requests', 0, [received(false)]),
  mobile: () => reqM('Requests', 0, [received(true)]),
  states: [
    state(
      'Sent',
      () =>
        reqD('Sent', 1, [
          Col(
            { name: 'Sent', gap: 0, width: 'fill_container' },
            SENT.map(([n, a, meta]) => person(n, a, meta, [Button('Cancel request', 'ghost')])),
          ),
        ]),
      () =>
        reqM(
          'Sent',
          1,
          SENT.map(([n, a, meta]) => person(n, a, meta, [Button('Cancel', 'ghost')])),
        ),
    ),
    state(
      'Accepted',
      () =>
        reqD('Accepted', 0, [
          Alert('You and Mayan Echo are now friends', 'You can see each other’s online status.'),
          friendRow(['Mayan Echo', 'avatar1', 'Online', 'Online'], false, [
            Badge('New friend', 'default'),
          ]),
          person('Lena Voss', 'avatar3', '6 mutual friends · Yesterday', [
            Button('Accept', 'default'),
            Button('Decline', 'outline'),
          ]),
        ]),
      () =>
        reqM('Accepted', 0, [
          Alert('You and Mayan Echo are now friends', 'You can see each other’s online status.'),
          friendRow(['Mayan Echo', 'avatar1', 'Online', 'Online'], true, [Badge('New', 'default')]),
        ]),
    ),
    state(
      'No requests',
      () =>
        reqD('No requests', 0, [
          EmptyState(
            'No friend requests',
            'When someone adds you, you can accept it here.',
            'Find friends',
            'user-plus',
          ),
        ]),
      () =>
        reqM('No requests', 0, [
          EmptyState(
            'No friend requests',
            'When someone adds you, you can accept it here.',
            'Find friends',
            'user-plus',
          ),
        ]),
    ),
    state(
      'Loading',
      () => reqD('Loading', 0, [Skeleton('people')]),
      () => reqM('Loading', 0, [Skeleton('people', true)]),
    ),
    state(
      'Error',
      () =>
        reqD('Error', 0, [
          ErrorState('Requests are unavailable right now', 'Try again in a moment.'),
        ]),
      () =>
        reqM('Error', 0, [
          ErrorState('Requests are unavailable right now', 'Try again in a moment.'),
        ]),
    ),
  ],
}
