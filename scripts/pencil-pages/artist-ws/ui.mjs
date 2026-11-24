// Screen helpers for designs on the artist library: tiles, rows, alerts, states, form fields, tabs and
// numbers, each an instance with content overrides. Screens hold nothing else.
import { artistInstances } from './instances.mjs'

/** The component helpers screens are assembled from. */
export function artistUi() {
  const base = artistInstances()
  const { W, Row, fill, inline, Btn } = base
  const Tile = (title, icon, body, { right = [], hue = false, width = 'fill_container' } = {}) =>
    W(
      hue ? 'Tile/Hue' : 'Tile',
      { name: `Tile / ${title}`, width },
      {
        icon: { icon },
        title: { content: title },
        right: right.length ? inline('Right', right) : { enabled: false },
        body: fill('Body', body),
      },
    )
  const trail = (nodes) => (nodes.length ? inline('Trail', nodes) : { enabled: false })
  const Setting = (title, desc, ...controls) =>
    W(
      'Row/Setting',
      { name: `Row / ${title.slice(0, 24)}`, width: 'fill_container' },
      {
        title: { content: title },
        desc: desc ? { content: desc } : { enabled: false },
        trail: trail(controls),
      },
    )
  const KV = (label, value) =>
    W(
      'Row/Key Value',
      { name: `KV / ${label}`, width: 'fill_container' },
      {
        label: { content: label },
        value: typeof value === 'string' ? { content: value } : { enabled: false },
        trail: typeof value === 'string' ? { enabled: false } : inline('Trail', [value]),
      },
    )
  const DateRow = (month, day, title, meta, ...controls) =>
    W(
      'Row/Date',
      { name: `Date / ${title.slice(0, 24)}`, width: 'fill_container' },
      {
        month: { content: month },
        day: { content: day },
        title: { content: title },
        meta: { content: meta },
        trail: trail(controls),
      },
    )
  const TableRow = (c1, c2, c3, ...controls) =>
    W(
      'Table/Row',
      { name: `Table Row / ${c1}`, width: 'fill_container' },
      {
        c1: { content: c1 },
        c2: { content: c2 },
        c3: { content: c3 },
        trail: trail(controls),
      },
    )
  const Alert = (tone, title, body) =>
    W(
      `Alert/${tone}`,
      { name: `Alert / ${title.slice(0, 24)}`, width: 'fill_container' },
      {
        title: { content: title },
        body: { content: body },
        action: { enabled: false },
      },
    )
  /* on a phone (`m`) the copy wraps to the tile instead of its desktop measure */
  const message =
    (kind) =>
    (title, body, action, icon, m = false) =>
      W(
        `State/${kind}`,
        { name: `State / ${title.slice(0, 24)}`, width: 'fill_container' },
        {
          icon: { icon },
          title: { content: title },
          body: m ? { content: body, width: 'fill_container' } : { content: body },
          action: action
            ? inline('Action', [
                Btn(
                  action,
                  kind === 'Error' ? 'Secondary' : 'Primary',
                  kind === 'Error' ? 'refresh-cw' : 'arrow-right',
                ),
              ])
            : { enabled: false },
        },
      )
  const Field = (label, value, kind = 'Input', error) =>
    W(
      `Field/${kind}`,
      { name: `Field / ${label}`, width: 'fill_container' },
      {
        label: { content: label },
        value: { content: value },
        ...(error ? { error: { content: error } } : {}),
      },
    )
  const Switch = (label, on) =>
    W(
      on ? 'Switch/On' : 'Switch/Off',
      { name: `Switch / ${label}`, width: 'fill_container' },
      { label: { content: label } },
    )
  const Option = (title, desc, selected) =>
    W(
      selected ? 'Option/Card Selected' : 'Option/Card',
      { name: `Option / ${title}`, width: 'fill_container' },
      {
        title: { content: title },
        desc: { content: desc },
      },
    )
  const Check = (done, label) =>
    W(
      done ? 'Check/Done' : 'Check/Pending',
      { name: `Check / ${label.slice(0, 24)}`, width: 'fill_container' },
      { label: { content: label } },
    )
  const Tabs = (labels, active = 0) =>
    W(
      'Tabs',
      { name: 'Tabs' },
      {
        items: inline(
          'Items',
          labels.map((l, i) =>
            W(
              i === active ? 'Tab/Active' : 'Tab/Inactive',
              { name: `Tab / ${l}` },
              { label: { content: l } },
            ),
          ),
        ),
      },
    )
  const Progress = (bar) => W('Progress', { name: 'Progress' }, { bar: { width: bar } })
  const Stats = (items) =>
    Row(
      { name: 'Numbers', width: 'fill_container', gap: 20, alignItems: 'start' },
      items.map(([label, value, caption], i) =>
        W(
          i ? 'Stat' : 'Stat/First',
          { name: `Stat / ${label}` },
          { label: { content: label }, value: { content: value }, caption: { content: caption } },
        ),
      ),
    )
  return {
    ...base,
    Tile,
    Setting,
    KV,
    DateRow,
    TableRow,
    Alert,
    Empty: message('Empty'),
    ErrorState: message('Error'),
    Field,
    Switch,
    Option,
    Check,
    Tabs,
    Progress,
    Stats,
  }
}
