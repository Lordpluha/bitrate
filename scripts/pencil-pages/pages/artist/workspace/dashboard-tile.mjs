// The plain dashboard tile: a glass tile with its icon heading, an optional right-hand slot and body.

/** `(title, icon, body, o, right?) → Tile` bound to the screen helpers `ui`. */
export function dashboardTile(ui) {
  const { W, fill, inline } = ui
  return (title, icon, body, o, right = null) =>
    W(
      'Tile',
      { name: `Tile / ${title}`, width: 'fill_container', ...o },
      {
        icon: { icon },
        title: { content: title },
        right: right ? inline('Right', right) : { enabled: false },
        body: fill('Body', body, { gap: 12 }),
      },
    )
}
