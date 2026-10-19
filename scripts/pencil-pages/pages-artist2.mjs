// Artist workspace, part 2: profile, settings, promotion, analytics, search, notifications.
import { img } from './kit.mjs'
import {
  R,
  L,
  Row,
  Col,
  Tx,
  Panel,
  Input,
  Select,
  Switch,
  Button,
  Badge,
  Tab,
  Alert,
  ErrorState,
  EmptyState,
  FieldError,
  CheckRow,
  Skeleton,
  state,
  ART,
} from './ui.mjs'
import {
  Shell,
  MShell,
  PageHeader,
  Status,
  Kv,
  Check,
  Th,
  Tr,
  cell,
  Option,
  Person,
  Result,
  Stepper,
  two,
} from './artist-ui.mjs'

const tabs = (labels, active = 0) =>
  Row(
    { name: 'Tabs', gap: 4 },
    labels.map((l, i) => Tab(l, i === active)),
  )
const stat = (label, value, sub) =>
  R(
    'Stat Tile',
    {},
    { label: { content: label }, value: { content: value }, sub: { content: sub } },
  )
const stats = (m, items) =>
  (m ? Col : Row)(
    { name: 'Stats', gap: m ? 12 : 16, width: 'fill_container' },
    items.map((s) => stat(...s)),
  )
const panel = (title, children, o = {}) =>
  Panel([
    title &&
      Row({ width: 'fill_container', justifyContent: 'space_between' }, [Tx('H4', title), o.right]),
    ...children,
  ])
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
const pair = (name, opts, build, more = []) => ({
  ...opts,
  desktop: () => Shell(name, opts.shell, build(false)),
  mobile: () => MShell(name, build(true), opts.mHeight ?? 1700),
  states: more,
})
const st = (label, shell, build, mh = 1200) =>
  state(
    label,
    () => Shell(label, shell, build(false)),
    () => MShell(label, build(true), mh),
  )
const filtersBar = (m) =>
  Row(
    { name: 'Analytics Filters', gap: 8 },
    (m
      ? ['Last 28 days', 'Source: Bitrate']
      : ['Last 28 days', 'Compare: previous', 'Europe/Kyiv', 'Source: Bitrate']
    ).map((b) => Badge(b, 'outline')),
  )
const bars = (vals, labels) =>
  Row(
    { name: 'Chart', width: 'fill_container', height: 200, gap: 14, alignItems: 'end' },
    vals.map((v, i) =>
      R(
        v === Math.max(...vals) ? 'Bar Chart/Bar Highlight' : 'Bar Chart/Bar',
        {},
        {
          bar: { height: Math.round((170 * v) / Math.max(...vals)) },
          label: { content: labels[i] },
        },
      ),
    ),
  )

const profileShell = (crumb) => ({
  nav: 'profile',
  crumb: `Profile / ${crumb}`,
  action: 'Preview public profile',
  actionIcon: 'eye',
})
const settingsShell = (crumb, action) => ({
  nav: 'settings',
  crumb: `Settings / ${crumb}`,
  action,
  actionIcon: null,
})
const settingsTabs = (i) =>
  tabs(
    ['Account', 'Security', 'Notifications', 'Appearance', 'Connected services', 'Team & safety'],
    i,
  )
const profileHead = (status) =>
  Row({ name: 'Profile Head', width: 'fill_container', gap: 16 }, [
    R('Media/Avatar', { width: 64, height: 64, fill: img(ART.luma) }),
    Col({ gap: 4, width: 'fill_container' }, [
      Tx('H3', 'Demo artist'),
      Tx('Muted', '@demoartist · Public profile'),
    ]),
    status,
  ])
const promoShell = (crumb, action) => ({
  nav: 'promotion',
  crumb: `Promotion / ${crumb}`,
  action,
  actionIcon: null,
})
const CAMPAIGN = ['Foundation', 'Audience', 'Channels', 'Materials', 'Review']

export const artistPages2 = {
  'profile-details': pair(
    'Profile details',
    {
      title: 'Artist / Profile details',
      route: 'designed — /dashboard/profile',
      context: 'Public artist page fields; private account data stays separate.',
      shell: profileShell('Public details'),
    },
    (m) => [
      PageHeader('Edit artist profile', 'Public details · Draft changes'),
      profileHead(Status('Published', 'Success')),
      tabs(['Details', 'Catalog', 'Verification']),
      ...two(
        m,
        [
          panel('Public profile details', [
            Tx('Muted', 'These fields appear on the artist page after saving.'),
            R('Form/Drop Zone', {}, { text: { content: 'Profile image · Change image' } }),
            Input('Display name', 'Demo artist'),
            Input('Public handle', '@demoartist'),
            Input('Bio', 'Independent electronic artist building late-night worlds.'),
            Tx('Caption', '58 / 300'),
            Input('Website', 'https://example.com'),
            Input('Social link', 'https://social.example/demoartist'),
          ]),
        ],
        [
          panel('Visibility', [
            Kv('Public on artist profile', 'Name · Image · Cover · Bio · Links'),
            Kv('Private account data', 'Login email · Security · Billing'),
            Tx('Caption', 'Managed separately in account settings.'),
          ]),
          panel(null, [
            Status('Unsaved changes', 'Warning'),
            Tx('Muted', '4 public fields changed'),
            Button('Save profile changes', 'default', { width: 'fill_container' }),
            Button('Cancel changes', 'outline', { width: 'fill_container' }),
            Tx('Caption', 'This edits the artist page, not your listener profile.'),
          ]),
        ],
      ),
    ],
    [
      st('Coming soon (current app)', profileShell('Public details'), (_m) => [
        EmptyState(
          'Artist profile editing is coming soon.',
          'Your current account is shown in the workspace menu.',
          'Got it',
          'user-round',
        ),
      ]),
    ],
  ),
  'profile-catalog': pair(
    'Profile catalog',
    {
      title: 'Artist / Profile catalog & layout',
      route: 'designed — /dashboard/profile (Catalog)',
      context: 'Featured release and public block order.',
      shell: profileShell('Catalog'),
    },
    (m) => [
      PageHeader('Profile catalog', 'Featured release and public layout'),
      profileHead(Status('Draft')),
      tabs(['Details', 'Catalog', 'Verification'], 1),
      ...two(
        m,
        [
          panel('Public profile preview', [
            Badge('PREVIEW · DRAFT', 'outline'),
            R('Artist Hero', m ? { height: 220 } : { height: 240 }, {
              name: { content: 'Demo artist' },
            }),
            Tx('Eyebrow', 'FEATURED RELEASE'),
            Row({ gap: 12 }, [
              R('Media/Cover', { width: 72, height: 72, fill: img(ART.afterglow) }),
              Col({ gap: 2 }, [Tx('H4', 'Afterglow'), Tx('Muted', 'Single · 2026')]),
              Button('Preview release', 'outline'),
            ]),
          ]),
        ],
        [
          panel('Profile blocks', [
            Tx('Muted', 'Reorder available blocks and choose which ones are public.'),
            row('Releases', '6 published releases', Switch('', true)),
            row('About', 'Public bio', Switch('', true)),
            row('External links', '2 public links', Switch('', true)),
            row('Listener history', 'Not part of the artist profile', Status('Unavailable')),
            Button('Save profile layout', 'default', { width: 'fill_container' }),
            Button('Reset order', 'ghost', { width: 'fill_container' }),
          ]),
        ],
      ),
    ],
  ),
  'profile-verification': pair(
    'Profile status',
    {
      title: 'Artist / Profile save & verification',
      route: 'designed — /dashboard/profile (Verification)',
      context: 'A field error never erases other changes; verification is a future process.',
      shell: profileShell('Verification'),
    },
    (m) => [
      PageHeader('Profile status', 'Save recovery and verification concept'),
      profileHead(Status('Save failed')),
      tabs(['Details', 'Catalog', 'Verification'], 2),
      ...two(
        m,
        [
          Alert(
            'Profile changes could not be saved',
            'The public handle is already in use. Your other changes are still here.',
          ),
          panel('Changes to review', [
            Input('Display name', 'Demo artist'),
            Input('Public handle', '@demoartist'),
            FieldError('This handle is already in use. Choose another.'),
            Input('Bio', 'Independent electronic artist building late-night worlds.'),
            Status('Changes preserved', 'Info'),
            Row({ gap: 10 }, [
              Button('Try saving again', 'default'),
              Button('Cancel changes', 'ghost'),
            ]),
          ]),
        ],
        [
          panel('Verification concept', [
            Status('Not applied'),
            Tx(
              'Paragraph',
              'Verification criteria and submission are not connected in this prototype.',
              { wrap: true },
            ),
            Check('Pending', 'Not applied', 'No application or badge'),
            Check('Pending', 'Submitted', 'Awaiting review'),
            Check('Blocked', 'Needs information', 'Artist action required'),
            Check('Done', 'Approved', 'Badge appears only after review'),
            Tx('Caption', 'Application unavailable. No automatic verification is shown.'),
          ]),
        ],
      ),
    ],
  ),
  'settings-account': pair(
    'Account',
    {
      title: 'Artist / Settings / Account',
      route: 'designed — /dashboard/settings',
      context: 'Login identity and sign-in methods.',
      shell: settingsShell('Account', 'View artist profile'),
    },
    (m) => [
      PageHeader('Account settings', 'Login identity and sign-in methods'),
      settingsTabs(0),
      ...two(
        m,
        [
          panel('Login identity', [
            Tx('Muted', 'Used to sign in and receive account-security messages.'),
            row(
              'Email address',
              'demoartist@example.com · Changing this address requires a separate verification step.',
              Status('Verified'),
              Button('Change email', 'outline'),
            ),
          ]),
          panel('Sign-in methods', [
            row('Email and password', 'Current sign-in method', Status('Enabled')),
            row(
              'Additional methods',
              'No other provider is connected in this prototype.',
              Status('Unavailable'),
            ),
          ]),
        ],
        [
          panel('Account vs. profile', [
            Kv('Private login identity', 'Never public'),
            Kv('Public artist profile', 'Edited separately'),
            Tx('Muted', 'No unsaved account changes'),
            Button('Save account changes', 'default', { width: 'fill_container' }),
            Button('Edit public profile', 'outline', { width: 'fill_container' }),
          ]),
        ],
      ),
    ],
    [
      st('Coming soon (current app)', settingsShell('Account'), (_m) => [
        EmptyState(
          'Workspace settings are coming soon.',
          'You can already change your appearance below.',
          'Got it',
          'settings',
        ),
        Row({ gap: 8 }, [Tab('Light'), Tab('Dark', true), Tab('Dim')]),
      ]),
    ],
  ),
  'settings-security': pair(
    'Security',
    {
      title: 'Artist / Settings / Security',
      route: 'designed — /dashboard/settings/security',
      context: '2FA, recovery codes and session sign-out are separate confirmable flows.',
      shell: settingsShell('Security', 'Security help'),
    },
    (m) => [
      PageHeader('Security', 'Password, two-factor protection and sessions'),
      Row({ gap: 8 }, [Status('Needs attention'), Tx('Muted', '2 sessions · 2FA is off')]),
      settingsTabs(1),
      ...two(
        m,
        [
          panel('Sign-in protection', [
            row(
              'Password',
              'Configured for email sign-in · Demo state',
              Button('Change password', 'outline'),
            ),
            row(
              'Two-factor authentication',
              'Add a second step to supported sign-in flows.',
              Status('Off'),
              Button('Set up 2FA', 'default'),
            ),
            row(
              'Recovery options',
              'Recovery codes become available after 2FA setup.',
              Status('Unavailable'),
            ),
          ]),
          Tx(
            'Caption',
            'Security changes require explicit confirmation and must never happen automatically.',
          ),
        ],
        [
          panel('Active sessions', [
            row('This computer', 'Chrome · Linux · Europe/Kyiv', Status('Current')),
            row('Pixel 8', 'Last active 2 hours ago · Demo', Button('Sign out session', 'ghost')),
            Button('Review sign-out', 'outline', { width: 'fill_container' }),
            Tx('Caption', 'Ends other sessions after confirmation. This device stays signed in.'),
          ]),
        ],
      ),
    ],
  ),
  'settings-notifications': pair(
    'Notifications',
    {
      title: 'Artist / Settings / Notifications',
      route: 'designed — /dashboard/settings/notifications',
      context: 'Events grouped by source; In-app, Email and Push channels.',
      shell: settingsShell('Notifications', 'Reset preferences'),
    },
    (m) => [
      PageHeader('Notifications', 'Choose product events and delivery channels'),
      settingsTabs(2),
      ...two(
        m,
        [
          panel('Notify me about', [
            Tx('Muted', 'Preferences are grouped by the product event that caused them.'),
            ...[
              ['Release and delivery updates', 'Review, delivery status and publication changes'],
              ['Review feedback', 'Questions, required changes and approval'],
              ['Tasks and deadlines', 'Assignments, reminders and overdue tasks'],
              ['Analytics reports', 'Available Bitrate reports and data delays'],
              ['Promotion and publishing', 'Draft, approval and campaign-status updates'],
            ].map(([t, d], i) => row(t, d, Switch('In-app', true), Switch('Email', i < 3))),
            Tx(
              'Caption',
              'Turning off a channel does not remove the event from the product activity history.',
            ),
          ]),
        ],
        [
          panel('Delivery channels', [
            row('In-app', 'Available in this concept', Status('Active')),
            row('Email', 'demoartist@example.com', Status('Verified')),
            row('Push', 'Not connected in this prototype', Status('Unavailable')),
            Switch('Pause all notifications', false),
            Button('Save preferences', 'default', { width: 'fill_container' }),
          ]),
        ],
      ),
    ],
  ),
  'settings-appearance': pair(
    'Appearance',
    {
      title: 'Artist / Settings / Appearance',
      route: 'designed — /dashboard/settings/appearance',
      context: 'Theme, density and motion change presentation only.',
      shell: settingsShell('Appearance', 'Reset appearance'),
    },
    (m) => [
      PageHeader('Appearance', 'Choose how the workspace looks and feels'),
      settingsTabs(3),
      ...two(
        m,
        [
          panel('Interface theme', [
            Tx('Muted', 'Choose a visual mode.'),
            (m ? Col : Row)({ gap: 10, width: 'fill_container' }, [
              Option('Dark', 'High-contrast dark mode'),
              Option('Light', 'Available in the design system'),
              Option('Dim', 'Current neutral workspace theme', true),
            ]),
          ]),
          panel('Interface density', [
            Row({ gap: 10, width: 'fill_container' }, [
              Option('Comfortable', 'Comfortable spacing is active.', true),
              Option('Compact', 'Same information, tighter spacing.'),
            ]),
          ]),
          panel('Motion', [Switch('Reduce motion · Follow system preference', true)]),
        ],
        [
          panel('Current preferences', [
            Kv('Theme', 'Dim'),
            Kv('Density', 'Comfortable'),
            Kv('Motion', 'System'),
            Kv('Language', 'English'),
            Tx('Caption', 'A language selector is unavailable until localization ships.'),
            Button('Save appearance', 'default', { width: 'fill_container' }),
          ]),
        ],
      ),
    ],
  ),
  'settings-services': pair(
    'Connected services',
    {
      title: 'Artist / Settings / Connected services',
      route: 'designed — /dashboard/settings/services',
      context: 'Connect appears only for a supported provider.',
      shell: settingsShell('Connected services', 'Connection guide'),
    },
    (m) => [
      PageHeader('Connected services', 'Review connections, permissions and access'),
      settingsTabs(4),
      ...two(
        m,
        [
          panel('Services', [
            Tx('Muted', 'Only implemented providers can expose a Connect action.'),
            row(
              'Social publishing sandbox',
              'Demo connection · no automatic publishing',
              Status('Connected'),
              Button('Review access', 'outline'),
            ),
            row(
              'Spotify for Artists',
              'Provider integration is not verified',
              Status('Not connected'),
            ),
            row(
              'Apple Music for Artists',
              'Provider integration is not verified',
              Status('Not connected'),
            ),
            row(
              'External delivery network',
              'Separate from internal Bitrate review',
              Status('Unavailable'),
            ),
          ]),
        ],
        [
          panel('Permission review', [
            Kv('Read artist profile', Status('Allowed')),
            Kv('Create draft content', Status('Allowed')),
            Kv('Publish without approval', Status('Never')),
            Tx('Caption', 'Final publishing always requires the artist’s confirmation.'),
            Button('Review disconnect', 'destructive', { width: 'fill_container' }),
          ]),
        ],
      ),
    ],
  ),
  'settings-team': pair(
    'Team & safety',
    {
      title: 'Artist / Settings / Team & safety',
      route: 'designed — /dashboard/settings/team',
      context: 'Roles are visible before invites; destructive actions open a separate review.',
      shell: settingsShell('Team & safety', 'Invite member'),
    },
    (m) => [
      PageHeader('Team & workspace safety', 'Roles, access and deliberate account actions'),
      settingsTabs(5),
      ...two(
        m,
        [
          panel(
            'Workspace members',
            [
              Person('DA', 'Demo artist', 'demoartist@example.com', [
                Badge('Owner', 'secondary'),
                Status('Active'),
              ]),
              Person('JM', 'Jordan Miles', 'jordan@example.com', [
                Badge('Manager', 'secondary'),
                Status('Active'),
              ]),
              Person('TS', 'Taylor Stone', 'taylor@example.com', [
                Badge('Viewer', 'secondary'),
                Status('Pending'),
              ]),
              Tx('Caption', 'Pending invite expires in 5 days · Demo'),
            ],
            { right: Badge('3 seats · Demo', 'outline') },
          ),
          panel('Dangerous actions', [
            Tx(
              'Muted',
              'Every action opens a separate review. Nothing destructive happens from this screen.',
            ),
            row(
              'Sign out everywhere',
              'End other sessions after confirmation.',
              Button('Review sign-out', 'outline'),
            ),
            row(
              'Deactivate workspace',
              'Pause access; explain restoration first.',
              Button('Review deactivation', 'outline'),
            ),
            row(
              'Delete artist account',
              'Export data and type confirmation.',
              Button('Review deletion', 'destructive'),
            ),
          ]),
        ],
        [
          panel('Role boundaries', [
            Kv('Owner', 'Security, team and deletion'),
            Kv('Manager', 'Releases, tasks and promotion'),
            Kv('Viewer', 'No edits or account actions'),
            Tx('Caption', 'Only the owner can change ownership or review account deletion.'),
          ]),
        ],
      ),
    ],
  ),
  'promotion-overview': pair(
    'Promotion',
    {
      title: 'Artist / Promotion overview',
      route: 'designed — /dashboard/promotion',
      context: 'Campaign lifecycle states; results are never promised.',
      shell: promoShell('Overview', 'Create campaign'),
    },
    (m) => [
      PageHeader('Promotion', 'Plan, review and learn from release campaigns'),
      tabs(['Overview', 'Drafts', 'Calendar', 'Reports']),
      stats(m, [
        ['ACTIVE', '1', 'Artist-controlled'],
        ['SCHEDULED', '1', 'Demo timeline'],
        ['DRAFTS', '2', 'Saved locally'],
        ['REPORTING', '—', 'No source connected'],
      ]),
      ...two(
        m,
        [
          panel('Campaigns', [
            ...[
              ['Afterglow launch', 'Release awareness · Owned channels', 'Active', 'Review'],
              ['Night Signal teaser', 'Pre-release · Social draft · Sep 12', 'Scheduled', 'View'],
              ['Release story set', 'Engagement · Draft content', 'Draft', 'Edit'],
              ['Catalog re-engagement', 'Listener return · No paid spend', 'Paused', 'Resume'],
              ['Midnight Drive archive', 'Release recap · Historical', 'Completed', 'View'],
            ].map(([t, d, s, a]) => row(t, d, Status(s), Button(a, 'ghost'))),
            Tx('Caption', 'Five lifecycle states are shown; results are never promised.'),
          ]),
        ],
        [
          panel('Current focus', [
            Tx('Eyebrow', 'NEXT STEP'),
            Tx('H4', 'Review the release story draft'),
            Tx('Paragraph', 'No post is published until you approve the final copy and channel.', {
              wrap: true,
            }),
            Kv('Paid spend', Status('Off')),
            Button('Review campaign', 'default', { width: 'fill_container' }),
            Button('Open drafts', 'outline', { width: 'fill_container' }),
          ]),
        ],
      ),
    ],
    [
      st('Coming soon (current app)', promoShell('Overview'), (_m) => [
        EmptyState(
          'Promotion tools are coming soon.',
          'Campaigns and paid promotion are not available yet.',
          'Got it',
          'megaphone',
        ),
      ]),
    ],
  ),
  'campaign-creation': pair(
    'Create campaign',
    {
      title: 'Artist / Campaign creation',
      route: 'designed — /dashboard/promotion/new',
      context: 'Release and goal first; audience, channels, timing and materials follow.',
      shell: promoShell('Create campaign', 'Save draft'),
    },
    (m) => [
      PageHeader('Create campaign', 'Choose the release, goal, audience and channels'),
      Stepper(CAMPAIGN, 0, m),
      ...two(
        m,
        [
          panel(
            'Campaign foundation',
            [
              Tx(
                'Muted',
                'Start with the release and outcome. Audience and channels stay editable later.',
              ),
              Select('Release', 'Afterglow · Single'),
              Select('Goal', 'Release awareness'),
              Tx('Caption', 'No outcome is guaranteed'),
            ],
            { right: Status('Draft saved', 'Info') },
          ),
          panel('Audience direction', [
            Option('Existing listeners', 'Based on Bitrate activity', true),
            Option('New listeners', 'Needs discovery context'),
            Option('Custom segment', 'Unavailable in this concept'),
          ]),
          panel('Owned channels', [
            row(
              'Bitrate artist profile',
              'Available · Final approval required',
              Status('Selected'),
            ),
            row('Social sandbox', 'Demo connection · Drafts only', Status('In review')),
          ]),
          panel('Timing', [
            (m ? Col : Row)({ gap: 10, width: 'fill_container' }, [
              Input('Start', 'Sep 12, 2026'),
              Input('End', 'Sep 26, 2026'),
              Select('Time zone', 'Europe/Kyiv'),
            ]),
            Switch(
              'Paid promotion · Budget, limit and launch confirmation are a separate setup.',
              false,
            ),
          ]),
        ],
        [
          panel('Draft summary', [
            Status('4 of 6 ready', 'Info'),
            Kv('Campaign', 'Afterglow awareness'),
            Kv('Release', Status('Ready')),
            Kv('Goal', Status('Ready')),
            Kv('Timing', Status('Ready')),
            Kv('Materials', Status('Pending')),
            Button('Continue to audience', 'default', { width: 'fill_container' }),
          ]),
        ],
      ),
    ],
  ),
  'ai-draft': pair(
    'AI-assisted draft',
    {
      title: 'Artist / AI-assisted draft',
      route: 'designed — /dashboard/promotion/draft',
      context: 'AI writes a starting point from the brief; the artist edits and approves.',
      shell: promoShell('AI-assisted draft', 'Draft history'),
    },
    (m) => [
      PageHeader('AI-assisted draft', 'Generate a starting point, then edit and approve it'),
      Row({ gap: 8 }, [
        Stepper(['Brief', 'Generate', 'Edit', 'Approve'], 2, m),
        Badge('AI-assisted · Demo', 'outline'),
      ]),
      ...two(
        m,
        [
          panel(
            'Campaign brief',
            [
              Kv('GOAL', 'Release awareness'),
              Kv('AUDIENCE', 'Existing listeners'),
              Kv('TONE', 'Calm, direct'),
              Tx(
                'Caption',
                'Source: Afterglow metadata + artist-entered brief. No external audience data.',
              ),
            ],
            { right: Status('Saved', 'Success') },
          ),
          panel(
            'Editable draft',
            [
              Input('Post copy', 'Afterglow is out now on Bitrate.'),
              Tx('Caption', '224 / 500 characters · Edited by artist'),
              Tx('Body Strong', 'Alternative opening'),
              Tx('Paragraph', 'A quieter signal for the hours after midnight.', { wrap: true }),
              Row({ gap: 10 }, [
                Button('Use opening', 'outline'),
                Button('Generate variant', 'ghost', { icon: 'refresh-cw' }),
              ]),
              Tx('Caption', 'Regenerate creates a new version and keeps this edited draft.'),
            ],
            { right: Badge('Version 2', 'outline') },
          ),
        ],
        [
          panel('Review before approval', [
            Tx('Muted', 'AI is a writing assistant. The artist owns the final copy and channel.'),
            Check('Done', 'No guaranteed performance claim'),
            Check('Blocked', 'Release facts match brief', 'Review'),
            Check('Blocked', 'External links added', 'Needed'),
            Check('Pending', 'Channel selected'),
            Button('Save edited draft', 'default', { width: 'fill_container' }),
            Button('Discard suggestion', 'ghost', { width: 'fill_container' }),
          ]),
        ],
      ),
    ],
    [
      st('Generating', promoShell('AI-assisted draft'), (m) => [
        PageHeader('AI-assisted draft', 'Generating a starting point from your brief…'),
        Skeleton('list', m),
      ]),
      st('Generation failed', promoShell('AI-assisted draft'), (_m) => [
        ErrorState(
          'The draft could not be generated',
          'Your brief and earlier versions are kept. Try again.',
          'Try again',
          'triangle-alert',
          null,
        ),
      ]),
    ],
  ),
  'campaign-materials': pair(
    'Materials',
    {
      title: 'Artist / Campaign materials & calendar',
      route: 'designed — /dashboard/promotion/materials',
      context: 'Copy, artwork, destination and schedule stay editable until Review.',
      shell: promoShell('Materials & calendar', 'Save materials'),
    },
    (m) => [
      PageHeader('Materials & calendar', 'Prepare the post, preview it and choose a schedule'),
      Stepper(CAMPAIGN, 3, m),
      ...two(
        m,
        [
          panel(
            'Publication materials',
            [
              Input('Post copy', 'Afterglow is out now on Bitrate.'),
              Tx('Caption', '128 / 500 characters · Artist edited'),
              row(
                'Afterglow artwork',
                'Uses the approved release cover',
                Status('Ready'),
                Button('Replace', 'ghost'),
              ),
              row('Destination', 'Bitrate release page · Available', Status('Complete')),
              row(
                'Schedule',
                'Sep 12, 2026 · 18:00 · Europe/Kyiv',
                Status('Scheduled'),
                Button('Change time', 'ghost'),
              ),
            ],
            { right: Status('Draft saved', 'Info') },
          ),
        ],
        [
          panel('Channel preview', [
            Status('Not published'),
            R('Media/Hero Image', {
              width: 'fill_container',
              height: 200,
              fill: img(ART.afterglow),
            }),
            Tx('Body Strong', 'Bitrate artist profile'),
            Tx('Caption', 'bitrate.example/afterglow · Scheduled Sep 12 · 18:00'),
            Button('Continue to review', 'default', { width: 'fill_container' }),
            Tx('Caption', 'No channel receives this post until final approval.'),
          ]),
        ],
      ),
    ],
  ),
  'paid-promotion': pair(
    'Paid setup',
    {
      title: 'Artist / Paid promotion setup',
      route: 'designed — /dashboard/promotion/paid',
      context: 'Capped budget; launch stays unavailable without a channel and billing.',
      shell: promoShell('Paid setup', 'Save setup'),
    },
    (m) => [
      PageHeader('Paid promotion setup', 'Set a capped budget and review every condition'),
      Row({ gap: 8 }, [
        Tx('Body Strong', 'Afterglow launch'),
        Status('Setup incomplete', 'Warning'),
      ]),
      ...two(
        m,
        [
          panel(
            'Budget and limits',
            [
              Tx(
                'Muted',
                'Amounts illustrate the review flow; they are not a plan or recommendation.',
              ),
              (m ? Col : Row)({ gap: 10, width: 'fill_container' }, [
                Input('Total campaign budget', '$150.00'),
                Input('Daily spend cap', '$15.00'),
              ]),
              (m ? Col : Row)({ gap: 10, width: 'fill_container' }, [
                Input('Start', 'Sep 12, 2026 · 18:00'),
                Input('End', 'Sep 22, 2026'),
              ]),
            ],
            { right: Badge('Demo values', 'outline') },
          ),
          panel(null, [
            row(
              'Paid channel',
              'No verified advertising provider is connected.',
              Status('Blocker', 'Warning'),
            ),
            row(
              'Billing source',
              'No payment method is connected in this concept.',
              Status('Blocker', 'Warning'),
            ),
            row(
              'Estimated results',
              'No reach, conversion or revenue estimate appears without a verified model and source.',
              Status('Unavailable'),
            ),
          ]),
        ],
        [
          panel(
            'Launch review',
            [
              Kv('Maximum spend', '$150.00 · Demo'),
              Kv('Daily cap', '$15.00 · Demo'),
              Kv('Auto-renew', 'Off'),
              Check('Error', 'Connect a paid channel', 'Missing'),
              Check('Error', 'Add a billing source', 'Missing'),
              Check('Pending', 'Confirm exact maximum spend', 'Pending'),
              CheckRow(
                'I understand the exact cap and that launch is a separate confirmed action.',
              ),
              Button('Launch unavailable', 'secondary', { width: 'fill_container' }),
              Tx('Caption', 'Nothing is charged or launched from this static screen.'),
            ],
            { right: Status('2 blockers', 'Warning') },
          ),
        ],
      ),
    ],
  ),
  'campaign-report': pair(
    'Report',
    {
      title: 'Artist / Campaign report & recovery',
      route: 'designed — /dashboard/promotion/report',
      context: 'Only Bitrate-owned signals; every metric has source, period and time.',
      shell: promoShell('Report & recovery', 'Export report'),
    },
    (m) => [
      PageHeader(
        'Campaign report & recovery',
        'Understand available signals and repair channel issues',
      ),
      Tx('Muted', 'Afterglow launch · Sep 12–22, 2026 · Europe/Kyiv · Bitrate source'),
      stats(m, [
        ['POST VIEWS', '1,284', 'Bitrate profile impressions'],
        ['LINK OPENS', '318', 'Campaign link interactions'],
        ['RELEASE PLAYS', '204', 'Attributed plays in Bitrate'],
        ['SAVES', '41', 'Bitrate release saves'],
      ]),
      ...two(
        m,
        [
          panel(
            'Daily signals',
            [
              !m && Th([['Date'], ['Views', 100], ['Opens', 100], ['Plays', 100], ['Saves', 100]]),
              ...[
                ['Sep 18', '218', '54', '39', '8'],
                ['Sep 19', '246', '61', '42', '7'],
                ['Sep 20', '271', '69', '48', '10'],
                ['Sep 21', '289', '72', '46', '9'],
              ].map(([d, ...v]) =>
                Tr([
                  cell(d, 'fill_container', 'Body Strong'),
                  ...(m ? [cell(`${v[0]} views`, 110)] : v.map((x) => cell(x, 100))),
                ]),
              ),
              Tx(
                'Caption',
                'Only Bitrate-owned signals are included. External results remain unavailable.',
              ),
            ],
            { right: Badge('Updated 2h ago', 'outline') },
          ),
        ],
        [
          panel('Channel delivery', [
            row('Bitrate artist profile', 'Published · Sep 12, 18:00', Status('Delivered')),
            row(
              'Social publishing sandbox',
              'Token expired · reconnect to resume',
              Status('Error'),
            ),
            Button('Reconnect channel', 'default', { width: 'fill_container' }),
          ]),
        ],
      ),
    ],
  ),
  'analytics-overview': pair(
    'Analytics',
    {
      title: 'Artist / Analytics overview',
      route: 'designed — /dashboard/analytics',
      context: 'How confirmed Bitrate signals change; every metric has a source and freshness.',
      shell: {
        nav: 'analytics',
        crumb: 'Analytics / Overview',
        action: 'Export view',
        actionIcon: null,
      },
    },
    (m) => [
      PageHeader('Analytics', 'Understand Bitrate-owned performance signals'),
      filtersBar(m),
      Tx('Caption', 'Updated Sep 09, 2026 · 10:42 EEST'),
      stats(m, [
        ['PLAYS', '12,840', '+18.4% · Qualified Bitrate plays'],
        ['LISTENERS', '4,216', '+11.2% · Unique Bitrate accounts'],
        ['SAVES', '1,084', '8.4% · Save rate from plays'],
        ['FOLLOWERS', '+186', '+6.1% · Net new followers'],
      ]),
      ...two(
        m,
        [
          panel('Plays over time', [
            Tx('Muted', 'Qualified plays · daily · Europe/Kyiv · +18.4% vs previous 28 days'),
            bars(
              [1.4, 1.7, 1.5, 1.9, 2.2, 1.8, 2.3],
              ['Sep 03', '04', '05', '06', '07', '08', '09'],
            ),
            Tx('Link', 'Table view'),
          ]),
        ],
        [
          panel('Audience snapshot', [
            Tx('Muted', 'Bitrate listeners · demo data'),
            Tx('Eyebrow', 'TOP CITIES'),
            Kv('Kyiv', '26%'),
            Kv('Warsaw', '16%'),
            Kv('Berlin', '11%'),
          ]),
        ],
      ),
    ],
    [
      st('Observed zero', { nav: 'analytics', crumb: 'Analytics / Data quality' }, (_m) => [
        PageHeader('Analytics', 'Know what each number means — and when it is not available'),
        stat(
          'SAVES',
          '0',
          'A real result · No saves in the selected period; source updated 2h ago.',
        ),
      ]),
      st('No data yet', { nav: 'analytics', crumb: 'Analytics / Data quality' }, (_m) => [
        EmptyState(
          'Nothing collected yet',
          'Tracking has not received a qualifying event for this scope.',
          null,
          'chart-column',
        ),
      ]),
      st('Update delayed', { nav: 'analytics', crumb: 'Analytics / Data quality' }, (_m) => [
        Alert(
          'Update delayed',
          'Showing the last known value. Last update Sep 08 · 23:10. Next check in 18 min.',
        ),
        stat('PLAYS', '12,840', 'Last known value'),
      ]),
      st('Load error', { nav: 'analytics', crumb: 'Analytics / Data quality' }, (_m) => [
        ErrorState(
          'This view could not be loaded',
          'Try again; period, source and comparison remain selected.',
          'Try again',
          'triangle-alert',
          null,
        ),
      ]),
      st('Definitions', { nav: 'analytics', crumb: 'Analytics / Data quality' }, (m) => [
        panel('Definitions & evidence', [
          Tx('Muted', 'Selected period: Aug 13–Sep 09 · Europe/Kyiv'),
          !m && Th([['Metric'], ['Definition', 240], ['Source', 160], ['Updated', 140]]),
          ...[
            ['Plays', 'Qualified track starts', 'Bitrate events'],
            ['Listeners', 'Unique Bitrate accounts', 'Bitrate accounts'],
            ['Saves', 'Explicit library adds', 'Bitrate library'],
            ['Followers', 'Net follower change', 'Bitrate profile'],
          ].map(([a, b, c]) =>
            Tr([
              cell(a, 'fill_container', 'Body Strong'),
              cell(b, m ? 150 : 240),
              ...(m ? [] : [cell(c, 160), cell('Sep 09 · 10:42', 140)]),
            ]),
          ),
        ]),
      ]),
      st('Coming soon (current app)', { nav: 'analytics', crumb: 'Analytics' }, (_m) => [
        EmptyState(
          'Analytics is coming soon.',
          'Listening and performance data will appear when a data provider is connected.',
          'Got it',
          'chart-column',
        ),
      ]),
    ],
  ),
  'release-analytics': pair(
    'Release analytics',
    {
      title: 'Artist / Release analytics',
      route: 'designed — /dashboard/analytics/$releaseId',
      context: 'Selecting a release or track updates every card in one context.',
      shell: {
        nav: 'analytics',
        crumb: 'Analytics / Afterglow',
        action: 'Export release',
        actionIcon: null,
      },
    },
    (m) => [
      PageHeader('Release analytics', 'See how a release and its tracks perform on Bitrate'),
      Row({ gap: 8 }, [
        Select(null, 'Afterglow · Single', 220),
        Select(null, 'All tracks', 160),
        Badge('Last 28 days', 'outline'),
      ]),
      stats(m, [
        ['PLAYS', '12,840', '+18.4% vs previous period'],
        ['LISTENERS', '4,216', '32.8% unique reach'],
        ['SAVES', '1,168', '9.1% save rate'],
        ['AVG. COMPLETION', '71%', '+4.2 pts vs previous period'],
      ]),
      ...two(
        m,
        [
          panel('Track performance', [
            !m && Th([['Track'], ['Plays', 90], ['Listeners', 100], ['Saves', 80], ['Comp.', 70]]),
            ...[
              ['Night Signal', '6,280', '2,084', '612', '74%'],
              ['Static Lines', '3,442', '1,360', '284', '68%'],
              ['Drift Control', '2,118', '772', '188', '70%'],
              ['Afterglow', '1,000', '438', '84', '65%'],
            ].map(([t, ...v]) =>
              Tr([
                cell(t, 'fill_container', 'Body Strong'),
                ...(m
                  ? [cell(v[0], 80)]
                  : [cell(v[0], 90), cell(v[1], 100), cell(v[2], 80), cell(v[3], 70)]),
              ]),
            ),
            Tx('Caption', 'Completion = plays reaching at least 90% of track length.'),
          ]),
        ],
        [
          panel('Discovery sources', [
            Tx('Muted', 'For Afterglow · Last 28 days'),
            Kv('Artist profile', '6.2k · 41%'),
            Kv('Library', '3.1k · 24%'),
            Kv('Search', '2.0k · 16%'),
          ]),
        ],
      ),
    ],
  ),
  'global-search': pair(
    'Search',
    {
      title: 'Artist / Global search',
      route: 'designed — search modal (Ctrl K) · current app searches sections only',
      context: 'Releases, tracks, campaigns, tasks and settings in one result list.',
      shell: { nav: 'dashboard', crumb: 'Search', action: 'Create release' },
    },
    (m) => [
      PageHeader('Search', 'Find work across your artist workspace.'),
      Input(null, 'after'),
      Row({ gap: 4 }, [
        Tab('All 12', true),
        Tab('Releases 3'),
        Tab('Tracks 5'),
        Tab('Campaigns 2'),
      ]),
      ...two(
        m,
        [
          Col({ gap: 4, width: 'fill_container' }, [
            Tx('Eyebrow', 'BEST MATCHES'),
            Result('RELEASE', 'Afterglow', 'EP · In review', true),
            Result('TRACK', 'Afterglow — Master v0.3', '4:02 · Ready'),
            Result('CAMPAIGN', 'Afterglow launch', 'Draft · Edited 2h ago'),
            Result('TASK', 'Approve Afterglow pitch', 'Due Sep 10 · Assigned to you'),
            Result('SETTING', 'Default release timezone', 'Europe/Kyiv'),
            Tx('Caption', '↑ ↓ Navigate · Enter Open · ⌘ K Focus search'),
          ]),
        ],
        [
          panel('Selected result', [
            releaseHeadSmall(),
            Kv('Status', Status('Review in progress')),
            Tx('Eyebrow', 'NEXT ACTION'),
            Tx('Body Strong', 'Review requested metadata change'),
            Button('Open release', 'default', { width: 'fill_container' }),
          ]),
        ],
      ),
    ],
    [
      st('No matches', { nav: 'dashboard', crumb: 'Search' }, (_m) => [
        Input(null, 'zzz'),
        EmptyState(
          'No matching workspace sections.',
          'Try another word, or open Music from the sidebar.',
          null,
          'search-x',
        ),
      ]),
      st('Section search (current app)', { nav: 'dashboard', crumb: 'Search' }, (m) => [
        Panel(
          [
            Tx('H3', 'Search workspace'),
            Input(null, 'Find a workspace section…'),
            Result('SECTION', 'Dashboard', 'Workspace'),
            Result('SECTION', 'Music', 'Workspace'),
          ],
          { width: m ? 'fill_container' : 560 },
        ),
      ]),
    ],
  ),
  'notification-center': pair(
    'Notifications',
    {
      title: 'Artist / Notification center',
      route: 'designed — header bell · current app: coming soon',
      context: 'Event, object, time and next step; action required is separated.',
      shell: { nav: 'dashboard', crumb: 'Notifications', action: 'Create release' },
    },
    (m) => [
      PageHeader('Notifications', 'What changed across your releases and campaigns.'),
      Row({ gap: 4 }, [
        Tab('Action required 2', true),
        Tab('All'),
        Tab('Releases'),
        Tab('Promotion'),
      ]),
      Col(
        { gap: 4, width: m ? 'fill_container' : 760 },
        [
          [
            'circle-alert',
            'Afterglow needs a rights confirmation',
            'Review feedback · 12 min ago',
            true,
          ],
          ['image', 'Night Signal artwork was flagged', 'Required change · 1 h ago', true],
          ['check', 'Audio checks completed · Afterglow', 'Release · 2 h ago', false],
          ['megaphone', 'Afterglow launch was scheduled', 'Promotion · Yesterday', false],
        ].map(([icon, text, time, unread]) =>
          R(
            unread ? 'Notification Row/Unread' : 'Notification Row/Read',
            {},
            { icon: { icon }, text: { content: text }, time: { content: time } },
          ),
        ),
      ),
    ],
    [
      st('Empty (current app)', { nav: 'dashboard', crumb: 'Notifications' }, (_m) => [
        EmptyState(
          'The notification center is coming soon.',
          'No notifications are available in this workspace yet.',
          'Got it',
          'bell',
        ),
      ]),
    ],
  ),
}
function releaseHeadSmall() {
  return Row({ gap: 12 }, [
    R('Media/Cover', { width: 56, height: 56, fill: img(ART.afterglow) }),
    Col({ gap: 2 }, [Tx('H4', 'Afterglow'), Tx('Muted', 'EP · 5 tracks')]),
  ])
}
