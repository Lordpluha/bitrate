// The profile page body (views/ProfileView ProfileCard, features/edit-profile ProfileForm and
// ProfileImageField, ProfileCompilations): the full-width preview card with the photo and header image
// fields inside it, then Details (3fr) beside Links (2fr), the actions row with its inline status or
// error, and the Compilations panel.

const LINKS = [
  ['globe', 'Website', 'https://mirasol.fm'],
  ['instagram', 'Instagram', 'https://instagram.com/mirasol'],
  ['twitter', 'X', ''],
  ['youtube', 'YouTube', 'https://youtube.com/@mirasol'],
  ['music-2', 'TikTok', ''],
  ['cloud', 'SoundCloud', 'https://soundcloud.com/mirasol'],
]
const BIO = 'Synth-pop from Warsaw. New single Night Signal out December 12.'

/** Profile builders bound to the screen helpers `ui`. */
export function profileForm(ui) {
  const { W, P, Tx, Row, Col, inline, fill, Btn, Field, Tile } = ui
  const image = (wide, error) =>
    W(
      wide ? 'Field/Image Wide' : 'Field/Image',
      { name: wide ? 'Header image' : 'Profile photo', width: 'fill_container' },
      {
        ...(error ? { hint: { content: 'Choose a JPEG, PNG or WebP image up to 10 MB.' } } : {}),
        action: inline('Action', [Btn('Replace', 'Compact Outline', 'upload')]),
      },
    )
  const card = (m, o = {}) =>
    W(
      'Profile/Card',
      { name: 'Profile card', width: 'fill_container' },
      {
        handle: { content: `@${o.handle ?? 'mirasol'}` },
        bio: { content: o.noBio ? 'No bio yet.' : BIO },
        links: inline(
          'Links',
          ['Website', 'Instagram', 'YouTube', 'SoundCloud'].map((l) =>
            W('Chip', { name: `Link / ${l}` }, { label: { content: l } }),
          ),
        ),
        images: fill('Images', [image(false, o.imageError), image(true)], {
          layout: m ? 'vertical' : 'horizontal',
          gap: 20,
          padding: [0, 20, 20, 20],
        }),
      },
    )
  const details = (m, o) =>
    Tile('Details', 'id-card', [
      (m ? Col : Row)(
        { name: 'Handle and country', gap: 20, width: 'fill_container', alignItems: 'start' },
        [
          Col({ name: 'Handle', gap: 4, width: 'fill_container' }, [
            Field(
              'Handle',
              o.handle ?? 'mirasol',
              o.handleError ? 'Input Error' : 'Input',
              o.handleError,
            ),
            P('Caption', 'Shown as @handle on your public page.'),
          ]),
          Field('Country', 'Poland', 'Select'),
        ],
      ),
      Field('Bio', o.noBio ? '' : BIO, 'Textarea'),
    ])
  const links = () =>
    Tile(
      'Links',
      'link-2',
      LINKS.map(([icon, label, value]) =>
        W(
          'Field/Link',
          { name: `Link / ${label}`, width: 'fill_container' },
          { icon: { icon }, label: { content: label }, value: { content: value || 'https://' } },
        ),
      ),
    )
  /* `o.status` / `o.error`: the inline text before the buttons */
  const actions = (o) =>
    Row({ name: 'Actions', gap: 12, width: 'fill_container', justifyContent: 'end' }, [
      ...(o.error ? [Tx('Error', o.error)] : o.saved ? [Tx('Muted', 'Profile saved.')] : []),
      Btn('Discard changes', 'Ghost'),
      Btn(o.busy ? 'Saving…' : 'Save profile', 'Primary'),
    ])
  const editor = (m, o = {}) => [
    card(m, o),
    m
      ? Col({ name: 'Form', gap: 16, width: 'fill_container' }, [details(m, o), links()])
      : Row({ name: 'Form', gap: 20, width: 'fill_container', alignItems: 'start' }, [
          Col({ name: 'Details column', width: 640 }, [details(m, o)]),
          Col({ name: 'Links column', width: 'fill_container' }, [links()]),
        ]),
    actions(o),
  ]
  const compilations = () =>
    Tile('Compilations', 'library', [
      P(
        'Muted',
        'Bring your released tracks together in a new collection, from a Best Of to a selection of favourites.',
      ),
      P('Caption', 'Original recordings, listening history and likes stay with your tracks.'),
      Btn('Create compilation', 'Primary'),
    ])
  return { editor, compilations }
}
