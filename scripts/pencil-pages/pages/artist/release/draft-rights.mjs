// Draft tiles for people and ownership (WorkspaceCredits, WorkspaceRights): credits with the master
// split total and the role warning, and rights with the master owner and the UPC.

/** Credits and rights tile builders bound to the screen helpers `ui` and the release kit `k`. */
export function draftRights(ui, k) {
  const { W, P, inline, Btn } = ui
  const act = (o, label, icon, variant = 'Compact Ghost') =>
    o.locked ? [] : [Btn(label, variant, icon)]
  const credit = (name, initials, roles, share, needs = false) =>
    W(
      needs ? 'Row/Credit Needs Role' : 'Row/Credit',
      { name: `Credit / ${name}`, width: 'fill_container' },
      {
        'avatar.initials': { content: initials },
        name: { content: name },
        roles: { content: roles },
        share: { content: share },
        trail: inline('Actions', [
          W('Button/Icon', { name: 'Edit', width: 30, height: 30 }, { icon: { icon: 'pencil' } }),
        ]),
      },
    )
  const credits = (o = {}) =>
    k.tile(
      'Credits & splits',
      'users-round',
      [
        P(
          'Muted',
          'Who made this release, what they did, and their share of the master (the recording).',
        ),
        ...(o.empty
          ? [
              P(
                'Body',
                'No credited participants yet. Made everything yourself? Credit yourself in one step; working with others, add each contributor.',
              ),
              Btn('I made it myself', 'Outline', 'user-check'),
              Btn('Add contributor', 'Ghost', 'user-plus'),
            ]
          : [
              W(o.complete ? 'Split/Total' : 'Split/Total Short', {
                name: 'Split total',
                width: 'fill_container',
              }),
              credit('Mira Sol', 'MS', 'Performer · Producer · Master 75%', '75%'),
              o.complete
                ? credit('Kite Harbor', 'KH', 'Composer · Master 25%', '25%')
                : credit('Kite Harbor', 'KH', 'Assign at least one role.', '0%', true),
            ]),
        P(
          'Caption',
          'Credits do not grant workspace access. Each split must reach exactly 100% before review.',
        ),
      ],
      {},
      act(o, 'Edit splits', 'percent'),
    )
  const rights = (o = {}) =>
    k.tile('Rights', 'shield-check', [
      P('Muted', 'Who owns the recording.'),
      W(
        'Row/Identifier',
        { name: 'Master owner', width: 'fill_container' },
        {
          label: { content: 'Master owner' },
          value: {
            content: o.complete ? 'Mira Sol (this artist) (confirmed)' : 'Master owner not chosen',
          },
          trail: o.locked
            ? { enabled: false }
            : inline('Trail', [Btn('Edit rights', 'Compact Ghost', 'pencil')]),
        },
      ),
      W(
        'Row/Identifier',
        { name: 'UPC', width: 'fill_container' },
        {
          label: { content: 'Identifiers · optional — UPC/EAN:' },
          value: { content: o.complete ? '196589402184' : 'Not provided' },
          trail: o.locked
            ? { enabled: false }
            : inline('Trail', [Btn('Edit UPC', 'Compact Ghost', 'barcode')]),
        },
      ),
      P(
        'Caption',
        "Store barcodes and track ISRCs are optional here; each track's ISRC is set in Tracks.",
      ),
    ])
  return { credits, rights }
}
