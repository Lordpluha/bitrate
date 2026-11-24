// The workspace modal (shared/ui/WorkspaceModal) with its title, body and footer actions; shared by the
// music dialogs and the overlay pages. Modals are drawn in flow where they open: centred over the
// page they cover.

/** Modal builder bound to the screen helpers `ui`: `(m, title, body, footer = []) → node`. */
export function workspaceModal(ui) {
  const { W, Row, fill } = ui
  return (m, title, body, footer = [], width = 520) =>
    Row(
      {
        name: 'Modal Layer',
        width: 'fill_container',
        justifyContent: 'center',
        padding: m ? 0 : [24, 0],
      },
      [
        W(
          'Modal',
          { name: `Modal / ${title.slice(0, 24)}`, width: m ? 'fill_container' : width },
          {
            title: { content: title },
            body: fill('Body', body, { gap: 14 }),
            footer: footer.length
              ? fill('Footer', footer, { layout: 'horizontal', gap: 10, justifyContent: 'end' })
              : { enabled: false },
          },
        ),
      ],
    )
}
