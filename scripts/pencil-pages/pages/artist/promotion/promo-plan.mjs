// Release promotion plan content (spec apps/docs/docs/specs/ai-artist-promotion.md): the dated steps of
// the three phases, the plan summary, the promotion profile, the AI allowance and the promise that
// nothing is published for the artist. Shared by the plan page and its states.

/** Plan tiles bound to the screen helpers `ui`. */
export function planBlocks(ui) {
  const { Row, Col, Tx, Btn, St, AI, Tile, Setting, KV, Alert, Progress } = ui
  const state = {
    Approved: () => St('Ready', 'Approved', 'circle-check'),
    Suggested: () => St('Brand', 'Suggested', 'sparkles'),
    Edited: () => St('Processing', 'Edited', 'pencil'),
    Rejected: () => St('Neutral', 'Rejected', 'circle-x'),
  }
  /* on a phone the state and actions wrap under the step text so the title keeps the row width */
  const step = (m, title, desc, ...controls) =>
    m
      ? Col({ name: `Step / ${title.slice(0, 24)}`, gap: 8, width: 'fill_container' }, [
          Setting(title, desc),
          Row({ name: 'Step actions', gap: 8, alignItems: 'center' }, controls),
        ])
      : Setting(title, desc, ...controls)
  const actions = (m) =>
    m
      ? [Btn('Approve', 'Compact Secondary', 'check')]
      : [
          Btn('Approve', 'Compact Secondary', 'check'),
          Btn('Edit', 'Compact Ghost', 'pencil'),
          Btn('Reject', 'Compact Ghost', 'x'),
        ]
  const phases = (m, { suggested = true } = {}) => [
    Tile(
      'Before release · 4 weeks',
      'hourglass',
      [
        step(
          m,
          'T−21 · Sep 05 — Announce the release date',
          'Post · Instagram, Telegram',
          state.Approved(),
          Btn('Open post', 'Compact Ghost', 'arrow-up-right'),
        ),
        step(
          m,
          'T−14 · Sep 12 — Start the countdown on your artist page',
          'Bitrate · Countdown tile until the release goes live',
          state.Approved(),
        ),
        step(
          m,
          'T−7 · Sep 19 — Share a 15-second hook from Afterglow',
          'Post · TikTok, YouTube Shorts',
          state.Suggested(),
          ...(suggested ? actions(m) : []),
        ),
        step(
          m,
          'T−3 · Sep 23 — Send the track to three music channel hosts you know',
          'Action · Off-platform · Edited by you',
          state.Edited(),
        ),
      ],
      { right: [St('Neutral', 'Phase 1', 'flag')] },
    ),
    Tile(
      'Release day',
      'rocket',
      [
        step(
          m,
          'T0 · Sep 26 — Message your followers on Bitrate',
          'Bitrate · Sent once, with the new-release notification',
          state.Suggested(),
          ...(suggested ? [Btn('Review message', 'Compact Secondary')] : []),
        ),
        step(
          m,
          'T0 · Sep 26 — Post the release link',
          'Post · Instagram, TikTok, Telegram, YouTube Shorts',
          state.Suggested(),
          ...(suggested ? actions(m) : []),
        ),
      ],
      { right: [St('Neutral', 'Phase 2', 'flag')] },
    ),
    Tile(
      'After release · 4 weeks',
      'trending-up',
      [
        step(
          m,
          'T+3 · Sep 29 — Thank listeners and share a lyric line',
          'Post · Instagram, Telegram',
          state.Suggested(),
          ...(suggested ? actions(m) : []),
        ),
        step(
          m,
          'T+14 · Oct 10 — Pitch Afterglow to playlist curators',
          'Action · Rejected by you · Kept for your plan history',
          state.Rejected(),
        ),
      ],
      { right: [St('Neutral', 'Phase 3', 'flag')] },
    ),
  ]
  const planIntro = () =>
    Row({ name: 'Plan Intro', width: 'fill_container' }, [
      AI(),
      St('Neutral', 'Version 2', 'history'),
      Tx('Caption', 'From your release details and promotion profile · Sep 01'),
    ])
  const regenerate = () =>
    Btn('Regenerate suggested steps', 'Secondary', 'refresh-cw', { width: 'fill_container' })
  const summary = (button = regenerate()) =>
    Tile(
      'Plan summary',
      'list-checks',
      [
        KV('Release date', 'Sep 26, 2026'),
        KV('Steps', '8 · 3 approved · 1 rejected'),
        KV('Awaiting you', St('Brand', '4 suggested', 'sparkles')),
        button,
        ui.P(
          'Caption',
          'Regenerating replaces only suggested steps. Approved and edited steps stay.',
        ),
      ],
      { hue: true },
    )
  const profileCard = () =>
    Tile('Promotion profile', 'id-card', [
      KV('Goal', 'Pre-release buzz'),
      KV('Channels', 'Instagram · TikTok · Telegram · Shorts'),
      KV('Weekly time', '3 hours'),
      KV('Voice', 'Calm · direct · warm'),
      Btn('Edit for this release', 'Ghost', 'pencil', { width: 'fill_container' }),
    ])
  const usage = (used = '$0.42', bar = 66) =>
    Tile('AI allowance', 'gauge', [
      KV('This month', `${used} of $2.00`),
      Progress(bar),
      Tx('Caption', 'Free plan · Resets Oct 1'),
    ])
  const promise = () =>
    Alert(
      'Info',
      'Nothing is published for you',
      'Every step needs your approval. Bitrate never posts to your social accounts.',
    )
  return { phases, planIntro, summary, profileCard, usage, promise }
}
