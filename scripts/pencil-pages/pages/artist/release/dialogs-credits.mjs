// Release dialogs for people, rights and catalogue (features/edit-release, release-media): add or edit a
// contributor, credit me alone, remove a contributor, splits, rights, the release UPC and the
// compilation picker. Each builder returns the modal for desktop or phone (`m`).

const ROLES = [
  ['Performer', true],
  ['Producer', true],
  ['Composer', false],
  ['Lyricist', false],
  ['Other', false],
]

/** Credits, rights and picker dialog builders bound to the screen helpers `ui` and the release kit `k`. */
export function creditDialogs(ui, k) {
  const { W, P, Row, Col, Btn, Field, Option } = ui
  const save = (label) => [Btn('Cancel', 'Ghost'), Btn(label, 'Primary')]
  const share = (name, value) => Field(`${name} Master share`, value)
  const pick = (selected, title, meta) =>
    W(
      selected ? 'Row/Pick Selected' : 'Row/Pick',
      { name: `Pick / ${title}`, width: 'fill_container' },
      { title: { content: title }, meta: { content: meta } },
    )
  return {
    contributor: (m, error = false) =>
      k.modal(
        m,
        error ? 'Edit contributor' : 'Add contributor',
        [
          P('Muted', 'Credit a person involved in this release and assign at least one role.'),
          Field('Contributor name', 'Kite Harbor'),
          P('Body Strong', 'Assigned roles'),
          Row(
            { name: 'Roles', gap: 6 },
            ROLES.map(([role, on]) =>
              W(
                on && !error ? 'Chip/Toggle On' : 'Chip/Toggle',
                { name: `Role / ${role}` },
                { label: { content: role } },
              ),
            ),
          ),
          ...(error
            ? [
                W(
                  'Field/Error',
                  { name: 'Roles error' },
                  { text: { content: 'Choose at least one role.' } },
                ),
              ]
            : [P('Caption', 'Choose at least one role.')]),
          P(
            'Caption',
            'Credits do not grant workspace access. Shares are set in the master split.',
          ),
        ],
        save('Save contributor'),
      ),
    creditSelf: (m) =>
      k.modal(
        m,
        'I made it myself',
        [
          P(
            'Muted',
            'Credit Mira Sol as performer, composer and lyricist with 100% of the master. You can add collaborators and divide the share later.',
          ),
        ],
        save('Credit me alone'),
        440,
      ),
    removeContributor: (m) =>
      k.modal(
        m,
        'Remove contributor',
        [
          P(
            'Muted',
            'Remove Kite Harbor from the release? Their master share is removed, so the split must add up to 100% again.',
          ),
        ],
        [Btn('Keep contributor', 'Ghost'), Btn('Remove', 'Danger', 'trash-2')],
        440,
      ),
    splits: (m, over = false) =>
      k.modal(
        m,
        'Splits',
        [
          P(
            'Muted',
            'Master is the money from the recording itself. The shares must reach exactly 100% before review; a draft can stay below.',
          ),
          share('Mira Sol', over ? '80' : '75'),
          share('Kite Harbor', '25'),
          W(
            over ? 'Split/Total Short' : 'Split/Total',
            { name: 'Total', width: 'fill_container' },
            over
              ? { label: { content: 'Master total 105 of 100%' }, 'bar.bar': { width: 440 } }
              : { label: { content: 'Master total 100 of 100%' } },
          ),
          ...(over
            ? [
                W(
                  'Field/Error',
                  { name: 'Overflow' },
                  { text: { content: 'Master shares cannot exceed 100%.' } },
                ),
              ]
            : []),
        ],
        save('Save splits'),
      ),
    rights: (m) =>
      k.modal(
        m,
        'Rights confirmation',
        [
          P('Muted', 'Confirm who owns the recording before review.'),
          P('Body Strong', 'Who controls the master recording?'),
          Option('Mira Sol (this artist)', 'Master owner: Mira Sol (this artist)', true),
          Option('Another owner, such as a label', 'Master owner name', false),
          P(
            'Caption',
            'You confirm the whole draft is accurate once, when you submit it for review.',
          ),
        ],
        save('Save rights'),
      ),
    upc: (m, error = false) =>
      k.modal(
        m,
        'Release barcode',
        [
          Field(
            'Release UPC/EAN',
            error ? '19658940218' : '196589402184',
            error ? 'Input Error' : 'Input',
            error ? 'Enter 12 or 13 digits with a valid check digit.' : undefined,
          ),
          P(
            'Caption',
            'Optional. 12-digit UPC or 13-digit EAN. Leave empty if your distributor will assign one.',
          ),
        ],
        save('Save code'),
        440,
      ),
    compilation: (m, o = {}) =>
      k.modal(
        m,
        'Build a compilation',
        [
          P(
            'Muted',
            'Choose your published recordings. Their audio, ISRC, likes and listening history stay the same. The compilation has its own artwork and still goes through review.',
          ),
          W(
            'Field/Search',
            { name: 'Find a recording', width: 'fill_container' },
            { value: { content: 'Find a recording' } },
          ),
          ...(o.empty
            ? [P('Muted', 'No published recordings match your search.')]
            : [
                Col({ name: 'Recordings', gap: 4, width: 'fill_container' }, [
                  pick(true, 'Afterglow', 'Afterglow · Remaster · 3:57'),
                  pick(true, 'Echoes in Motion', 'Echoes in Motion · Original · 4:05'),
                  pick(false, 'Low Tide', 'Echoes in Motion · Original · 3:18'),
                ]),
              ]),
          P('Caption', 'Selected: 2. You can add up to 50 recordings.'),
        ],
        [Btn('Cancel', 'Ghost'), Btn('Add recordings (2)', 'Primary', 'plus')],
      ),
  }
}
