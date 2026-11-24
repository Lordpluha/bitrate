// Artist / Notifications (widgets/ArtistDashboard DashboardNotificationsPopover): the header bell's
// popover with the unread count, "Mark all as read", and the Action required and Updates groups;
// loading, error, empty, all caught up and a failed mark-as-read.
import { pageSpec } from '../../../artist-ws/spec.mjs'

const ACTION = [
  ['message-square-warning', 'The reviewer requested changes', 'Echoes in Motion · 2 h ago'],
  ['circle-alert', 'Publishing failed — Bitrate has been notified', 'Static Lines · 5 h ago'],
]
const UPDATES = [
  ['badge-check', 'Approved by Bitrate review', 'Static Lines · Yesterday', true],
  ['clock-3', 'Submitted for Bitrate review', 'Echoes in Motion · Nov 20', false],
  ['radio', 'Live on Bitrate', 'Afterglow · Oct 3', false],
]

/** The notifications page spec. */
export function notificationsPage(ui, frames) {
  const { W, Tx, P, Row, Col, fill, Btn } = ui
  const shell = { nav: 'dashboard', crumb: 'Dashboard', action: 'Create release' }
  const item =
    (variant) =>
    ([icon, title, meta]) =>
      W(
        variant,
        { name: `Notification / ${title.slice(0, 20)}`, width: 'fill_container' },
        { icon: { icon }, title: { content: title }, meta: { content: meta } },
      )
  const group = (title, rows) =>
    Col({ name: `Group / ${title}`, gap: 4, width: 'fill_container' }, [
      Tx('Eyebrow', title.toUpperCase()),
      ...rows,
    ])
  const list = (read = false) => [
    group(
      'Action required',
      ACTION.map(item(read ? 'Row/Notification' : 'Row/Notification Action')),
    ),
    group(
      'Updates',
      UPDATES.map(([i, t, mt, unread]) =>
        item(unread && !read ? 'Row/Notification Unread' : 'Row/Notification')([i, t, mt]),
      ),
    ),
  ]
  const toolbar = (status, markAll = true) =>
    Row({ name: 'Toolbar', width: 'fill_container', justifyContent: 'space_between' }, [
      Tx('Caption', status),
      ...(markAll ? [Btn('Mark all as read', 'Compact Ghost', 'check-check')] : []),
    ])
  const popover = (m, body) =>
    Row({ name: 'Popover Layer', width: 'fill_container', justifyContent: 'end' }, [
      W(
        'Popover',
        { name: 'Notifications', width: m ? 'fill_container' : 400 },
        { title: { content: 'Notifications' }, items: fill('Items', body, { gap: 12 }) },
      ),
    ])
  const centred = (nodes) => [
    Col(
      { name: 'State', gap: 12, width: 'fill_container', alignItems: 'center', padding: [24, 12] },
      nodes,
    ),
  ]
  return pageSpec(
    frames,
    {
      title: 'Artist / Notifications',
      route: 'popover from the header bell on every /dashboard page',
      context:
        'Opens under the bell (its label counts the unread). Each item links to its release workspace; the dot marks unread items.',
    },
    shell,
    (m) => [popover(m, [toolbar('3 unread'), ...list()])],
    [
      [
        'All caught up',
        shell,
        (m) => [popover(m, [toolbar('All caught up', false), ...list(true)])],
      ],
      [
        'Mark as read failed',
        shell,
        (m) => [
          popover(m, [toolbar('3 unread'), P('Error', 'Could not mark as read.'), ...list()]),
        ],
      ],
      [
        'Loading',
        shell,
        (m) => [
          popover(
            m,
            centred([W('Spinner', { name: 'Spinner' }), Tx('Muted', 'Loading notifications…')]),
          ),
        ],
      ],
      [
        'Error',
        shell,
        (m) => [
          popover(
            m,
            centred([
              P('Body', 'Could not load notifications. Please try again.'),
              Btn('Try again', 'Outline', 'refresh-cw'),
            ]),
          ),
        ],
      ],
      [
        'Empty',
        shell,
        (m) => [
          popover(
            m,
            centred([
              W('Button/Icon', { name: 'Bell' }, { icon: { icon: 'bell-off' } }),
              P(
                'Muted',
                'No notifications. Deadlines, review results and delivery updates will appear here.',
              ),
            ]),
          ),
        ],
      ],
    ],
  )
}
