// Pencil pages for the admin console's resource routes, drawn from admin-resources.mjs (the prototype
// reads the same specs). One list template — metrics, a glass panel with toolbar, table and pager, cards
// on phones — and one detail template: header with back link, status and decisions, then a bento of
// tiles. Every state of a page is a desktop + mobile pair; dialogs sit in the flow (Pencil cannot
// overlap) above the page on desktop and as a sheet under the header on phones.
import { existsSync, readFileSync } from 'node:fs'
import {
  DETAIL_STATES,
  FORM_STATES,
  LIST_STATES,
  RESOURCES,
  STATE_LABEL,
} from './admin-resources.mjs'
import { A, Btn, IconBtn, MShell, Pill, Shell, Tx } from './admin-ui.mjs'
import { C } from './kit.mjs'
import { L, Row, state } from './ui.mjs'

const W = { width: 'fill_container' }
const WRAP = { width: 'fill_container', textGrowth: 'fixed-width' }
/* the prototype's icon names → the icon font's */
const ICON = {
  flag: 'flag',
  inbox: 'inbox',
  eye: 'eye',
  alert: 'triangle-alert',
  check: 'check',
  download: 'download',
  x: 'x',
  audio: 'audio-lines',
  list: 'list',
  scroll: 'scroll-text',
  disc: 'disc-3',
  clock: 'clock',
  trend: 'trending-up',
  shield: 'shield-check',
  users: 'users',
  edit: 'pencil',
  play: 'play',
  search: 'search',
  refresh: 'refresh-cw',
  album: 'disc-album',
  podcast: 'podcast',
  tags: 'tags',
  plus: 'plus',
}
const icon = (k) => ICON[k] ?? k
const PILL = { up: 'Up', down: 'Down', warn: 'Warn', info: 'Info', flat: 'Flat' }
const METRIC = { warn: 'Warning', info: 'Info', down: 'Error', up: 'Success', flat: 'Neutral' }
const DIALOG = { success: 'Success', error: 'Error', warning: 'Warning' }
const chip = (c) => Pill(PILL[c.tone], c.t)
const text = (c) => (typeof c === 'string' ? c : c.s ? `${c.t} · ${c.s}` : c.t)
const off = (node) => Object.assign(node, { opacity: 0.45 })

/* measured frame heights (scripts/pencil-pages/admin-heights.json), refreshed after layout changes */
const HEIGHTS_FILE = new URL('./admin-heights.json', import.meta.url)
const HEIGHTS = existsSync(HEIGHTS_FILE) ? JSON.parse(readFileSync(HEIGHTS_FILE, 'utf8')) : {}
const height = (key, label, fallback) => HEIGHTS[`${key} / ${label}`] ?? fallback

/* ---------- cells and blocks ---------- */
const cell = (c, w, m) => {
  const size = w ? { width: w, textGrowth: 'fixed-width' } : WRAP
  if (typeof c === 'string') return Tx('Body', c, size)
  if (c.tone) return L({ name: 'Cell', width: w ?? 'fill_container' }, [chip(c)])
  return A(
    'Admin/Cell/Two',
    { name: `Cell / ${c.t}`, width: w ?? 'fill_container' },
    { title: { content: c.t }, sub: c.s ? { content: c.s } : { enabled: false } },
  )
}
const tableRows = (b, m) => {
  const keep = b.cols.map((c, i) => [c, i]).filter(([c]) => !(m && c.wide))
  return [
    A('Admin/Table/Head', W, {
      cells: L(
        { name: 'Cells', gap: 12, width: 'fill_container' },
        keep.map(([c]) =>
          Tx('Caption', c.l, c.w ? { width: c.w, textGrowth: 'fixed-width' } : WRAP),
        ),
      ),
    }),
    ...b.rows.map((r) =>
      A('Admin/Table/Row', W, {
        cells: L(
          { name: 'Cells', gap: 12, alignItems: 'center', width: 'fill_container' },
          keep.map(([c, i]) => cell(r[i], c.w, m)),
        ),
      }),
    ),
  ]
}
const block = (b, m) => {
  if (b.type === 'kv')
    return b.rows.map(([k, v]) =>
      typeof v === 'string'
        ? A(
            'Admin/Key Value',
            { name: `KV / ${k}`, ...W },
            { key: { content: k }, value: { content: v } },
          )
        : A(
            'Admin/Key Pill',
            { name: `KV / ${k}`, ...W },
            { key: { content: k }, value: L({ name: 'Value' }, [chip(v)]) },
          ),
    )
  if (b.type === 'quote') return A('Admin/Quote', W, { text: { content: b.t } })
  if (b.type === 'media')
    return A('Admin/Media', W, {
      icon: { icon: icon(b.icon) },
      title: { content: b.t },
      sub: { content: b.s },
    })
  if (b.type === 'table')
    return L(
      { name: 'Table', layout: 'vertical', gap: 0, width: 'fill_container' },
      tableRows(b, m),
    )
  if (b.type === 'feed')
    return b.items.map(([x, meta]) =>
      A(
        'Admin/Feed Item',
        { name: `Feed / ${x.slice(0, 24)}`, ...W },
        { text: { content: x }, meta: { content: meta } },
      ),
    )
  if (b.type === 'checks')
    return b.items.map(([ok, x, note]) =>
      A(
        `Admin/Check Row/${ok ? 'OK' : 'Warn'}`,
        { name: `Check / ${x.slice(0, 24)}`, ...W },
        {
          text: { content: x },
          ...(ok ? {} : { note: { content: note } }),
        },
      ),
    )
  if (b.type === 'chips')
    return A('Admin/Chips', W, {
      label: { content: b.label },
      chips: L(
        { name: 'Items', gap: 6 },
        b.items.map((x) => Pill('Flat', x)),
      ),
    })
  return []
}
const tile = (tl, m) =>
  A(
    'Admin/Tile',
    {
      name: `Tile / ${tl.title}`,
      width: 'fill_container',
      ...(m ? {} : { height: 'fill_container' }),
    },
    {
      icon: { icon: icon(tl.icon) },
      title: { content: tl.title },
      meta: { content: tl.meta },
      actions: { enabled: false },
      content: L(
        { name: 'Tile Content', layout: 'vertical', gap: 10, width: 'fill_container' },
        [
          ...tl.blocks.flatMap((b) => [block(b, m)].flat()),
          tl.link ? Tx('Link', `${tl.link} ↗`) : null,
        ].filter(Boolean),
      ),
    },
  )
/** Tiles on the four-column grid: a row fills up to four columns, tiles in a row share its height. */
const grid = (tiles, m, make = tile) => {
  if (m) return tiles.map((tl) => make(tl, m))
  const rows = []
  let row = []
  let used = 0
  for (const tl of tiles) {
    if (used + tl.w > 4) {
      rows.push(row)
      row = []
      used = 0
    }
    row.push(tl)
    used += tl.w
  }
  if (row.length) rows.push(row)
  return rows.map((r, i) =>
    Row(
      { name: `Tiles ${i + 1}`, width: 'fill_container', gap: 16, alignItems: 'start' },
      r.map((tl) => make(tl, m)),
    ),
  )
}

/* ---------- shared pieces ---------- */
const banner = () =>
  A(
    'Admin/Banner',
    { name: 'Offline', ...W },
    {
      icon: { icon: 'wifi-off' },
      title: { content: 'You’re offline' },
      desc: { content: 'Showing data from 09:42. Actions are paused until you reconnect.' },
      'action.label': { content: 'Try again' },
      'action.icon': { icon: 'refresh-cw' },
    },
  )
const message = (kind, title, desc, o = {}) =>
  A(
    `Admin/Tile Message/${kind}`,
    { name: `Message / ${kind}`, width: 'fill_container', height: o.h ?? 340 },
    {
      title: { content: title },
      desc: { content: desc },
      ...(o.icon ? { icon: { icon: o.icon } } : {}),
      ...(o.action
        ? { 'action.label': { content: o.action[0] }, 'action.icon': { icon: o.action[1] } }
        : {}),
    },
  )
const locked = (sp) =>
  message('Locked', 'Not in your role', `Needs ${sp.perm}. Ask a super admin for access.`)
const panel = (nodes) =>
  A(
    'Admin/Panel',
    { name: 'Panel', ...W },
    {
      content: L(
        { name: 'Panel Content', layout: 'vertical', gap: 0, width: 'fill_container' },
        nodes.flat().filter(Boolean),
      ),
    },
  )
const FRESH = ['new', 'new-errors']
const actionButtons = (sp, st) =>
  (sp.actions ?? [])
    .filter((a) => !(FRESH.includes(st) && a.dialog))
    .map((a) => {
      const saving = st === 'saving' && a.primary
      const label = saving
        ? sp.saving
        : FRESH.includes(st) && a.primary && sp.createLabel
          ? sp.createLabel
          : a.label
      const b = Btn(
        a.primary ? (a.danger ? 'Danger' : 'Default') : 'Glass',
        label,
        saving ? 'loader-circle' : icon(a.icon),
      )
      return (st === 'saving' && !a.primary) || st === 'offline' ? off(b) : b
    })
const pocketFor = (st, sp) =>
  st === 'offline'
    ? { icon: 'wifi-off', text: 'Offline · 09:42', tone: 'warning' }
    : st === 'saving'
      ? { icon: 'loader-circle', text: sp.saving, bar: true }
      : undefined

/* ---------- list ---------- */
const NO_FIGURES = ['empty', 'error', 'restricted']
const metrics = (sp, st, m) => {
  const items = sp.kpis.map((k) =>
    st === 'loading'
      ? A('Admin/Loader/Metric', { name: `Metric / ${k.label}`, ...W })
      : A(
          `Admin/${m ? 'Metric Stack' : 'Metric'}/${METRIC[k.tone]}`,
          { name: `Metric / ${k.label}`, ...W },
          {
            icon: { icon: icon(k.icon) },
            label: { content: k.label },
            value: { content: NO_FIGURES.includes(st) ? '—' : k.value },
            sub: { content: NO_FIGURES.includes(st) ? ' ' : k.sub },
          },
        ),
  )
  return m
    ? [0, 2].map((i) =>
        Row(
          { name: 'Metrics', width: 'fill_container', gap: 10, alignItems: 'start' },
          items.slice(i, i + 2),
        ),
      )
    : Row({ name: 'Metrics', width: 'fill_container', gap: 16 }, items)
}
const fitsOneLine = (sp, nr) =>
  (sp.filters ?? []).reduce((w, f) => {
    const v = nr.filter?.label === f.label ? nr.filter.value : f.value
    return w + (f.label.length + v.length + 2) * 7 + 52
  }, 0) <= 326
const selecting = (sp, st) => sp.select && (st === 'selected' || !!sp.dialogs?.[st])
const toolbar = (sp, st, m) => {
  if (selecting(sp, st))
    return A('Admin/Bulk Bar', W, {
      count: { content: `${sp.selected.length} selected` },
      actions: L(
        { name: 'Actions', gap: 8 },
        sp.bulk.map((a) => Btn('Glass', a.label, m ? undefined : icon(a.icon))),
      ),
    })
  const dim = ['loading', 'error', 'restricted'].includes(st)
  const nr = st === 'noresults' ? sp.noresults : {}
  const items = [
    sp.search
      ? A(
          'Admin/Search Field',
          { name: 'Search', ...(m ? W : {}) },
          {
            text: nr.query ? { content: nr.query, fill: C.foreground } : { content: sp.search },
          },
        )
      : null,
    ...(sp.filters ?? []).map((f) => {
      const value = nr.filter?.label === f.label ? nr.filter.value : f.value
      return A(
        value !== f.value ? 'Admin/Filter On' : 'Admin/Filter',
        { name: `Filter / ${f.label}` },
        {
          label: { content: `${f.label}:` },
          value: { content: value },
        },
      )
    }),
  ].filter(Boolean)
  const node = A('Admin/Toolbar', W, {
    items: m
      ? L(
          { name: 'Items', layout: 'vertical', gap: 10, width: 'fill_container' },
          [
            items[0]?.name === 'Search' ? items[0] : null,
            /* filters share a line on phones while they fit, like the prototype's wrapping bar */
            L(
              { name: 'Filters', gap: 8, ...(fitsOneLine(sp, nr) ? {} : { layout: 'vertical' }) },
              items.filter((x) => x.name !== 'Search'),
            ),
          ].filter((x) => x && (x.children?.length ?? 1)),
        )
      : L({ name: 'Items', gap: 10, width: 'fill_container' }, items),
    count:
      m || ['loading', 'error', 'restricted', 'empty', 'noresults'].includes(st)
        ? { enabled: false }
        : { content: sp.pager },
  })
  return dim ? off(node) : node
}
const listBody = (sp, st, m) => {
  if (st === 'loading') return A(m ? 'Admin/Loader/Cards' : 'Admin/Loader/Table', W)
  if (st === 'error')
    return message('Error', sp.error.title, sp.error.desc, { action: ['Try again', 'refresh-cw'] })
  if (st === 'restricted') return locked(sp)
  if (st === 'empty') return message('Empty', sp.empty.title, sp.empty.desc, { icon: 'check' })
  if (st === 'noresults')
    return message('Search', sp.noresults.title, sp.noresults.desc, {
      action: ['Clear filters', 'x'],
    })
  const sel = new Set(selecting(sp, st) ? sp.selected : [])
  if (m)
    return [
      L(
        { name: 'Cards', layout: 'vertical', gap: 10, padding: 12, width: 'fill_container' },
        sp.rows.map((r) => {
          const cd = sp.card
          const title = r[cd.title]
          return A(
            sel.has(r.id) ? 'Admin/Record Card Selected' : 'Admin/Record Card',
            { name: `Card / ${r.id}`, ...W },
            {
              check: { enabled: selecting(sp, st) },
              title: { content: typeof title === 'string' ? title : title.t },
              sub:
                typeof title === 'string' || !title.s ? { enabled: false } : { content: title.s },
              badge: cd.badge ? L({ name: 'Badge' }, [chip(r[cd.badge])]) : { enabled: false },
              meta: { content: cd.meta.map((k) => text(r[k])).join(' · ') },
            },
          )
        }),
      ),
      A('Admin/Pager', W, { label: { content: sp.pager } }),
    ]
  const c = sp.cols
  const head = A('Admin/Table/Head', W, {
    cells: L(
      { name: 'Cells', gap: 12, alignItems: 'center', width: 'fill_container' },
      [
        sp.select
          ? A(sel.size === sp.rows.length ? 'Checkbox/On' : 'Checkbox/Off', { name: 'Select all' })
          : null,
        ...c.map((col) => {
          const size = col.w ? { width: col.w } : W
          if (!col.sort)
            return Tx('Caption', col.l, col.w ? { width: col.w, textGrowth: 'fixed-width' } : WRAP)
          return L({ name: `Head / ${col.l}`, ...size }, [
            A(
              col.sort === true ? 'Admin/Sort/Off' : 'Admin/Sort/On',
              { name: `Sort / ${col.l}` },
              { label: { content: col.l } },
            ),
          ])
        }),
        L({ name: 'Go', width: 24 }),
      ].filter(Boolean),
    ),
  })
  const rows = sp.rows.map((r) =>
    A(
      sel.has(r.id) ? 'Admin/Table/Row Selected' : 'Admin/Table/Row',
      { name: `Row / ${r.id}`, ...W },
      {
        cells: L(
          { name: 'Cells', gap: 12, alignItems: 'center', width: 'fill_container' },
          [
            sp.select
              ? A(sel.has(r.id) ? 'Checkbox/On' : 'Checkbox/Off', { name: 'Select' })
              : null,
            ...c.map((col) => cell(r[col.k], col.w, m)),
            A('Admin/Cell/Chevron', { name: 'Open' }),
          ].filter(Boolean),
        ),
      },
    ),
  )
  return [head, ...rows, A('Admin/Pager', W, { label: { content: sp.pager } })]
}
const listHeader = (sp, st, m) => {
  const actions = !['loading', 'error', 'restricted'].includes(st)
  const buttons = actions ? actionButtons(sp, st) : []
  if (m)
    return [
      A('Admin/Page Header Compact', W, {
        eyebrow: { content: sp.eyebrow },
        title: { content: sp.title, ...WRAP },
        accent: { enabled: false },
        subtitle: { content: sp.sub },
      }),
      buttons.length
        ? Row({ name: 'Page Actions', width: 'fill_container', gap: 8 }, buttons)
        : null,
    ]
  return A('Admin/Page Header', W, {
    eyebrow: { content: sp.eyebrow },
    title: { content: sp.title },
    accent: { enabled: false },
    subtitle: { content: sp.sub },
    actions: L({ name: 'Actions', gap: 10, alignItems: 'center' }, buttons),
  })
}
const listNodes = (sp, st, m) => {
  const page = [
    listHeader(sp, st, m),
    st === 'offline' ? banner() : null,
    metrics(sp, st, m),
    panel([toolbar(sp, st, m), listBody(sp, st, m)]),
  ]
  return sp.dialogs?.[st] ? withDialog(sp, st, m, page, listHeader(sp, st, m)) : page
}

/* ---------- detail ---------- */
const detailHeader = (sp, st, m) => {
  const title = st === 'notfound' ? sp.notfound.title : sp.title
  const bare = ['loading', 'error', 'restricted', 'notfound'].includes(st)
  const parts = {
    'back.label': { content: RESOURCES[sp.parent].title },
    eyebrow: { content: sp.eyebrow },
    title: { content: title, ...(m ? WRAP : {}) },
    status: bare || !sp.status ? { enabled: false } : L({ name: 'Status' }, [chip(sp.status)]),
    subtitle: st === 'notfound' ? { enabled: false } : { content: sp.sub },
  }
  if (m)
    return [
      A('Admin/Detail Header Compact', W, parts),
      bare
        ? null
        : Row({ name: 'Page Actions', width: 'fill_container', gap: 8 }, actionButtons(sp, st)),
    ]
  return A('Admin/Detail Header', W, {
    ...parts,
    actions: L(
      { name: 'Actions', gap: 10, alignItems: 'center' },
      bare ? [] : actionButtons(sp, st),
    ),
  })
}
const loaderTile = (tl) =>
  A('Admin/Loader/List', { name: `Loader / ${tl.title}`, width: 'fill_container' })
const dialog = (sp, key, m) => {
  const bad = key === 'invalid'
  const k = bad ? Object.keys(sp.dialogs).find((x) => sp.dialogs[x].field) : key
  const d = sp.dialogs[k]
  const f = d.field
  return A(
    `Admin/${m ? 'Sheet' : 'Dialog'}/${DIALOG[d.tone]}`,
    { name: `Dialog / ${STATE_LABEL[key] ?? key}`, ...(m ? W : {}) },
    {
      title: { content: d.title },
      desc: { content: d.desc },
      body: f
        ? A(bad ? 'Admin/Textarea Error' : 'Admin/Textarea', W, {
            label: { content: f.label },
            value: { content: bad ? f.hint : f.value.join('\n') },
            hint: { content: bad ? f.error : f.hint },
          })
        : { enabled: false },
      actions: L({ name: 'Actions', gap: 8, justifyContent: 'end', width: 'fill_container' }, [
        Btn('Glass', 'Cancel'),
        Btn(d.danger ? 'Danger' : 'Default', d.action),
      ]),
    },
  )
}
const withDialog = (sp, st, m, page, head) =>
  m
    ? [
        head,
        L({ name: 'Spacer', width: 'fill_container', height: 'fill_container' }),
        dialog(sp, st, m),
      ]
    : [
        Row({ name: 'Dialog Row', width: 'fill_container', justifyContent: 'center' }, [
          dialog(sp, st, m),
        ]),
        ...page,
      ]
const detailNodes = (sp, st, m) => {
  const head = detailHeader(sp, st, m)
  if (st === 'loading') return [head, grid(sp.tiles, m, loaderTile)]
  if (st === 'error')
    return [
      head,
      panel([
        message('Error', sp.error.title, sp.error.desc, {
          action: ['Try again', 'refresh-cw'],
          h: 380,
        }),
      ]),
    ]
  if (st === 'restricted') return [head, panel([Object.assign(locked(sp), { height: 380 })])]
  if (st === 'notfound')
    return [
      head,
      panel([
        message('Search', sp.notfound.title, sp.notfound.desc, {
          action: ['Back to the list', 'chevron-left'],
          h: 380,
        }),
      ]),
    ]
  const page = [head, st === 'offline' ? banner() : null, grid(sp.tiles, m)]
  return sp.dialogs?.[st] || st === 'invalid' ? withDialog(sp, st, m, page, head) : page
}

/* ---------- form: the editor tile beside tiles that preview the result ---------- */
const SWATCH = {
  'chart-1': 'chart1',
  'chart-2': 'chart2',
  'chart-3': 'chart3',
  'chart-4': 'chart4',
  'chart-5': 'chart5',
  magenta: 'magenta500',
  blue: 'blue500',
}
const field = (fd, st) => {
  const fresh = FRESH.includes(st)
  const bad = (st === 'errors' || st === 'new-errors') && fd.error && 'badValue' in fd
  const v = bad ? fd.badValue : fresh ? (fd.type === 'swatches' ? fd.options[0] : '') : fd.value
  if (fd.type === 'swatches')
    return A(
      'Admin/Swatches',
      { name: `Field / ${fd.label}`, ...W },
      {
        label: { content: fd.label },
        items: L(
          { name: 'Items', gap: 4 },
          fd.options.map((o) =>
            A(
              o === v ? 'Admin/Swatch/On' : 'Admin/Swatch/Off',
              { name: `Swatch / ${o}` },
              { dot: { fill: C[SWATCH[o]] } },
            ),
          ),
        ),
      },
    )
  const empty = v === ''
  const value = empty ? { content: fd.placeholder, fill: C.mutedForeground } : { content: v }
  if (fd.type === 'textarea')
    return A(
      'Admin/Textarea',
      { name: `Field / ${fd.label}`, ...W },
      {
        label: { content: fd.label },
        value,
        hint: fd.hint ? { content: fd.hint } : { enabled: false },
      },
    )
  return A(
    bad ? 'Admin/Input Error' : 'Admin/Input',
    { name: `Field / ${fd.label}`, ...W },
    {
      label: { content: fd.label },
      prefix: fd.prefix ? { content: fd.prefix } : { enabled: false },
      value,
      hint: bad ? { content: fd.error } : fd.hint ? { content: fd.hint } : { enabled: false },
    },
  )
}
const formHeader = (sp, st, m) => {
  const fresh = FRESH.includes(st)
  return detailHeader(
    {
      ...sp,
      status: null,
      title: fresh ? sp.newTitle : sp.title,
      eyebrow: fresh ? sp.newEyebrow : sp.eyebrow,
    },
    st,
    m,
  )
}
const formNodes = (sp, st, m) => {
  if (['loading', 'error', 'restricted', 'notfound'].includes(st)) return detailNodes(sp, st, m)
  const fresh = FRESH.includes(st)
  const head = formHeader(sp, st, m)
  const bad =
    st === 'errors' || st === 'new-errors'
      ? sp.form.fields.filter((fd) => fd.error && 'badValue' in fd).length
      : 0
  const editor = A(
    'Admin/Tile',
    { name: `Tile / ${sp.form.title}`, width: 'fill_container' },
    {
      icon: { icon: icon(sp.icon) },
      title: { content: sp.form.title },
      meta: { content: sp.form.meta },
      actions: { enabled: false },
      content: L(
        { name: 'Tile Content', layout: 'vertical', gap: 4, width: 'fill_container' },
        [
          bad ? A('Admin/Form Error', W, { text: { content: `Fix ${bad} fields to save` } }) : null,
          ...sp.form.fields.map((fd) => field(fd, st)),
        ].filter(Boolean),
      ),
    },
  )
  const side = sp.tiles
    .filter((tl) => !(fresh && tl.existing))
    .map((tl) => tile(fresh && tl.newBlocks ? { ...tl, blocks: tl.newBlocks } : tl, true))
  const body = m
    ? [editor, ...side]
    : Row({ name: 'Form', width: 'fill_container', gap: 16, alignItems: 'start' }, [
        editor,
        L({ name: 'Side', layout: 'vertical', gap: 16, width: 'fill_container' }, side),
      ])
  const page = [head, st === 'offline' ? banner() : null, body]
  return sp.dialogs?.[st] ? withDialog(sp, st, m, page, head) : page
}

/* ---------- pages ---------- */
const dialogKeys = (sp) =>
  Object.entries(sp.dialogs ?? {}).flatMap(([k, d]) => (d.field ? [k, 'invalid'] : [k]))
const statesOf = (sp) =>
  sp.kind === 'list'
    ? [...LIST_STATES.filter((s) => s !== 'selected' || sp.select), ...dialogKeys(sp)]
    : (sp.kind === 'form' ? FORM_STATES : DETAIL_STATES).flatMap((s) =>
        s === 'dialogs' ? dialogKeys(sp) : [s],
      )
function resourcePage(key, sp) {
  const nodes = sp.kind === 'list' ? listNodes : sp.kind === 'form' ? formNodes : detailNodes
  const page = sp.nav
  const title = `Admin / ${sp.kind === 'list' ? sp.title : `${RESOURCES[sp.parent].title} · ${sp.title}`}`
  /* frames are named "<state> / Desktop|Mobile"; the defaults "Desktop / <theme>" and "Mobile / Dark" */
  const D =
    (label, st, frameLabel = `${label} / Desktop`) =>
    (theme) =>
      Shell(label, nodes(sp, st, false), {
        page,
        theme: theme ?? 'Dark',
        height: height(key, frameLabel, 1800),
        pocket: pocketFor(st, sp),
      })
  const M =
    (label, st, frameLabel = `${label} / Mobile`) =>
    () =>
      MShell(
        label,
        nodes(sp, st, true),
        height(
          key,
          frameLabel,
          sp.dialogs?.[st] || st === 'invalid' ? 844 : sp.kind === 'list' ? 2400 : 3600,
        ),
        {
          page,
        },
      )
  return {
    title,
    route: sp.route,
    context: `${sp.sub} Drawn from scripts/pencil-pages/admin-resources.mjs, the same data as the prototype (#${sp.hash ?? key}). Dialogs and menus sit in the flow; the prototype shows them floating.`,
    desktop: (theme) => D('Default', 'default', `Desktop / ${theme}`)(theme),
    mobile: M('Default', 'default', 'Mobile / Dark'),
    states: statesOf(sp).map((st) => {
      const label = STATE_LABEL[st] ?? st
      return state(label, () => D(label, st)(), M(label, st))
    }),
  }
}
export const resourcePages = Object.fromEntries(
  Object.entries(RESOURCES).map(([k, sp]) => [k, resourcePage(k, sp)]),
)
