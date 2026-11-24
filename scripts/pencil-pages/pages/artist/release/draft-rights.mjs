// Draft panels for people and ownership (WorkspaceCredits, WorkspaceRights): credits with the master
// split total, per-person edit and remove, the "Needs role" badge with "Edit roles"; rights with the
// master owner confirmation and the identifiers. Edit actions only while the release is a draft.

/** Credits and rights builders bound to the screen helpers `ui` and the release kit `k`. */
export function draftRights(ui, k) {
  const { W, P, Row, inline, Btn, Tx } = ui
  const draft = (o) => o.status === 'draft' || o.status === 'draftReady'
  const credit = (o, name, initials, roles, share, needs = false) =>
    W(
      needs ? 'Row/Credit Needs Role' : 'Row/Credit',
      { name: `Credit / ${name}`, width: 'fill_container' },
      {
        'avatar.initials': { content: initials },
        name: { content: name },
        roles: { content: roles },
        share: { content: share },
        trail: draft(o)
          ? inline('Actions', [
              needs
                ? Btn('Edit roles', 'Compact Ghost')
                : W(
                    'Button/Icon',
                    { name: 'Edit', width: 30, height: 30 },
                    { icon: { icon: 'pencil' } },
                  ),
              W(
                'Button/Icon',
                { name: 'Remove', width: 30, height: 30 },
                { icon: { icon: 'trash-2' } },
              ),
            ])
          : { enabled: false },
      },
    )
  const credits = (o = {}) => {
    const people = !o.empty
    return k.tile(
      `Credits & splits (${people ? 2 : 0})`,
      'users-round',
      [
        P(
          'Muted',
          'Who made this release, what they did, and their share of the master (the recording).',
        ),
        ...(people
          ? [
              W(
                o.done ? 'Split/Total' : 'Split/Total Short',
                { name: 'Split total', width: 'fill_container' },
                { label: { content: o.done ? 'Master 100% of 100%' : 'Master 75% of 100%' } },
              ),
              credit(o, 'Mira Sol', 'MS', 'Performer · Producer · Master 75%', '75%'),
              o.done
                ? credit(o, 'Kite Harbor', 'KH', 'Composer · Master 25%', '25%')
                : credit(
                    o,
                    'Kite Harbor',
                    'KH',
                    'Needs role · No roles specified — Assign at least one role.',
                    '0%',
                    true,
                  ),
            ]
          : [
              P(
                'Body',
                `No credited participants yet.${draft(o) ? ' Made everything yourself? Credit yourself in one step; working with others, add each contributor.' : ''}`,
              ),
            ]),
        ...(draft(o)
          ? [
              Row({ name: 'Add', gap: 8 }, [
                ...(people ? [] : [Btn('I made it myself', 'Compact Outline', 'user-round-check')]),
                Btn('Add contributor', 'Compact Outline', 'user-plus'),
              ]),
            ]
          : []),
        P(
          'Caption',
          'Credits do not grant workspace access. Each split must reach exactly 100% before review.',
        ),
      ],
      {},
      draft(o) && people ? [Btn('Edit splits', 'Compact Ghost')] : [],
    )
  }
  const rights = (o = {}) =>
    k.tile(
      'Rights',
      'shield-check',
      [
        P('Muted', 'Who owns the recording.'),
        W(
          o.done ? 'Check/Done' : 'Check/Pending',
          { name: 'Master owner', width: 'fill_container' },
          {
            label: {
              content: o.done
                ? 'Master owner: Mira Sol (this artist) (confirmed)'
                : 'Master owner not chosen (not confirmed)',
            },
          },
        ),
        Tx('Body Strong', 'Identifiers · optional'),
        Row({ name: 'UPC', gap: 8, width: 'fill_container' }, [
          P('Body', `UPC/EAN: ${o.done ? '196589402184' : 'Not provided'}`),
          ...(draft(o) ? [Tx('Link Underline', 'Edit UPC')] : []),
        ]),
        P(
          'Caption',
          "Store barcodes and track ISRCs are optional here; each track's ISRC is set in Tracks.",
        ),
      ],
      {},
      draft(o) ? [Btn('Edit rights', 'Compact Ghost')] : [],
    )
  return { credits, rights }
}
