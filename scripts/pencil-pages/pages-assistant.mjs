// AI assistant: a small button bottom-right on every page outside the in-app player, expanding into a chat.
// While a request runs, a thinking orb replaces the spinner (searching the docs → composing the answer).
import { id } from './kit.mjs'
import { R, Row, Col, Tx, Blank, state, Button } from './ui.mjs'

const msg = (text, mine) =>
  R(mine ? 'Assistant/Message Mine' : 'Assistant/Message', {}, { text: { content: text } })
const chip = (label) => R('Assistant/Suggestion', {}, { label: { content: label } })
const slotOf = (children) => ({
  type: 'frame',
  id: id(),
  name: 'Messages',
  layout: 'vertical',
  width: 'fill_container',
  height: 'fill_container',
  padding: 14,
  gap: 10,
  children: children.filter(Boolean),
})
const WELCOME = () => [
  Col(
    {
      name: 'Welcome',
      gap: 10,
      width: 'fill_container',
      alignItems: 'center',
      padding: [24, 0, 8, 0],
    },
    [
      R('Assistant/Orb'),
      Tx('H4', 'Hi, I am the Bitrate assistant'),
      Tx('Muted', 'Ask about the player, plans or releasing your music.'),
    ],
  ),
  Row({ name: 'Suggestions', gap: 8, width: 'fill_container', justifyContent: 'center' }, [
    chip('What is Bitrate?'),
    chip('Is it free?'),
  ]),
  Row({ name: 'Suggestions', gap: 8, width: 'fill_container', justifyContent: 'center' }, [
    chip('Release a single'),
    chip('Which devices work?'),
  ]),
]
const CONVO = (busy) => [
  msg('Is Bitrate free?', true),
  msg(
    'Yes — listening in the browser is free. Plans for Premium are on the way; you can see your plan in Settings.',
    false,
  ),
  msg('How do I release a single?', true),
  busy
    ? R('Assistant/Typing')
    : msg(
        'Open Bitrate for Artists → Create release, then follow the steps: audio, artwork, details, contributors and review.',
        false,
      ),
  !busy &&
    Row({ gap: 8 }, [Button('Open Bitrate for Artists', 'outline', { icon: 'arrow-up-right' })]),
]
const ERR = () => [
  msg('How do I release a single?', true),
  msg('I could not reach the docs right now. Try again in a moment.', false),
  Row({ gap: 8 }, [Button('Try again', 'outline', { icon: 'rotate-ccw' })]),
]
const panel = (children, w, h, status) =>
  R(
    'Assistant/Panel',
    { width: w, height: h },
    { messages: slotOf(children), status: status ? { content: status } : undefined },
  )
const dock = (name, children, open) =>
  Blank(name, 1440, 900, [
    Row({ name: 'Page', width: 'fill_container', height: 'fill_container' }, []),
    Col({ name: 'Assistant Dock', width: 'fill_container', alignItems: 'end', gap: 14 }, [
      children,
      R(open ? 'Assistant/FAB Open' : 'Assistant/FAB'),
    ]),
  ])
const sheet = (name, children, status) =>
  Blank(name, 390, 844, [panel(children, 'fill_container', 'fill_container', status)])
const S = (label, kids, status, h = 540) =>
  state(
    label,
    () => dock(label, panel(kids(), 380, h, status), true),
    () => sheet(label, kids(), status),
  )

export const assistant = {
  title: 'AI assistant',
  route: 'system — floating assistant on every page outside /main',
  context:
    'Bottom-right button on the landing, auth, legal, verify, 404, error and offline pages (not inside the player). It expands into a 380×540 chat on desktop and a full-screen sheet on phones. While a request runs a thinking orb shows the phase: searching the docs, then composing. Answers cite Bitrate docs; never ask for passwords or payment data.',
  desktop: () => dock('Assistant', panel(WELCOME(), 380, 540), true),
  mobile: () => sheet('Assistant', WELCOME()),
  states: [
    state(
      'Closed',
      () =>
        dock(
          'Closed',
          Row({ name: 'Hint', padding: [0, 4, 0, 0] }, [
            R(
              'Tooltip/Action',
              {},
              { label: { content: 'Ask Bitrate' }, hint: { content: 'AI assistant' } },
            ),
          ]),
          false,
        ),
      null,
      'phones show only the button; the hint appears on hover',
    ),
    S('Conversation', () => CONVO(false)),
    S('Searching', () => CONVO(true), 'Searching the docs…'),
    S('Error', ERR, 'Unavailable right now'),
    S(
      'Offline',
      () => [msg('You are offline. I will answer when the connection is back.', false)],
      'Offline',
    ),
  ],
}

/* every page outside the player docks the assistant button bottom-right */
export const withAssistant = (frame, mobile) => {
  if (!frame || frame.type !== 'frame') return frame
  const { children = [], layout, gap, padding, justifyContent, alignItems, ...rest } = frame
  const inner = {
    type: 'frame',
    id: id(),
    name: 'Page',
    width: 'fill_container',
    height: 'fill_container',
    layout: layout ?? 'horizontal',
    gap,
    padding,
    justifyContent,
    alignItems,
    children,
  }
  const dockRow = Row(
    {
      name: 'Assistant Dock',
      width: 'fill_container',
      justifyContent: 'end',
      padding: mobile ? [0, 16, 20, 0] : [0, 24, 24, 0],
    },
    [R('Assistant/FAB')],
  )
  return { ...rest, layout: 'vertical', children: [inner, dockRow] }
}
