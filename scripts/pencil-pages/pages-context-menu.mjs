// Context menus. Desktop: shadcn Context Menu — right-click (or ⇧F10 / the row's ⋯) opens a 248px menu with
// icons, shortcuts, labels, separators, checkbox items and side submenus. Mobile: shadcn Drawer — long-press
// (or ⋯) slides a bottom drawer with a media header; submenus open as the next drawer step.
import { TRACKS, id } from './kit.mjs'
import {
  R,
  L,
  Row,
  Col,
  Tx,
  Desktop,
  MHeader,
  TrackTable,
  MobileTrack,
  ArtistCard,
  state,
} from './ui.mjs'

/* desktop */
const it = (kind, label, icon, shortcut) =>
  R(
    `Context Menu/Item${kind ? ` ${kind}` : ''}`,
    {},
    {
      label: { content: label },
      icon: icon && !/Checkbox/.test(kind ?? '') ? { icon } : undefined,
      shortcut: /Sub/.test(kind ?? '')
        ? undefined
        : shortcut
          ? { content: shortcut, enabled: true }
          : { enabled: false },
    },
  )
const check = (label, on, shortcut) =>
  R(
    'Context Menu/Item Checkbox',
    {},
    {
      label: { content: label },
      checkIcon: { enabled: on },
      shortcut: shortcut ? { content: shortcut, enabled: true } : { enabled: false },
    },
  )
const label = (t) => R('Context Menu/Label', {}, { label: { content: t } })
const sep = () => R('Context Menu/Separator')
const menu = (items) =>
  R('Context Menu', {}, { items: L({ name: 'Items', layout: 'vertical', width: 240 }, items) })
const trackMenu = ({ offline = false, open = 'playlist' } = {}) =>
  menu([
    R('Context Menu/Header'),
    sep(),
    it('Active', 'Play next', 'list-start', '⇧N'),
    it(null, 'Add to queue', 'list-plus', 'Q'),
    it(open === 'playlist' ? 'Sub Open' : 'Sub', 'Add to playlist', 'list-music'),
    check('Saved to Liked Songs', true, 'L'),
    sep(),
    it(null, 'Go to artist', 'mic-vocal', '⌥A'),
    it(null, 'Go to album', 'disc-3', '⌥B'),
    it(offline ? 'Disabled' : null, 'Start a Jam', 'users-round'),
    it(open === 'connect' ? 'Sub Open' : 'Sub', 'Play on… (Bitrate Connect)', 'monitor-speaker'),
    it('Sub', 'Share', 'share-2'),
    sep(),
    it(
      offline ? null : 'Disabled',
      offline ? 'Remove download' : 'Download',
      offline ? 'circle-check' : 'download',
    ),
    it('Destructive', 'Remove from this playlist', 'trash-2', '⌫'),
  ])
const playlistSub = () =>
  menu([
    label('Add to playlist'),
    it(null, 'New playlist', 'plus', '⌘⇧N'),
    sep(),
    check('Night drive', true),
    check('Afterglow Sessions', false),
    check('Static Lines', false),
    check('Late set', false),
  ])
const connectSub = () =>
  menu([
    label('Bitrate Connect'),
    check('This computer', true),
    it(null, "Maya's iPhone", 'smartphone'),
    it(null, 'Studio speaker', 'speaker'),
    it('Disabled', 'Smart display · offline', 'tablet'),
  ])
const playlistMenu = () =>
  menu([
    label('Playlist'),
    it(null, 'Play', 'play', '↵'),
    it(null, 'Shuffle play', 'shuffle', '⇧S'),
    it(null, 'Start a Jam', 'users-round'),
    sep(),
    it(null, 'Edit details', 'pencil'),
    it(null, 'Version history', 'history'),
    check('Show on profile', true),
    check('Available offline', false),
    sep(),
    it('Sub', 'Share', 'share-2'),
    it('Destructive', 'Delete playlist', 'trash-2'),
  ])
const artistMenu = () =>
  menu([
    label('Artist'),
    it(null, 'Play artist radio', 'radio'),
    check('Following', true),
    it(null, 'Go to artist', 'mic-vocal'),
    sep(),
    it(null, "Don't play this artist", 'ban'),
    it('Sub', 'Share', 'share-2'),
  ])
/** The menu opens where the pointer was: next to the row, the submenu beside the open item. */
const desk = (name, menus, { offset = 136, lead, heading = 'Night drive' } = {}) =>
  Desktop(name, [
    Tx('H1', heading),
    Row(
      { name: 'Canvas', width: 'fill_container', gap: 12, alignItems: 'start' },
      [
        Col({ name: 'List', width: 'fill_container', gap: 12 }, [
          lead ?? TrackTable(TRACKS.slice(0, 7), { playing: -1, added: false }),
        ]),
        Col({ name: 'Menu', gap: 0, padding: [48, 0, 0, 0] }, [menus[0]]),
        menus[1] && Col({ name: 'Submenu', gap: 0, padding: [48 + offset, 0, 0, 0] }, [menus[1]]),
      ].filter(Boolean),
    ),
  ])

/* mobile */
const dw = (kind, label, icon, hint) =>
  R(
    `Drawer/Item${kind ? ` ${kind}` : ''}`,
    { width: 'fill_container' },
    {
      label: { content: label },
      icon: icon ? { icon } : undefined,
      hint: hint ? { content: hint, enabled: true } : undefined,
    },
  )
const dsep = () => R('Drawer/Separator', { width: 'fill_container' })
const drawer = (
  items,
  { header = R('Drawer/Header', { width: 'fill_container' }), footer = true } = {},
) =>
  R(
    'Drawer',
    { width: 'fill_container' },
    {
      content: L({ name: 'Drawer Content', layout: 'vertical', width: 'fill_container' }, [
        header,
        dsep(),
        ...items,
      ]),
      footer: footer ? undefined : { enabled: false },
    },
  )
const trackDrawer = ({ offline = false } = {}) =>
  drawer([
    dw(null, 'Play next', 'list-start'),
    dw(null, 'Add to queue', 'list-plus'),
    dw('Sub', 'Add to playlist', 'list-music'),
    dw('Checked', 'Saved to Liked Songs', 'heart'),
    dsep(),
    dw(null, 'Go to artist', 'mic-vocal'),
    dw(
      offline ? 'Disabled' : null,
      'Start a Jam',
      'users-round',
      offline ? 'Needs a connection' : undefined,
    ),
    dw('Sub', 'Play on… (Bitrate Connect)', 'monitor-speaker'),
    dw('Sub', 'Share', 'share-2'),
    dsep(),
    dw('Destructive', 'Remove from this playlist', 'trash-2'),
  ])
const title = (t, d) =>
  R('Drawer/Title', { width: 'fill_container' }, { title: { content: t }, desc: { content: d } })
const playlistDrawer = () =>
  drawer(
    [
      dw(null, 'New playlist', 'plus'),
      dsep(),
      dw('Checked', 'Night drive', 'list-music', 'Already in · 24 tracks'),
      dw(null, 'Afterglow Sessions', 'list-music', '18 tracks'),
      dw(null, 'Static Lines', 'list-music', '12 tracks'),
    ],
    { header: title('Add to playlist', 'Afterglow · Nova & the Static') },
  )
const connectDrawer = () =>
  drawer(
    [
      dw('Checked', 'This phone', 'smartphone', 'Playing'),
      dw(null, 'Desktop', 'monitor', 'Ready · in sync'),
      dw(null, 'Studio speaker', 'speaker'),
      dw('Disabled', 'Smart display', 'tablet', 'Offline'),
    ],
    { header: title('Play on…', 'Bitrate Connect') },
  )
const playlistMenuDrawer = () =>
  drawer(
    [
      dw(null, 'Shuffle play', 'shuffle'),
      dw(null, 'Start a Jam', 'users-round'),
      dw(null, 'Edit details', 'pencil'),
      dw(null, 'Version history', 'history'),
      dw('Checked', 'Show on profile', 'user-round'),
      dsep(),
      dw('Destructive', 'Delete playlist', 'trash-2'),
    ],
    {
      header: R(
        'Drawer/Header',
        { width: 'fill_container' },
        {
          title: { content: 'Night drive' },
          meta: { content: 'Playlist · 24 tracks' },
          cover: {
            fill: {
              type: 'image',
              url: '../design-system/assets/albums/album-night-signal.webp',
              mode: 'cover',
            },
          },
        },
      ),
    },
  )
/** The list stays visible above the drawer, which rises from the bottom edge over the tab bar. */
const mob = (name, d, height = 844) => ({
  type: 'frame',
  id: id(),
  name,
  width: 390,
  height,
  clip: true,
  layout: 'vertical',
  fill: '$ds:--background',
  children: [
    R('Mobile/Status Bar', { width: 'fill_container' }),
    MHeader('Night drive', { actions: ['ellipsis'] }),
    L(
      { name: 'List', layout: 'vertical', gap: 4, width: 'fill_container', padding: [8, 16] },
      TRACKS.slice(0, 3).map(([t, a, , , art]) => MobileTrack(t, a, art)),
    ),
    L(
      {
        name: 'Drawer Slot',
        width: 'fill_container',
        height: 'fill_container',
        layout: 'vertical',
        justifyContent: 'end',
      },
      [d],
    ),
  ],
})

export const contextMenu = {
  title: 'Context menu',
  route: 'system — right-click / ⇧F10 / ⋯ on tracks, playlists, artists; long-press or ⋯ on mobile',
  context:
    'Desktop uses the Context Menu (shadcn): icons, shortcuts, group labels, separators, checkbox items, side submenus, disabled and destructive items. Mobile uses the Drawer (shadcn/vaul): media header, 52px rows, submenus open as the next drawer step, Cancel at the bottom.',
  desktop: () => desk('Track menu', [trackMenu(), playlistSub()]),
  mobile: () => mob('Track drawer', trackDrawer(), 1100),
  states: [
    state(
      'Play on (Bitrate Connect)',
      () =>
        desk('Bitrate Connect', [trackMenu({ open: 'connect' }), connectSub()], { offset: 296 }),
      () => mob('Bitrate Connect', connectDrawer()),
    ),
    state(
      'Add to playlist',
      null,
      () => mob('Add to playlist', playlistDrawer()),
      'desktop shows it as the submenu in the default frame',
    ),
    state(
      'Playlist',
      () => desk('Playlist menu', [playlistMenu()]),
      () => mob('Playlist drawer', playlistMenuDrawer()),
    ),
    state(
      'Offline',
      () => desk('Offline', [trackMenu({ offline: true, open: null })]),
      () => mob('Offline', trackDrawer({ offline: true }), 1100),
    ),
    state(
      'Artist',
      () =>
        desk('Artist menu', [artistMenu()], {
          heading: 'Following',
          lead: Row({ name: 'Artists', gap: 16 }, [
            ArtistCard('Luma Vale', 'Artist', 'luma'),
            ArtistCard('Mira Sol', 'Artist', 'night'),
            ArtistCard('Kite Harbor', 'Artist', 'static'),
          ]),
        }),
      null,
      'mobile uses the same drawer with the artist header',
    ),
  ],
}
