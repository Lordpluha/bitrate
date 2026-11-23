// The profile form (features/edit-profile ProfileForm + ProfileImageField) and the preview card
// (views/ProfileView ProfileCard): photo and header image, handle, country, bio and the six links, with
// Save / Discard and the form's notices.

const LINKS = [
  ['globe', 'Website', 'https://mirasol.fm'],
  ['instagram', 'Instagram', 'https://instagram.com/mirasol'],
  ['twitter', 'X', 'https://'],
  ['youtube', 'YouTube', 'https://youtube.com/@mirasol'],
  ['music-2', 'TikTok', 'https://'],
  ['cloud', 'SoundCloud', 'https://soundcloud.com/mirasol'],
]

/** Profile builders bound to the screen helpers `ui`. */
export function profileForm(ui) {
  const { W, P, Row, Col, inline, Btn, Field, Tile } = ui
  const card = (m, o = {}) =>
    Col({ name: 'Preview', gap: 8, width: m ? 'fill_container' : 400 }, [
      P('Caption', 'Preview · unsaved changes are shown but not published'),
      W(
        'Profile/Card',
        { name: 'Profile card', width: 'fill_container' },
        {
          handle: { content: `@${o.handle ?? 'mirasol'}` },
          bio: {
            content: o.bio ?? 'Synth-pop from Warsaw. New single Night Signal out November 14.',
          },
          links: inline(
            'Links',
            ['Website', 'Instagram', 'YouTube', 'SoundCloud'].map((l) =>
              W('Chip', { name: `Link / ${l}` }, { label: { content: l } }),
            ),
          ),
        },
      ),
    ])
  const image = (wide, error) =>
    W(
      wide ? 'Field/Image Wide' : 'Field/Image',
      { name: wide ? 'Header image' : 'Profile photo', width: 'fill_container' },
      {
        ...(error ? { hint: { content: 'Choose a JPEG, PNG or WebP image up to 10 MB.' } } : {}),
        action: inline('Action', [Btn('Replace', 'Compact Outline', 'upload')]),
      },
    )
  const form = (o = {}) => [
    Tile('Details', 'id-card', [
      image(false, o.imageError),
      image(true),
      Field(
        'Handle',
        o.handle ?? 'mirasol',
        o.handleError ? 'Input Error' : 'Input',
        o.handleError,
      ),
      P('Caption', 'Shown as @handle on your public page.'),
      Field('Country', 'Poland', 'Select'),
      Field('Bio', 'Synth-pop from Warsaw. New single Night Signal out November 14.', 'Textarea'),
    ]),
    Tile(
      'Links',
      'link-2',
      LINKS.map(([icon, label, value]) =>
        W(
          'Field/Link',
          { name: `Link / ${label}`, width: 'fill_container' },
          { icon: { icon }, label: { content: label }, value: { content: value } },
        ),
      ),
    ),
    ...(o.notice ? [o.notice] : []),
    Row({ name: 'Actions', gap: 10, width: 'fill_container', justifyContent: 'end' }, [
      Btn('Discard changes', 'Ghost'),
      Btn(o.busy ? 'Saving…' : 'Save profile', 'Primary', o.busy ? 'loader-circle' : 'check'),
    ]),
  ]
  const editor = (m, o = {}) =>
    (m ? Col : Row)({ name: 'Editor', gap: 20, width: 'fill_container', alignItems: 'start' }, [
      card(m, o),
      Col({ name: 'Form', gap: 20, width: 'fill_container' }, form(o)),
    ])
  const compilations = () =>
    Tile('Compilations', 'library-big', [
      P(
        'Muted',
        'Bring your released tracks together in a new collection, from a Best Of to a selection of favourites.',
      ),
      P('Caption', 'Original recordings, listening history and likes stay with your tracks.'),
      Btn('Create compilation', 'Outline', 'plus'),
    ])
  return { editor, compilations }
}
