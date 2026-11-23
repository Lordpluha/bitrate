// Artist workspace: AI promotion (spec apps/docs/docs/specs/ai-artist-promotion.md).
// A per-release plan (T-28 … T+28), post drafts per channel with UK/PL translations,
// the promotion profile and the cross-release calendar. Every element is a library instance.
import {
  L,
  Row,
  Col,
  Tx,
  Input,
  Select,
  Switch,
  Button,
  Badge,
  Tabs,
  Alert,
  Progress,
} from './ui.mjs'
import { ErrorState, EmptyState, FieldError, Skeleton } from './ui.mjs'
import {
  PageHeader,
  Status,
  Kv,
  Check,
  Option,
  DateRow,
  two,
  stats,
  panel,
  artistSpecs,
} from './artist-ui.mjs'
import { R } from './ui.mjs'
import { wsShell, wsTabs, releaseHead, PROMOTION_TAB } from './pages-artist.mjs'

const { pair, st } = artistSpecs({ pageHeight: 1900, stateHeight: 1200 })

const row = (title, desc, ...controls) =>
  R(
    'Setting Row',
    {},
    {
      title: { content: title },
      desc: desc ? { content: desc } : { enabled: false },
      control: L({ gap: 8, alignItems: 'center' }, controls),
    },
  )
const promoShell = (crumb, action, actionIcon = null) => ({
  nav: 'promotion',
  crumb: `Promotion / ${crumb}`,
  action,
  actionIcon,
})
const planShell = (crumb) => wsShell(crumb ? `Promotion / ${crumb}` : 'Promotion', 'Back to music')
const AI = () => Badge('Created with AI', 'outline')
const head = () => [
  releaseHead('Afterglow', 'Demo artist · Single · Release Sep 26, 2026 · 18:00 UTC', 'Scheduled'),
  wsTabs(PROMOTION_TAB),
]
const actions = (m) =>
  m
    ? [Button('Approve', 'outline')]
    : [Button('Approve', 'outline'), Button('Edit', 'ghost'), Button('Reject', 'ghost')]

/* ---------- plan content shared by the default and several states ---------- */
const phases = (m, { suggested = true } = {}) => [
  panel(
    'Before release · 4 weeks',
    [
      row(
        'T−21 · Sep 05 — Announce the release date',
        'Post · Instagram, Telegram',
        Status('Approved'),
        Button('Open post', 'ghost'),
      ),
      row(
        'T−14 · Sep 12 — Start the countdown on your artist page',
        'Bitrate · Countdown tile until the release goes live',
        Status('Approved'),
      ),
      row(
        'T−7 · Sep 19 — Share a 15-second hook from Afterglow',
        'Post · TikTok, YouTube Shorts',
        Status('Suggested', 'Info'),
        ...(suggested ? actions(m) : []),
      ),
      row(
        'T−3 · Sep 23 — Send the track to three music channel hosts you know',
        'Action · Off-platform · Edited by you',
        Status('Edited', 'Info'),
      ),
    ],
    { right: Badge('Phase 1', 'outline') },
  ),
  panel(
    'Release day',
    [
      row(
        'T0 · Sep 26 — Message your followers on Bitrate',
        'Bitrate · Sent once, with the new-release notification',
        Status('Suggested', 'Info'),
        ...(suggested ? [Button('Review message', 'outline')] : []),
      ),
      row(
        'T0 · Sep 26 — Post the release link',
        'Post · Instagram, TikTok, Telegram, YouTube Shorts',
        Status('Suggested', 'Info'),
        ...(suggested ? actions(m) : []),
      ),
    ],
    { right: Badge('Phase 2', 'outline') },
  ),
  panel(
    'After release · 4 weeks',
    [
      row(
        'T+3 · Sep 29 — Thank listeners and share a lyric line',
        'Post · Instagram, Telegram',
        Status('Suggested', 'Info'),
        ...(suggested ? actions(m) : []),
      ),
      row(
        'T+14 · Oct 10 — Pitch Afterglow to playlist curators',
        'Action · Rejected by you · Kept for your plan history',
        Status('Rejected', 'Neutral'),
      ),
    ],
    { right: Badge('Phase 3', 'outline') },
  ),
]
const planIntro = () =>
  Row({ gap: 8, width: 'fill_container' }, [
    AI(),
    Badge('Version 2', 'outline'),
    Tx('Caption', 'From your release details and promotion profile · Sep 01'),
  ])
const summary = (
  regenerate = Button('Regenerate suggested steps', 'outline', {
    icon: 'refresh-cw',
    width: 'fill_container',
  }),
) =>
  panel('Plan summary', [
    Kv('Release date', 'Sep 26, 2026'),
    Kv('Steps', '8 · 3 approved · 1 rejected'),
    Kv('Awaiting you', Status('4 suggested', 'Info')),
    regenerate,
    Tx('Caption', 'Regenerating replaces only suggested steps. Approved and edited steps stay.'),
  ])
const profileCard = () =>
  panel('Promotion profile', [
    Kv('Goal', 'Pre-release buzz'),
    Kv('Channels', 'Instagram · TikTok · Telegram · Shorts'),
    Kv('Weekly time', '3 hours'),
    Kv('Voice', 'Calm · direct · warm'),
    Button('Edit for this release', 'ghost', { width: 'fill_container' }),
  ])
const usage = (used = '$0.42', of = '$2.00') =>
  panel('AI allowance', [
    Kv('This month', `${used} of ${of}`),
    Progress(),
    Tx('Caption', 'Free plan · Resets Oct 1'),
  ])
const promise = () =>
  Alert(
    'Nothing is published for you',
    'Every step needs your approval. Bitrate never posts to your social accounts.',
  )

/* ---------- post content ---------- */
const CHANNELS = ['Instagram', 'TikTok', 'Telegram', 'YouTube Shorts']
const master = (m) =>
  panel(
    'English · master',
    [
      Input(
        'Caption',
        'Afterglow arrives Sep 26. A quiet song for the hours after midnight. Listen first on Bitrate.',
      ),
      Tx('Caption', '96 / 2,200 characters · Instagram limit'),
      Input('Hashtags', '#afterglow #newmusic #indie'),
      Row(
        { gap: 8 },
        m
          ? [
              Button('Copy', 'outline', { icon: 'copy' }),
              Button('Regenerate', 'ghost', { icon: 'refresh-cw' }),
            ]
          : [
              Button('Copy', 'outline', { icon: 'copy' }),
              Button('Download .txt', 'ghost', { icon: 'download' }),
              Button('Regenerate', 'ghost', { icon: 'refresh-cw' }),
            ],
      ),
    ],
    { right: AI() },
  )
const translations = (uk, pl) =>
  panel(
    'Translations',
    [
      row('Українська', uk[1], uk[0], Button('Open', 'ghost')),
      row('Polski', pl[1], pl[0], Button('Open', 'ghost')),
      Button('Add a language', 'ghost', { icon: 'plus' }),
      Tx(
        'Caption',
        'Translated from English. Track and artist names, hashtags and links stay as they are.',
      ),
    ],
    { right: Badge('Machine translation · please review', 'outline') },
  )
const UK_MACHINE = [Status('Machine', 'Info'), 'Machine translation · please review']
const PL_EDITED = [Status('Edited', 'Success'), 'Edited by you · kept when English changes']
const ukEditor = () =>
  panel('Українська', [
    Input(
      'Caption',
      'Afterglow виходить 26 вересня. Тиха пісня для годин після півночі. Слухай першим на Bitrate.',
    ),
    Tx('Caption', 'Kept unchanged: Afterglow · Bitrate · #afterglow'),
    Row({ gap: 8 }, [
      Tx('Caption', 'Is this translation good?'),
      Button('Good', 'ghost', { icon: 'thumbs-up' }),
      Button('Needs work', 'ghost', { icon: 'thumbs-down' }),
    ]),
  ])
const publishing = (status = Status('Not published', 'Neutral')) =>
  panel('Publishing', [
    Kv('Channel', 'Instagram'),
    Kv('Planned', 'Sep 05 · 18:00 Europe/Kyiv'),
    Kv('Status', status),
    Button('Mark as published', 'default', { width: 'fill_container' }),
    Tx('Caption', 'Bitrate does not post for you. Copy the text and publish it yourself.'),
  ])
const checks = () =>
  panel('Checks', [
    Check('Done', 'Only facts from your release'),
    Check('Done', 'Within the Instagram length limit'),
    Check('Done', 'Names and hashtags kept in translations'),
  ])
const postHead = () => [
  PageHeader('Announce the release date', 'T−21 · Sep 05 · Post for Afterglow'),
  Row({ gap: 8 }, [AI(), Status('Approved')]),
  Tabs(CHANNELS, 0),
]

/* ---------- profile form ---------- */
const profileForm = (m, { filled = true, errors = false } = {}) => [
  panel('Goal', [
    Option('Streams', 'More plays on Bitrate', false),
    Option('New followers', 'Grow the audience that hears your next release', false),
    Option('Pre-release buzz', 'Build anticipation before the release', filled),
  ]),
  panel('Channels you use', [
    Switch('Instagram', filled),
    Switch('TikTok', filled),
    Switch('Telegram', filled),
    Switch('YouTube Shorts', false),
    ...(errors ? [FieldError('Choose at least one channel.')] : []),
  ]),
  panel('Time and audience', [
    (m ? Col : Row)({ gap: 10, width: 'fill_container' }, [
      Select('Weekly time', filled ? '3 hours' : 'Choose'),
      Select('Main countries', filled ? 'Ukraine, Poland' : 'Release territories'),
    ]),
    Input(
      'Who listens',
      filled
        ? 'Late-night listeners who like quiet indie and lo-fi'
        : 'e.g. students who study to calm music',
    ),
  ]),
  panel('Voice', [
    Input('Three words', filled ? 'Calm, direct, warm' : 'e.g. calm, direct, warm'),
    Input(
      'Example post',
      filled ? 'Wrote this one at 3 a.m. It sounds like it.' : 'Paste a post you wrote',
    ),
    ...(errors
      ? [FieldError('This example contains a link or contact details. Remove them.')]
      : []),
    Input('Second example (optional)', 'Paste another post'),
    Tx('Caption', 'Examples help AI write the way you do. They are never published.'),
  ]),
]
const privacy = (button = Button('Save profile', 'default', { width: 'fill_container' })) =>
  panel('How Bitrate uses this', [
    Tx(
      'Paragraph',
      'Your profile, release details and public bio are sent to an AI model to draft plans and posts. Your email, listeners and payments are never sent.',
      { wrap: true },
    ),
    Kv('AI provider', 'Anthropic · USA'),
    Kv('Used for training', 'No'),
    button,
  ])

/* ---------- calendar ---------- */
const calendar = (m) => [
  PageHeader('Promotion', 'Upcoming steps from your release plans'),
  Tabs(['Upcoming', 'This month', 'Past'], 0),
  stats(m, [
    ['THIS WEEK', '3', 'Steps due'],
    ['APPROVED', '12', 'Across 2 releases'],
    ['AWAITING YOU', '5', 'Suggested steps'],
    ['AI ALLOWANCE', '$0.42', 'of $2.00 this month'],
  ]),
  ...two(
    m,
    [
      panel('This week', [
        DateRow(
          'SEP',
          '19',
          'Share a 15-second hook — Afterglow',
          'Post · TikTok, YouTube Shorts · Suggested',
        ),
        DateRow('SEP', '21', 'Behind the song — Night Signal', 'Post · Instagram · Approved'),
        DateRow(
          'SEP',
          '23',
          'Send the track to music channel hosts — Afterglow',
          'Action · Edited',
        ),
      ]),
      panel('Later', [
        DateRow('SEP', '26', 'Release day — Afterglow', 'Follower message · Post · Suggested'),
        DateRow(
          'OCT',
          '02',
          'Thank listeners — Afterglow',
          'Post · Instagram, Telegram · Suggested',
        ),
        DateRow('OCT', '17', 'Release day — Night Signal', 'Follower message · Approved'),
      ]),
    ],
    [
      panel('Active plans', [
        row('Afterglow', 'Single · Sep 26 · 8 steps', Status('Active'), Button('Open', 'ghost')),
        row('Night Signal', 'EP · Oct 17 · 11 steps', Status('Active'), Button('Open', 'ghost')),
      ]),
      panel('Scheduled without a plan', [
        row(
          'Midnight Drive',
          'Single · Nov 7',
          Status('No plan', 'Neutral'),
          Button('Create plan', 'outline'),
        ),
      ]),
      promise(),
    ],
  ),
]

export const artistPromotionPages = {
  'release-promotion': pair(
    'Release promotion',
    {
      title: 'Artist / Release promotion plan',
      route: 'planned — /dashboard/music/$releaseId?step=promotion',
      context:
        'AI plan from T−28 to T+28 around the release date; every step is approved, edited or rejected by the artist. Spec: ai-artist-promotion.',
      shell: planShell(null),
      mHeight: 2600,
    },
    (m) => [
      ...head(),
      ...two(m, [planIntro(), ...phases(m)], [summary(), profileCard(), usage(), promise()]),
    ],
    [
      st('No promotion profile', planShell(null), (_m) => [
        ...head(),
        EmptyState(
          'Set up your promotion profile',
          'Tell Bitrate your goal, channels and voice once. Every release plan uses it.',
          'Set up profile',
          'megaphone',
        ),
      ]),
      st('No release date', planShell(null), (_m) => [
        releaseHead('Afterglow', 'Demo artist · Single · No release date', 'Draft'),
        wsTabs(PROMOTION_TAB),
        EmptyState(
          'Pick a release date first',
          'A plan is built around the release date: four weeks before it and four weeks after.',
          'Choose release date',
          'calendar',
        ),
      ]),
      st('Ready to generate', planShell(null), (m) => [
        ...head(),
        ...two(
          m,
          [
            panel('Promotion plan', [
              Tx('H3', 'Plan the eight weeks around Afterglow'),
              Tx(
                'Paragraph',
                'AI suggests dated steps and post drafts from your release details and profile. You approve each one.',
                { wrap: true },
              ),
              Button('Generate promotion plan', 'default', { icon: 'sparkles' }),
              Tx('Caption', 'Uses about $0.10 of your monthly AI allowance.'),
            ]),
          ],
          [profileCard(), usage()],
        ),
      ]),
      st('Generating', planShell(null), (m) => [
        ...head(),
        Row({ gap: 8 }, [
          Status('Generating plan', 'Loading'),
          Tx('Caption', 'Up to a minute. You can leave this page.'),
        ]),
        Skeleton('list', m),
      ]),
      st('Generation failed', planShell(null), (_m) => [
        ...head(),
        ErrorState(
          'The plan could not be generated',
          'Your profile and earlier versions are kept, and nothing was taken from your allowance.',
          'Try again',
          'triangle-alert',
          null,
        ),
      ]),
      st('Allowance used', planShell(null), (m) => [
        ...head(),
        Alert(
          'Monthly AI allowance used',
          'You have used $2.00 of $2.00. It resets on Oct 1. Your approved steps and posts stay available.',
        ),
        ...two(
          m,
          [planIntro(), ...phases(m, { suggested: false })],
          [
            summary(Button('Regenerate unavailable', 'secondary', { width: 'fill_container' })),
            usage('$2.00'),
          ],
        ),
      ]),
      st('Regenerate a step', planShell(null), (m) => [
        ...head(),
        ...two(
          m,
          [
            panel('Regenerate this step', [
              Tx('Body Strong', 'T−7 · Sep 19 — Share a 15-second hook from Afterglow'),
              Input('What should change? (optional)', 'Shorter, no emoji'),
              Row({ gap: 8 }, [
                Button('Regenerate', 'default', { icon: 'refresh-cw' }),
                Button('Cancel', 'ghost'),
              ]),
              Tx('Caption', 'The current version stays in the plan history.'),
            ]),
            ...phases(m).slice(1),
          ],
          [summary(), usage()],
        ),
      ]),
      st('Follower message', planShell('Follower message'), (m) => [
        ...head(),
        ...two(
          m,
          [
            panel(
              'Message to your followers',
              [
                Input(
                  'Message',
                  'Afterglow is out. Thank you for waiting with me. This one is for the late nights.',
                ),
                Tx('Caption', '84 / 280 characters · Sent once, with the new-release notification'),
                Check('Pending', 'Approve before Sep 26, 18:00 UTC to include it'),
                Row({ gap: 8 }, [
                  Button('Approve message', 'default'),
                  Button('Regenerate', 'ghost', { icon: 'refresh-cw' }),
                  Button('Reject', 'ghost'),
                ]),
                Tx('Caption', 'Without approval, followers get the standard notification only.'),
              ],
              { right: AI() },
            ),
          ],
          [summary()],
        ),
      ]),
      st('Release date moved', planShell(null), (m) => [
        ...head(),
        Alert(
          'Release date moved to Oct 3',
          'Every step moved by 7 days. Check posts that mention a date.',
        ),
        ...two(m, [planIntro(), ...phases(m)], [summary(), usage()]),
      ]),
    ],
  ),

  'promotion-post': pair(
    'Promotion post',
    {
      title: 'Artist / Promotion post and translations',
      route: 'planned — /dashboard/music/$releaseId?step=promotion (post panel)',
      context:
        'English master per channel; UK and PL are machine translations the artist reviews. Edited translations are never overwritten.',
      shell: planShell('Post'),
      mHeight: 2400,
    },
    (m) => [
      ...postHead(),
      ...two(
        m,
        [master(m), translations(UK_MACHINE, PL_EDITED), ukEditor()],
        [publishing(), checks()],
      ),
    ],
    [
      st('Translating', planShell('Post'), (m) => [
        ...postHead(),
        ...two(
          m,
          [
            master(m),
            translations(
              [Status('Translating', 'Loading'), 'Translating from English…'],
              [Status('Queued', 'Queued'), 'Waiting for its turn'],
            ),
          ],
          [publishing()],
        ),
      ]),
      st('English changed', planShell('Post'), (m) => [
        ...postHead(),
        Alert(
          'English changed after these translations',
          'Review them. Your Polski edits are kept until you choose to update it.',
        ),
        ...two(
          m,
          [
            master(m),
            translations(
              [Status('Stale', 'Warning'), 'English changed · Update from English'],
              [Status('Stale', 'Warning'), 'Edited by you · English changed, review it'],
            ),
            Row({ gap: 8 }, [
              Button('Update Українська', 'outline', { icon: 'refresh-cw' }),
              Button('Review Polski', 'ghost'),
            ]),
          ],
          [publishing()],
        ),
      ]),
      st('Copied', planShell('Post'), (m) => [
        ...postHead(),
        Alert(
          'Copied to the clipboard',
          'Paste it into Instagram, then mark the step as published.',
        ),
        ...two(m, [master(m)], [publishing()]),
      ]),
      st('Published', planShell('Post'), (m) => [
        ...postHead(),
        ...two(
          m,
          [master(m), translations(UK_MACHINE, PL_EDITED)],
          [publishing(Status('Published')), checks()],
        ),
      ]),
      st('Channel draft failed', planShell('Post'), (_m) => [
        PageHeader('Announce the release date', 'T−21 · Sep 05 · Post for Afterglow'),
        Tabs(CHANNELS, 1),
        ErrorState(
          'The TikTok script could not be written',
          'The other channels are ready. Try this one again.',
          'Try again',
          'triangle-alert',
          null,
        ),
      ]),
      st('Post not found', planShell('Post'), (_m) => [
        ErrorState(
          'This post no longer exists',
          'It was removed when the plan was regenerated.',
          'Back to the plan',
          'file-x',
          null,
        ),
      ]),
    ],
  ),

  'promotion-profile': pair(
    'Promotion profile',
    {
      title: 'Artist / Promotion profile',
      route: 'planned — /dashboard/promotion/profile',
      context:
        'Set once per artist and overridable per release. States what is sent to the AI provider and what is not.',
      shell: promoShell('Profile', 'Save profile'),
      mHeight: 2200,
    },
    (m) => [
      PageHeader(
        'Promotion profile',
        'Used for every promotion plan. You can change it for one release.',
      ),
      ...two(m, profileForm(m), [privacy()]),
    ],
    [
      st('First visit', promoShell('Profile', 'Save profile'), (m) => [
        PageHeader(
          'Set up your promotion profile',
          'Five short answers. You can change them later.',
        ),
        Status('Not set up', 'Neutral'),
        ...two(m, profileForm(m, { filled: false }), [privacy()]),
      ]),
      st('Loading', promoShell('Profile'), (m) => [
        PageHeader('Promotion profile', 'Loading your profile…'),
        Skeleton('list', m),
      ]),
      st('Needs changes', promoShell('Profile', 'Save profile'), (m) => [
        PageHeader('Promotion profile', 'Two fields need changes before saving.'),
        ...two(m, profileForm(m, { errors: true }), [privacy()]),
      ]),
      st('Saving', promoShell('Profile'), (m) => [
        PageHeader(
          'Promotion profile',
          'Used for every promotion plan. You can change it for one release.',
        ),
        ...two(m, profileForm(m), [
          privacy(Button('Saving…', 'secondary', { width: 'fill_container' })),
          Status('Saving', 'Syncing'),
        ]),
      ]),
      st('Save failed', promoShell('Profile', 'Save profile'), (m) => [
        Alert('Profile not saved', 'Your changes are still here. Try again.'),
        ...two(m, profileForm(m), [privacy()]),
      ]),
    ],
  ),

  'promotion-overview': pair(
    'Promotion',
    {
      title: 'Artist / Promotion calendar',
      route: 'planned — /dashboard/promotion',
      context: 'Upcoming plan steps across releases; nothing is posted automatically.',
      shell: promoShell('Overview', 'Promotion profile'),
    },
    (m) => calendar(m),
    [
      st('No plans yet', promoShell('Overview', 'Promotion profile'), (_m) => [
        PageHeader('Promotion', 'Upcoming steps from your release plans'),
        EmptyState(
          'No promotion plans yet',
          'Schedule a release, then generate a plan from its Promotion step.',
          'Open music',
          'megaphone',
        ),
      ]),
      st('No promotion profile', promoShell('Overview'), (_m) => [
        PageHeader('Promotion', 'Upcoming steps from your release plans'),
        EmptyState(
          'Set up your promotion profile',
          'Tell Bitrate your goal, channels and voice once. Every release plan uses it.',
          'Set up profile',
          'megaphone',
        ),
      ]),
      st('Loading', promoShell('Overview'), (m) => [
        PageHeader('Promotion', 'Loading your plans…'),
        Skeleton('list', m),
      ]),
      st('Load failed', promoShell('Overview'), (_m) => [
        ErrorState(
          'Promotion could not be loaded',
          'Check your connection and try again.',
          'Try again',
          'triangle-alert',
          null,
        ),
      ]),
    ],
  ),
}
