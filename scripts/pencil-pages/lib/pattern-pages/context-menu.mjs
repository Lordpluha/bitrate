// "10 • Context Menu" library pattern page.
import { C, T, P, H, F, Row, Col, Ref } from '../../kit.mjs'
import { reg, restamp } from '../engine.mjs'
import { section } from './toasts.mjs'

/* "10 • Context Menu" pattern page: desktop Context Menu and mobile Drawer — anatomy, assembled menus, rules */
const blk = (name, o = {}, parts = {}) =>
  Ref(
    reg[name].id,
    { name, ...o },
    Object.keys(parts).length
      ? Object.fromEntries(Object.entries(parts).map(([p, v]) => [reg[name].parts[p], v]))
      : undefined,
  )
const cmI = (kind, label, icon, shortcut) => {
  const n = `Context Menu/Item${kind ? ` ${kind}` : ''}`
  const parts = { label: { content: label } }
  if (icon && reg[n].parts.icon) parts.icon = { icon }
  if (reg[n].parts.shortcut)
    parts.shortcut = shortcut ? { content: shortcut, enabled: true } : { enabled: false }
  return blk(n, {}, parts)
}
const cmC = (label, on, shortcut) =>
  blk(
    'Context Menu/Item Checkbox',
    {},
    {
      label: { content: label },
      checkIcon: { enabled: on },
      shortcut: shortcut ? { content: shortcut, enabled: true } : { enabled: false },
    },
  )
const cmSep = () => blk('Context Menu/Separator')
const cmLabel = (t) => blk('Context Menu/Label', {}, { label: { content: t } })
const cmMenu = (items) =>
  blk('Context Menu', {}, { items: F({ name: 'Items', layout: 'vertical', width: 240 }, items) })
const dwI = (kind, label, icon, hint) => {
  const n = `Drawer/Item${kind ? ` ${kind}` : ''}`
  return blk(
    n,
    { width: 'fill_container' },
    {
      label: { content: label },
      icon: { icon },
      ...(hint ? { hint: { content: hint, enabled: true } } : {}),
    },
  )
}
const dwSep = () => blk('Drawer/Separator', { width: 'fill_container' })
const dwDrawer = (items, header) =>
  blk(
    'Drawer',
    {},
    {
      content: F({ name: 'Drawer Content', layout: 'vertical', width: 'fill_container' }, [
        header,
        dwSep(),
        ...items,
      ]),
    },
  )
const labelled = (t, node) =>
  Col({ gap: 6 }, [T(t, { fontSize: 12, fill: C.mutedForeground }), node])
/** Builds the page, stamps its ids and puts it after the toasts page in `prow`. */
export const buildContextMenuPage = (prow) => {
  const ctxPage = F(
    {
      name: '10 • Context Menu',
      layout: 'vertical',
      gap: 48,
      padding: 64,
      fill: C.background,
      width: 1440,
    },
    [
      H('Context Menu', 40, { fontWeight: '700' }),
      P(
        'One set of actions per object (track, playlist, album, artist), two presentations. Desktop: the Context Menu opens at the pointer on right-click, on ⇧F10 / the context-menu key, or from the row’s ⋯ button; submenus open to the side on hover or →, Esc or a click outside closes. Phones: the Drawer rises from the bottom on long-press or ⋯, with the object as its header; a submenu becomes the next drawer step, swipe down or Cancel closes. Destructive actions sit last, after a separator; unavailable actions stay visible but disabled with a reason.',
        { width: 900 },
      ),
      section('Desktop · anatomy', [
        Row({ name: 'Anatomy', gap: 32, alignItems: 'start' }, [
          Col({ gap: 12 }, [
            labelled('Header (object)', blk('Context Menu/Header')),
            labelled('Item · icon, label, shortcut', cmI(null, 'Add to queue', 'list-plus', 'Q')),
            labelled(
              'Item · highlighted (hover, keyboard focus)',
              cmI('Active', 'Play next', 'list-start', '⇧N'),
            ),
            labelled('Item · submenu', cmI('Sub', 'Add to playlist', 'list-music')),
            labelled('Item · submenu open', cmI('Sub Open', 'Add to playlist', 'list-music')),
          ]),
          Col({ gap: 12 }, [
            labelled('Checkbox item', cmC('Saved to Liked Songs', true, 'L')),
            labelled(
              'Destructive item',
              cmI('Destructive', 'Remove from this playlist', 'trash-2', '⌫'),
            ),
            labelled('Disabled item', cmI('Disabled', 'Download', 'download')),
            labelled('Group label', blk('Context Menu/Label', {}, { label: { content: 'Track' } })),
            labelled('Separator', blk('Context Menu/Separator')),
          ]),
        ]),
      ]),
      section('Desktop · assembled', [
        Row({ name: 'Assembled', gap: 8, alignItems: 'start' }, [
          cmMenu([
            blk('Context Menu/Header'),
            cmSep(),
            cmI('Active', 'Play next', 'list-start', '⇧N'),
            cmI(null, 'Add to queue', 'list-plus', 'Q'),
            cmI('Sub Open', 'Add to playlist', 'list-music'),
            cmC('Saved to Liked Songs', true, 'L'),
            cmSep(),
            cmI(null, 'Go to artist', 'mic-vocal', '⌥A'),
            cmI(null, 'Start a Jam', 'users-round'),
            cmI('Sub', 'Play on… (Bitrate Connect)', 'monitor-speaker'),
            cmI('Sub', 'Share', 'share-2'),
            cmSep(),
            cmI('Disabled', 'Download', 'download'),
            cmI('Destructive', 'Remove from this playlist', 'trash-2', '⌫'),
          ]),
          Col({ name: 'Submenu', gap: 0, padding: [136, 0, 0, 0] }, [
            cmMenu([
              cmLabel('Add to playlist'),
              cmI(null, 'New playlist', 'plus', '⌘⇧N'),
              cmSep(),
              cmC('Night drive', true),
              cmC('Afterglow Sessions', false),
              cmC('Static Lines', false),
            ]),
          ]),
        ]),
      ]),
      section('Mobile · Drawer', [
        Row({ name: 'Drawers', gap: 32, alignItems: 'end' }, [
          labelled(
            'Track · long-press or ⋯',
            dwDrawer(
              [
                dwI(null, 'Play next', 'list-start'),
                dwI(null, 'Add to queue', 'list-plus'),
                dwI('Sub', 'Add to playlist', 'list-music'),
                dwI('Checked', 'Saved to Liked Songs', 'heart'),
                dwSep(),
                dwI(null, 'Start a Jam', 'users-round'),
                dwI('Sub', 'Play on… (Bitrate Connect)', 'monitor-speaker'),
                dwI('Disabled', 'Download', 'download', 'Available with Bitrate Pro'),
                dwSep(),
                dwI('Destructive', 'Remove from this playlist', 'trash-2'),
              ],
              blk('Drawer/Header', { width: 'fill_container' }),
            ),
          ),
          labelled(
            'Submenu · the next drawer step',
            dwDrawer(
              [
                dwI(null, 'New playlist', 'plus'),
                dwSep(),
                dwI('Checked', 'Night drive', 'list-music', 'Already in · 24 tracks'),
                dwI(null, 'Afterglow Sessions', 'list-music', '18 tracks'),
                dwI(null, 'Static Lines', 'list-music', '12 tracks'),
              ],
              blk('Drawer/Title', { width: 'fill_container' }),
            ),
          ),
        ]),
      ]),
    ],
  )
  restamp('page:10 Context Menu', ctxPage)
  const cAt = prow.children.findIndex((c) => c.name === '10 • Context Menu')
  if (cAt >= 0) prow.children[cAt] = ctxPage
  else
    prow.children.splice(prow.children.findIndex((c) => c.name === '09 • Toasts') + 1, 0, ctxPage)
  return ctxPage
}
