// Promotion profile content: goal, channels, time and audience, voice (examples never published), and
// what Bitrate sends to the AI provider and what it never sends.

/** Profile tiles bound to the screen helpers `ui`. */
export function profileBlocks(ui) {
  const { Row, Col, P, Btn, Tile, KV, Field, Switch, Option, W } = ui
  const form = (m, { filled = true, errors = false } = {}) => [
    Tile('Goal', 'target', [
      Option('Streams', 'More plays on Bitrate', false),
      Option('New followers', 'Grow the audience that hears your next release', false),
      Option('Pre-release buzz', 'Build anticipation before the release', filled),
    ]),
    Tile('Channels you use', 'share-2', [
      Switch('Instagram', filled),
      Switch('TikTok', filled),
      Switch('Telegram', filled),
      Switch('YouTube Shorts', false),
      ...(errors
        ? [
            W(
              'Field/Error',
              { name: 'Error / Channels' },
              { text: { content: 'Choose at least one channel.' } },
            ),
          ]
        : []),
    ]),
    Tile('Time and audience', 'clock', [
      (m ? Col : Row)({ name: 'Pair', width: 'fill_container', gap: 12 }, [
        Field('Weekly time', filled ? '3 hours' : 'Choose', 'Select'),
        Field('Main countries', filled ? 'Ukraine, Poland' : 'Release territories', 'Select'),
      ]),
      Field(
        'Who listens',
        filled
          ? 'Late-night listeners who like quiet indie and lo-fi'
          : 'e.g. students who study to calm music',
      ),
    ]),
    Tile('Voice', 'audio-lines', [
      Field('Three words', filled ? 'Calm, direct, warm' : 'e.g. calm, direct, warm'),
      errors
        ? Field(
            'Example post',
            'Wrote this one at 3 a.m. It sounds like it. bitrate.fm/afterglow',
            'Input Error',
            'This example contains a link or contact details. Remove them.',
          )
        : Field(
            'Example post',
            filled ? 'Wrote this one at 3 a.m. It sounds like it.' : 'Paste a post you wrote',
            'Textarea',
          ),
      Field('Second example (optional)', 'Paste another post', 'Textarea'),
      P('Caption', 'Examples help AI write the way you do. They are never published.'),
    ]),
  ]
  const privacy = (button = Btn('Save profile', 'Primary', 'check', { width: 'fill_container' })) =>
    Tile(
      'How Bitrate uses this',
      'shield-check',
      [
        P(
          'Muted',
          'Your profile, release details and public bio are sent to an AI model to draft plans and posts. Your email, listeners and payments are never sent.',
        ),
        KV('AI provider', 'Anthropic · USA'),
        KV('Used for training', 'No'),
        button,
      ],
      { hue: true },
    )
  const saving = () => Btn('Saving…', 'Secondary', 'loader-circle', { width: 'fill_container' })
  return { form, privacy, saving }
}
