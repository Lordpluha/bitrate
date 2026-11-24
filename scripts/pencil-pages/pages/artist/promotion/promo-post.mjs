// Promotion post content: the English master per channel, the machine translations (Українська, Polski)
// the artist reviews, the Ukrainian editor, publishing (done by the artist, never by Bitrate) and checks.

const CHANNELS = ['Instagram', 'TikTok', 'Telegram', 'YouTube Shorts']

/** Post tiles bound to the screen helpers `ui` and `frames`. */
export function postBlocks(ui, frames) {
  const { Row, Tx, P, Btn, St, AI, Tile, Setting, KV, Field, Check, Tabs } = ui
  const master = (m) =>
    Tile(
      'English · master',
      'languages',
      [
        Field(
          'Caption',
          'Afterglow arrives Sep 26. A quiet song for the hours after midnight. Listen first on Bitrate.',
          'Textarea',
        ),
        Tx('Caption', '96 / 2,200 characters · Instagram limit'),
        Field('Hashtags', '#afterglow #newmusic #indie'),
        Row(
          { name: 'Actions' },
          [
            Btn('Copy', 'Secondary', 'copy'),
            m ? null : Btn('Download .txt', 'Ghost', 'download'),
            Btn('Regenerate', 'Ghost', 'refresh-cw'),
          ].filter(Boolean),
        ),
      ],
      { right: [AI()], hue: true },
    )
  const translations = ([ukStatus, ukDesc], [plStatus, plDesc]) =>
    Tile(
      'Translations',
      'globe',
      [
        Setting('Українська', ukDesc, ukStatus, Btn('Open', 'Compact Ghost', 'arrow-up-right')),
        Setting('Polski', plDesc, plStatus, Btn('Open', 'Compact Ghost', 'arrow-up-right')),
        Row({ name: 'Add' }, [Btn('Add a language', 'Ghost', 'plus')]),
        P(
          'Caption',
          'Translated from English. Track and artist names, hashtags and links stay as they are.',
        ),
      ],
      { right: [St('Neutral', 'Machine translation · please review', 'bot')] },
    )
  const ukMachine = () => [
    St('Processing', 'Machine', 'bot'),
    'Machine translation · please review',
  ]
  const plEdited = () => [
    St('Ready', 'Edited', 'pencil'),
    'Edited by you · kept when English changes',
  ]
  const ukEditor = () =>
    Tile('Українська', 'pen-line', [
      Field(
        'Caption',
        'Afterglow виходить 26 вересня. Тиха пісня для годин після півночі. Слухай першим на Bitrate.',
        'Textarea',
      ),
      Tx('Caption', 'Kept unchanged: Afterglow · Bitrate · #afterglow'),
      Row({ name: 'Feedback' }, [
        Tx('Caption', 'Is this translation good?'),
        Btn('Good', 'Compact Ghost', 'thumbs-up'),
        Btn('Needs work', 'Compact Ghost', 'thumbs-down'),
      ]),
    ])
  const publishing = (status = St('Neutral', 'Not published', 'circle-dashed')) =>
    Tile('Publishing', 'send', [
      KV('Channel', 'Instagram'),
      KV('Planned', 'Sep 05 · 18:00 Europe/Kyiv'),
      KV('Status', status),
      Btn('Mark as published', 'Primary', 'check', { width: 'fill_container' }),
      P('Caption', 'Bitrate does not post for you. Copy the text and publish it yourself.'),
    ])
  const checks = () =>
    Tile('Checks', 'shield-check', [
      Check(true, 'Only facts from your release'),
      Check(true, 'Within the Instagram length limit'),
      Check(true, 'Names and hashtags kept in translations'),
    ])
  const back = () => Btn('Back to the plan', 'Ghost', 'arrow-left')
  /* on a phone the back link stacks above the title instead of sharing its row */
  const postHead = (m, channel = 0) => [
    ...(m ? [back()] : []),
    frames.pageHead(
      'Announce the release date',
      'T−21 · Sep 05 · Post for Afterglow',
      m ? [] : [back()],
    ),
    Row({ name: 'Post State' }, [AI(), St('Ready', 'Approved', 'circle-check')]),
    Tabs(m ? [...CHANNELS.slice(0, 3), 'Shorts'] : CHANNELS, channel),
  ]
  return { master, translations, ukMachine, plEdited, ukEditor, publishing, checks, postHead }
}
