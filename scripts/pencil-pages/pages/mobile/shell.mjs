// Native mobile app (apps/mobile) page shells: phone frames built only from library instances.
import { C, id } from '../../kit.mjs'
import { L, R, Row, Col, Tx, SectionHeader, fitStates, state } from '../../ui.mjs'

/** Why a native-app state has no desktop frame. */
export const NATIVE = 'native phone app (apps/mobile) — there is no desktop layout'
/** A state of a phone-only page. */
export const ms = (label, mobile) => state(label, null, mobile, NATIVE)

const ISLAND_TABS = ['home', 'search', 'library']
/** What the island carries: `idle` is navigation only (nothing queued); the rest show the track. */
const ISLAND_MODES = {
  idle: { ring: { enabled: false }, play: { enabled: false } },
  playing: {},
  paused: { playIcon: { icon: 'play' } },
  loading: { playIcon: { icon: 'loader-circle' } },
}
/** The app's navigation + player island (design Mobile/Island) for the active tab and player mode. */
export const Island = (tab = 'home', mode = 'playing') =>
  R(
    'Mobile/Island',
    { width: 'fill_container' },
    {
      ...Object.fromEntries(
        ISLAND_TABS.flatMap((k) => [
          [k, k === tab ? { fill: C.secondary } : undefined],
          [`${k}Icon`, k === tab ? { fill: C.foreground } : undefined],
        ]),
      ),
      ...ISLAND_MODES[mode],
    },
  )

const phone = (name, children, fill = C.background) => ({
  type: 'frame',
  id: id(),
  name,
  width: 390,
  height: 844,
  clip: true,
  layout: 'vertical',
  fill,
  children: children.filter(Boolean),
})

/** A tab screen: status bar, optional header, scrolling content, and the island at the bottom. */
export const AppScreen = (name, content, { tab = 'home', island = 'playing', header } = {}) =>
  phone(name, [
    R('Mobile/Status Bar', { width: 'fill_container' }),
    header,
    L(
      {
        name: 'Content',
        width: 'fill_container',
        height: 'fill_container',
        layout: 'vertical',
        gap: 20,
        padding: [8, 16, 12, 16],
        clip: true,
      },
      fitStates(content, true),
    ),
    L(
      {
        name: 'Island Slot',
        width: 'fill_container',
        padding: [8, 16, 18, 16],
        justifyContent: 'center',
      },
      [Island(tab, island)],
    ),
  ])

/** A full-screen modal (Now playing): no island, its own close control. */
export const ModalScreen = (name, content) =>
  phone(name, [
    R('Mobile/Status Bar', { width: 'fill_container' }),
    L(
      {
        name: 'Modal',
        width: 'fill_container',
        height: 'fill_container',
        layout: 'vertical',
        gap: 18,
        padding: [8, 22, 24, 22],
      },
      fitStates(content, true),
    ),
  ])

/** A horizontally scrolling strip: it bleeds past the edge so the cut item shows there is more. */
export const Scroller = (name, children) =>
  L({ name, width: 374, clip: true }, [
    Row({ name: `${name} Row`, gap: 12, alignItems: 'start' }, children),
  ])

/** Section title row as the app draws it (no "Show all" action in this release). */
export const Section = (title) => SectionHeader(title, null)

export const Heading = (title, sub) =>
  Col({ name: 'Heading', gap: 6, width: 'fill_container' }, [
    Tx('H1', title, { wrap: true }),
    sub && Tx('Muted', sub, { wrap: true }),
  ])
