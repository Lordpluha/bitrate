// Artist workspace (web-artists): every route and designed screen, library instances only.
import { img } from './kit.mjs'
import {
  R,
  L,
  Row,
  Col,
  Tx,
  Divider,
  Panel,
  Logo,
  Input,
  Select,
  Button,
  Badge,
  Tab,
  Progress,
  Alert,
  ErrorState,
  EmptyState,
  FieldError,
  CheckRow,
  Skeleton,
  Blank,
  AuthMobile,
  CardDesktop,
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
  DateRow,
  Activity,
  Upload,
  Stepper,
  Demo,
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
  m
    ? Col(
        { name: 'Stats', gap: 12, width: 'fill_container' },
        items.map((s) => stat(...s)),
      )
    : Row(
        { name: 'Stats', gap: 16, width: 'fill_container' },
        items.map((s) => stat(...s)),
      )
const panel = (title, children, o = {}) =>
  Panel(
    [
      title &&
        Row({ width: 'fill_container', justifyContent: 'space_between' }, [
          Tx('H4', title),
          o.right,
        ]),
      ...children,
    ],
    o.w ? { width: o.w } : {},
  )
const filters = (m, search) =>
  m
    ? [Input(null, search)]
    : [
        Row({ name: 'Filters', width: 'fill_container', gap: 10 }, [
          Input(null, search, 280),
          Select(null, 'Status: All', 160),
          Select(null, 'Type: All', 150),
          Select(null, 'Recently updated', 190),
          Button('Reset', 'ghost'),
        ]),
      ]
const RELEASE_STEPS = ['Audio', 'Artwork', 'Details', 'Contributors', 'Review']
const WORKFLOW = ['Draft', 'Review', 'Prepare', 'Deliver', 'Launch']
const summary = (items, actions) =>
  panel('Draft summary', [
    ...items.map(([k, v]) => Kv(k, typeof v === 'string' ? Status(v) : v)),
    Divider(),
    ...actions,
  ])
const releaseHead = (title, sub, status) =>
  Row({ name: 'Release Head', width: 'fill_container', gap: 16 }, [
    R('Media/Cover', { width: 64, height: 64, fill: img(ART.afterglow) }),
    Col({ gap: 4, width: 'fill_container' }, [
      Tx('H2', title, { wrap: true }),
      Tx('Muted', sub, { wrap: true }),
    ]),
    Status(status),
  ])
const pair = (name, opts, build, more = []) => ({
  ...opts,
  desktop: () => Shell(name, opts.shell, build(false)),
  mobile: () => MShell(name, build(true), opts.mHeight ?? 1400),
  states: [...(opts.states ?? []), ...more],
})
const st = (label, shell, build, mh = 1100) =>
  state(
    label,
    () => Shell(label, shell, build(false)),
    () => MShell(label, build(true), mh),
  )

/* ---------- public ---------- */
const _authCard = (children) => children
const artistLogin = (step) =>
  step === '2fa'
    ? [
        Tx('H2', 'Verify your sign-in'),
        Tx('Paragraph', 'Enter the code from your authenticator app.', { wrap: true }),
        Input('Authentication code', '000000'),
        Button('Verify and sign in', 'large-default', { width: 'fill_container' }),
        Tx('Link', 'Back to sign-in'),
      ]
    : [
        Tx('H2', 'Welcome back!'),
        Input('Email Address', 'example@gmail.com'),
        Input('Password', '••••••••'),
        step === 'error' && FieldError('Invalid email or password. Please try again.'),
        step === 'unverified' &&
          Alert(
            'Verify your email before signing in.',
            'Open the link in your inbox, or verify now.',
          ),
        Button(step === 'busy' ? 'Logging in...' : 'Continue', 'large-default', {
          width: 'fill_container',
        }),
        R('Auth/Or Divider'),
        Button('Continue with Google', 'outline', { width: 'fill_container' }),
        Button('Continue with Facebook', 'outline', { width: 'fill_container' }),
        Row({ gap: 6 }, [Tx('Muted', "Don't have an account?"), Tx('Link', 'Sign up.')]),
      ].filter(Boolean)
const artistReg = (step, err) =>
  step === 1
    ? [
        Tx('H2', 'Sign up and immerse yourself in music'),
        Input('Email Address', 'example@gmail.com'),
        Button('Continue', 'large-default', { width: 'fill_container' }),
        R('Auth/Or Divider'),
        Button('Continue with Google', 'outline', { width: 'fill_container' }),
        Row({ gap: 6 }, [Tx('Muted', 'Already have an account?'), Tx('Link', 'Log in.')]),
      ]
    : [
        Tx('Eyebrow', 'STEP 2 OF 2'),
        Tx('H2', 'Create a password'),
        Input('Password', '••••••••••'),
        Tx('Body Strong', 'Password must contain at least:'),
        Check('Done', '1 letter'),
        Check('Done', '1 number or special symbol (for example, # ? ! &)'),
        Check(err ? 'Error' : 'Pending', '10 characters'),
        CheckRow('I accept the Terms of Use, Community Guidelines and Privacy Policy'),
        CheckRow('I accept the Artist Agreement'),
        err && FieldError('You must accept the Artist Agreement'),
        Button('Continue', 'large-default', { width: 'fill_container' }),
      ].filter(Boolean)
const verifyA = (done) =>
  done
    ? [
        Tx('H2', "You're ready to make some noise."),
        Tx('Paragraph', 'Your email has been verified. You can now sign in.', { wrap: true }),
        Button('Log in', 'large-default', { width: 'fill_container' }),
      ]
    : [
        Tx('H2', 'Verify your email'),
        Tx('Paragraph', 'One more step to your artist workspace.', { wrap: true }),
        Input('Email address', 'demoartist@example.com'),
        Input('Verification code', '000000'),
        Tx('Caption', 'Six digits. You can paste the entire code.'),
        Button('Verify and continue', 'large-default', { width: 'fill_container' }),
        Button('Resend verification email', 'large-secondary', { width: 'fill_container' }),
        Tx('Link', 'Back to login'),
      ]
const cardPair = (form) => ({
  desktop: () => CardDesktop('Card', form()),
  mobile: () => AuthMobile('Card', form()),
})
const cardSt = (label, form) =>
  state(
    label,
    () => CardDesktop(label, form()),
    () => AuthMobile(label, form()),
  )
const landingHero = (m) => [
  R('Public Header', m ? { width: 'fill_container' } : {}),
  L(
    {
      name: 'Hero',
      width: 'fill_container',
      layout: m ? 'vertical' : 'horizontal',
      padding: m ? [32, 16] : [80, 120],
      gap: m ? 24 : 48,
      alignItems: m ? 'start' : 'center',
    },
    [
      Col({ gap: 20, width: m ? 'fill_container' : 520 }, [
        Tx('Eyebrow', 'BITRATE FOR ARTISTS'),
        Tx(m ? 'H1' : 'Display', 'Release, promote and grow on Bitrate.', { wrap: true }),
        Tx('Paragraph', 'Your releases, campaigns and listeners in one workspace.', { wrap: true }),
        Row({ gap: 12 }, [
          Button('Get started', 'large-default', { icon: 'arrow-right' }),
          Button('Explore Campaign Kit', 'large-outline'),
        ]),
      ]),
      Row(
        { name: 'Video Slides', gap: 16, width: m ? 'fill_container' : 'fill_container' },
        [
          ['Artist Profile', 'luma'],
          ['Sell and promote merch', 'stage'],
          ['Explore Campaign Kit', 'hero'],
        ]
          .slice(0, m ? 1 : 3)
          .map(([t, a]) =>
            Col({ name: `Slide / ${t}`, gap: 10, width: 'fill_container' }, [
              R('Media/Hero Image', {
                width: 'fill_container',
                height: m ? 260 : 420,
                fill: img(ART[a]),
              }),
              Tx('Body Strong', t),
            ]),
          ),
      ),
    ],
  ),
  !m && R('Landing/Footer'),
]

export const artistPages = {
  landing: {
    title: 'Artist / Landing',
    route: '/',
    context: 'Marketing page for artists: header with Features submenu, video slides, footer.',
    desktop: () => Blank('Landing', 1440, 1100, landingHero(false)),
    mobile: () => Blank('Landing', 390, 1000, landingHero(true)),
    states: [
      state(
        'Features menu',
        () =>
          Blank('Features', 1440, 900, [
            R('Public Header'),
            Row(
              { width: 'fill_container', padding: [24, 120], gap: 40, alignItems: 'start' },
              [
                [
                  'Amplify your music',
                  [
                    'Campaign Kit',
                    'Algorithmic promotion',
                    'Release campaigns',
                    'Playlisting',
                    'Sponsored recommendations',
                  ],
                ],
                [
                  'Connect with fans',
                  ['Video & Visuals', 'Artist Profile', 'Sell and promote merch'],
                ],
              ].map(([h, items]) =>
                Panel([Tx('Eyebrow', h.toUpperCase()), ...items.map((i) => Tx('Body Strong', i))], {
                  width: 320,
                }),
              ),
            ),
          ]),
        () =>
          AuthMobile('Menu', [
            Tx('H3', 'Get started'),
            Tx('H3', 'Features'),
            ...['Campaign Kit', 'Release campaigns', 'Playlisting', 'Video & Visuals'].map((i) =>
              Tx('Body', i),
            ),
          ]),
      ),
    ],
  },
  login: {
    title: 'Artist / Login',
    route: '/login',
    context: 'Email/password sign-in with Google and Facebook; 2FA step.',
    ...cardPair(() => artistLogin()),
    states: [
      cardSt('Two-factor step', () => artistLogin('2fa')),
      cardSt('Invalid credentials', () => artistLogin('error')),
      cardSt('Email not verified', () => artistLogin('unverified')),
      cardSt('Submitting', () => artistLogin('busy')),
    ],
  },
  registration: {
    title: 'Artist / Registration',
    route: '/registration',
    context: 'Two steps: email, then password with rules and the Artist Agreement.',
    ...cardPair(() => artistReg(1)),
    states: [
      cardSt('Step 2 — password', () => artistReg(2)),
      cardSt('Step 2 — errors', () => artistReg(2, true)),
    ],
  },
  'verify-email': {
    title: 'Artist / Verify email',
    route: '/verify-email',
    context: 'Six-digit code verification.',
    ...cardPair(() => verifyA()),
    states: [
      cardSt('Verified', () => verifyA(true)),
      cardSt('Invalid code', () => [
        ...verifyA().slice(0, 4),
        FieldError('That code is not valid. Check it and try again.'),
        ...verifyA().slice(5),
      ]),
    ],
  },
  'forgot-password': {
    title: 'Artist / Forgot password',
    route: '/forgot-password',
    context: 'Request a reset link.',
    ...cardPair(() => [
      Tx('H2', 'Forgot password'),
      Input('Email', 'demoartist@example.com'),
      Button('Send reset link', 'large-default', { width: 'fill_container' }),
    ]),
    states: [
      cardSt('Link sent', () => [
        Tx('H2', 'Forgot password'),
        Alert('Check your inbox', 'If that email exists, a reset link was sent'),
        Tx('Link', 'Back to login'),
      ]),
    ],
  },
  'reset-password': {
    title: 'Artist / Reset password',
    route: '/reset-password',
    context: 'Set a new password.',
    ...cardPair(() => [
      Tx('H2', 'Reset password'),
      Input('New password', '••••••••'),
      Input('Confirm password', '••••••••'),
      Button('Set new password', 'large-default', { width: 'fill_container' }),
    ]),
    states: [
      cardSt('Errors', () => [
        Tx('H2', 'Reset password'),
        Input('New password', '•••'),
        Input('Confirm password', '••••'),
        FieldError('Password must be at least 6 characters'),
        FieldError('Passwords do not match'),
        Button('Set new password', 'large-default', { width: 'fill_container' }),
      ]),
    ],
  },
  legal: {
    title: 'Artist / Legal',
    route: '/legal/$slug — terms, artist-agreement, privacy, community, complaints, copyright',
    context: 'One template for every legal document; shown with the Artist Agreement.',
    desktop: () =>
      Blank('Legal', 1440, 1100, [R('Public Header'), Col({ width: 760, gap: 16 }, legal())]),
    mobile: () => AuthMobile('Legal', legal()),
  },
  'not-found': {
    title: 'Artist / Not found',
    route: 'unknown route',
    context: 'Artist-site 404.',
    desktop: () =>
      Blank('404', 1440, 900, [
        Logo(),
        EmptyState(
          "This page doesn't exist",
          'The link may be out of date, or the address mistyped.',
          'Back to Bitrate for Artists',
          'compass',
        ),
      ]),
    mobile: () =>
      Blank('404', 390, 844, [
        Logo(),
        EmptyState(
          "This page doesn't exist",
          'The link may be out of date, or the address mistyped.',
          'Back to Bitrate for Artists',
          'compass',
        ),
      ]),
  },
  'session-error': {
    title: 'Artist / Session check',
    route: '/dashboard (layout guard)',
    context: 'The dashboard layout checks the session before the workspace renders.',
    desktop: () => Blank('Checking', 1440, 900, [Logo(), Skeleton('list')]),
    mobile: () => Blank('Checking', 390, 844, [Logo(), Skeleton('list', true)]),
    states: [
      state(
        'Session error',
        () =>
          Blank('Error', 1440, 900, [
            Logo(),
            ErrorState(
              "We couldn't check your session",
              'Your workspace is temporarily unavailable. Try again in a moment.',
              'Try again',
              'shield-alert',
              'Back to Bitrate',
            ),
          ]),
        () =>
          Blank('Error', 390, 844, [
            Logo(),
            ErrorState(
              "We couldn't check your session",
              'Your workspace is temporarily unavailable. Try again in a moment.',
              'Try again',
              'shield-alert',
              'Back to Bitrate',
            ),
          ]),
      ),
    ],
  },

  /* ---------- workspace ---------- */
  dashboard: pair(
    'Dashboard',
    {
      title: 'Artist / Dashboard',
      route: '/dashboard',
      context:
        'Returning artist: current release, next action, blockers, catalog, dates, activity, data.',
      shell: { nav: 'dashboard', crumb: 'Dashboard', action: 'Create release', height: 1240 },
      mHeight: 2000,
    },
    (m) => [
      PageHeader('Welcome back, Alex', 'Afterglow is in review. Two details need your attention.'),
      ...two(
        m,
        [
          panel(null, [
            releaseHead('Afterglow', 'EP · 4 tracks · Updated 2h ago', 'In review'),
            Divider(),
            Tx('Eyebrow', 'NEXT ACTION'),
            Tx('H3', 'Complete the rights information'),
            Tx('Paragraph', 'Add the missing contributor credit before the next review.', {
              wrap: true,
            }),
            Row({ gap: 10 }, [
              Button('Review release', 'default'),
              Tx('Muted', 'Draft saved · Nothing is published yet'),
            ]),
          ]),
          panel(
            'Your releases',
            [
              Th([['Release'], ['Type', 120], ['Status', 150]]),
              ...[
                ['Afterglow', 'EP', 'In review'],
                ['Night Signal', 'Single', 'Needs changes'],
                ['Static Lines', 'Single', 'Draft'],
              ].map(([t, ty, s]) =>
                Tr([cell(t, 'fill_container', 'Body Strong'), cell(ty, 120), cell(Status(s), 150)]),
              ),
              Tx('Link', 'View music'),
            ],
            { right: Tx('Muted', '3 releases · 6 tracks') },
          ),
        ],
        [
          panel(
            'Needs attention',
            [
              Check(
                'Blocked',
                'Contributor credit is missing',
                'Afterglow · Required before review',
                'Fix',
              ),
              Check(
                'Blocked',
                'Artwork needs an update',
                'Night Signal · See review feedback',
                'Open',
              ),
              Tx('Muted', 'Rights check due tomorrow, Sep 08'),
            ],
            { right: Badge('2', 'default') },
          ),
          panel(
            'Coming up',
            [
              DateRow('SEP', '08', 'Complete rights check', 'Afterglow · Tomorrow'),
              DateRow('SEP', '14', 'Planned release date', 'Afterglow · Not scheduled yet'),
            ],
            { right: Tx('Caption', 'Europe/Kyiv') },
          ),
          panel('Recent activity', [
            Activity('Audio checks completed · Afterglow', '2h ago'),
            Activity('Master v0.3 uploaded · Afterglow', '3h ago'),
          ]),
          panel('Listening data', [
            Tx('Muted', 'Last 28 days'),
            Tx('Paragraph', 'No listening data available yet.', { wrap: true }),
            Tx('Link', 'Open analytics'),
          ]),
        ],
      ),
      Demo(),
    ],
    [
      st('First run', { nav: 'dashboard', crumb: 'Dashboard', action: 'Create release' }, (_m) => [
        PageHeader('Dashboard', 'Everything you need for your next release.'),
        EmptyState(
          'Your first track. Your next step.',
          "Upload your audio and artwork. We'll help you prepare your release details and find the next step.",
          'Create your first release',
          'upload',
        ),
        Tx('Caption', 'You can finish your draft later.'),
        Demo('Demo workspace'),
      ]),
      st('All clear', { nav: 'dashboard', crumb: 'Dashboard', action: 'Create release' }, (_m) => [
        PageHeader('Dashboard', 'Everything you need for your next release.'),
        EmptyState(
          'You’re clear for now',
          'Afterglow passed review. Your catalog and release history are still available.',
          'Open your catalog',
          'circle-check',
        ),
      ]),
      st(
        'Collecting data',
        { nav: 'dashboard', crumb: 'Dashboard', action: 'Create release' },
        (_m) => [
          PageHeader('Dashboard', 'Everything you need for your next release.'),
          EmptyState(
            'Listening data is arriving',
            'Your release is live. We’ll show listening signals when enough data is available.',
            'View the release',
            'chart-column',
          ),
        ],
      ),
      st('Loading', { nav: 'dashboard', crumb: 'Dashboard', action: 'Create release' }, (m) => [
        PageHeader('Loading your workspace', 'Your releases and tasks will appear here.'),
        Skeleton('grid', m),
      ]),
      st('Load error', { nav: 'dashboard', crumb: 'Dashboard', action: 'Create release' }, (_m) => [
        ErrorState(
          'We couldn’t load your dashboard',
          'Check your connection and try again. Your saved release work is unchanged.',
          'Try again',
          'triangle-alert',
          'Open Music',
        ),
      ]),
      st(
        'Performance summary',
        { nav: 'dashboard', crumb: 'Dashboard / Performance', action: 'Create release' },
        (m) => [
          PageHeader(
            'Good afternoon, Demo artist',
            'Your releases, priorities and Bitrate performance in one view',
          ),
          Row({ gap: 8 }, [
            Badge('Last 28 days', 'outline'),
            Badge('Compare: previous', 'outline'),
            Badge('Source: Bitrate', 'outline'),
          ]),
          stats(m, [
            ['PLAYS', '12,840', '+18.4% vs previous period'],
            ['LISTENERS', '4,216', 'Unique Bitrate accounts'],
            ['SAVES', '1,084', '8.4% save rate'],
            ['FOLLOWERS', '+186', '+6.1% net change'],
          ]),
          ...two(
            m,
            [
              panel(null, [
                releaseHead('Afterglow', 'Single · 4 tracks · Demo artist', 'Review in progress'),
                Kv('READINESS', '82%'),
                Progress(),
                Tx('Body Strong', 'Next: approve the release pitch'),
                Tx('Link', 'Open feedback →'),
              ]),
            ],
            [
              panel('Needs attention', [
                Check('Blocked', 'Pitch copy', '2 requested changes', 'Open'),
                Check('Blocked', 'Drift Control', 'Primary genre missing', 'Edit metadata'),
                Check('Pending', 'Campaign draft', 'Schedule not confirmed', 'Review'),
              ]),
            ],
          ),
        ],
        2000,
      ),
      st(
        'Create release dialog',
        { nav: 'dashboard', crumb: 'Dashboard', action: 'Create release' },
        (m) => [
          Panel(
            [
              Tx('H3', 'Create release'),
              Tx(
                'Paragraph',
                'Start with a title and release type. This saves a draft; it does not publish anything.',
                { wrap: true },
              ),
              Input('Release title', 'Afterglow'),
              Tx('Body Strong', 'Release type'),
              Row(
                { gap: 8, width: 'fill_container' },
                ['Single', 'EP', 'Album', 'Compilation'].map((t, i) => Option(t, null, i === 1)),
              ),
              Row({ gap: 10 }, [Button('Create draft', 'default'), Button('Cancel', 'ghost')]),
            ],
            { width: m ? 'fill_container' : 560 },
          ),
        ],
      ),
      st('Menu open', { nav: 'dashboard', crumb: 'Dashboard', action: 'Create release' }, (m) => [
        R('Artist/Mobile Menu', { width: m ? 'fill_container' : 300 }),
      ]),
    ],
  ),
  music: pair(
    'Music',
    {
      title: 'Artist / Music',
      route: '/dashboard/music (tab, page, q, status, type, sort)',
      context: 'Tracks and Releases are two views of one catalog.',
      shell: { nav: 'music', crumb: 'Music', action: 'Create release' },
    },
    (m) => [
      PageHeader(
        'Your music catalogue',
        'Manage tracks, releases and drafts.',
        m ? [] : [Button('Upload track', 'outline', { icon: 'upload' })],
      ),
      tabs(['Tracks 6', 'Releases 3']),
      ...filters(m, 'Search tracks'),
      Col({ name: 'Table', width: 'fill_container', gap: 0 }, [
        !m &&
          Th([
            ['Track'],
            ['Version · duration', 170],
            ['Status', 150],
            ['Updated', 120],
            ['Release', 150],
          ]),
        ...[
          ['Night Signal', 'Original · 3:56', 'Ready', 'Today', 'Unreleased'],
          ['Afterglow', 'Remaster · 4:02', 'Needs changes', 'Yesterday', 'Afterglow'],
          ['Static Lines', 'Original · 3:47', 'Processing', '2 days ago', 'Unreleased'],
          ['Drift Control', 'Live · 3:19', 'Draft', 'Sep 03', 'Unreleased'],
          ['Echoes in Motion', 'Original · 4:21', 'Published', 'Aug 28', 'Echoes EP'],
          ['Parallel Minds', 'Demo · 4:28', 'Upload failed', 'Aug 24', 'Unreleased'],
        ].map(([t, v, s, u, r]) =>
          m
            ? Tr([cell(t, 'fill_container', 'Body Strong'), cell(Status(s), 130)])
            : Tr([
                cell(t, 'fill_container', 'Body Strong'),
                cell(v, 170),
                cell(Status(s), 150),
                cell(u, 120),
                cell(r, 150),
              ]),
        ),
      ]),
      Row({ width: 'fill_container', justifyContent: 'space_between' }, [
        Tx('Muted', '1–6 of 24 · Sorted by recently updated'),
        Row({ gap: 8 }, [Button('Previous', 'outline'), Button('Next', 'outline')]),
      ]),
      Demo(),
    ],
    [
      st('Releases tab', { nav: 'music', crumb: 'Music', action: 'Create release' }, (m) => [
        PageHeader('Your music catalogue', 'Manage tracks, releases and drafts.'),
        tabs(['Tracks 6', 'Releases 5'], 1),
        ...filters(m, 'Search releases'),
        Col({ width: 'fill_container', gap: 0 }, [
          !m &&
            Th([
              ['Release'],
              ['Type', 110],
              ['Status', 150],
              ['Tracks', 80],
              ['Release date', 150],
              ['Updated', 110],
            ]),
          ...[
            ['Afterglow', 'EP', 'In review', '4', 'Sep 14, 2026', 'Today'],
            ['Night Signal', 'Single', 'Needs changes', '1', 'Not scheduled', 'Yesterday'],
            ['Echoes in Motion', 'EP', 'Published', '5', 'Aug 28, 2026', 'Aug 29'],
            ['Static Lines', 'Single', 'Draft', '1', 'Not scheduled', 'Sep 02'],
            ['Parallel Minds', 'Album', 'Draft', '9', 'Not scheduled', 'Aug 24'],
          ].map(([t, ty, s, n, d, u]) =>
            m
              ? Tr([cell(t, 'fill_container', 'Body Strong'), cell(Status(s), 130)])
              : Tr([
                  cell(t, 'fill_container', 'Body Strong'),
                  cell(ty, 110),
                  cell(Status(s), 150),
                  cell(n, 80),
                  cell(d, 150),
                  cell(u, 110),
                ]),
          ),
        ]),
        Tx('Muted', '5 releases · 2 singles · 2 EPs · 1 album'),
      ]),
      st('Filters applied', { nav: 'music', crumb: 'Music', action: 'Create release' }, (_m) => [
        PageHeader('Your music catalogue', 'Manage tracks, releases and drafts.'),
        tabs(['Tracks 6', 'Releases 5'], 1),
        Row({ gap: 8 }, [
          Badge('night', 'secondary'),
          Badge('Single', 'secondary'),
          Badge('Recently updated', 'secondary'),
          Button('Clear all', 'ghost'),
        ]),
        Tx('Muted', '1 matching release'),
        Tr([
          cell('Night Signal', 'fill_container', 'Body Strong'),
          cell('Single · 1 track', 160),
          cell(Status('Needs changes'), 150),
        ]),
        Tx('Caption', 'Filters stay visible while you review results.'),
      ]),
      st('No matches', { nav: 'music', crumb: 'Music', action: 'Create release' }, (_m) => [
        PageHeader('Your music catalogue', 'Manage tracks, releases and drafts.'),
        Row({ gap: 8 }, [Badge('Album', 'secondary'), Button('Clear all', 'ghost')]),
        EmptyState(
          'No releases match these filters',
          'Your search and filters are still applied. Clear them to return to the full catalog.',
          'Clear filters',
          'search-x',
        ),
      ]),
      st('Empty catalogue', { nav: 'music', crumb: 'Music', action: 'Create release' }, (_m) => [
        PageHeader('Your music catalogue', 'Manage tracks, releases and drafts.'),
        EmptyState(
          'Your first release starts here',
          'Create a draft with a title and release type. Your music stays unpublished while you prepare it.',
          'Create release',
          'disc-3',
        ),
      ]),
      st('Loading', { nav: 'music', crumb: 'Music', action: 'Create release' }, (m) => [
        PageHeader('Loading your tracks…', 'Manage tracks, releases and drafts.'),
        Skeleton('artist-table', m),
      ]),
      st('Load error', { nav: 'music', crumb: 'Music', action: 'Create release' }, (_m) => [
        ErrorState(
          'Your tracks could not be loaded',
          'Something went wrong on our side. Try again.',
          'Try again',
          'triangle-alert',
          null,
        ),
      ]),
      st('Row actions', { nav: 'music', crumb: 'Music', action: 'Create release' }, (m) => [
        PageHeader('Your music catalogue', 'Manage tracks, releases and drafts.'),
        Tr(
          [
            cell('Afterglow — Master v0.3', 'fill_container', 'Body Strong'),
            cell(Status('Ready'), 120),
          ],
          true,
        ),
        R('Surface/Menu', m ? { width: 'fill_container' } : {}, {
          items: L(
            { name: 'Items', layout: 'vertical', width: 'fill_container' },
            [
              ['Open track'],
              ['Edit metadata'],
              ['Replace audio', 'disabled'],
              ['Open release workspace'],
              ['Archive track'],
              ['Delete permanently', 'destructive'],
            ].map(([l, k]) =>
              R(
                k === 'destructive'
                  ? 'Menu/Item Destructive'
                  : k === 'disabled'
                    ? 'Menu/Item Disabled'
                    : 'Menu/Item',
                {},
                { label: { content: l } },
              ),
            ),
          ),
        }),
        Tx('Caption', 'Enter opens selected item · Shift+F10 opens row actions'),
      ]),
      st('Archive dialog', { nav: 'music', crumb: 'Music', action: 'Create release' }, (m) => [
        Panel(
          [
            Tx('H3', 'Archive this draft?'),
            Tx(
              'Paragraph',
              '“Night Signal” will leave your active list. You can restore it from the archive.',
              { wrap: true },
            ),
            Row({ gap: 10 }, [Button('Archive draft', 'destructive'), Button('Cancel', 'ghost')]),
          ],
          { width: m ? 'fill_container' : 480 },
        ),
      ]),
    ],
  ),
}

/* ---------- create release wizard: one file per step ---------- */
const wiz = (step, sub, body, summaryRows, gateText, cta) => (m) => [
  PageHeader('Create a release', sub, m ? [] : [Button('Save & exit', 'ghost')]),
  Stepper(RELEASE_STEPS, step, m),
  ...two(
    m,
    body(m),
    [
      summary(summaryRows, [
        Button('Save draft', 'outline', { width: 'fill_container' }),
        Button(cta, 'default', { width: 'fill_container' }),
        Tx('Caption', gateText),
      ]),
    ],
    340,
  ),
  Demo('Demo draft · Static design'),
]
const wizShell = { nav: 'music', crumb: 'Music / New release' }
const audioBody =
  (s = 'uploading') =>
  (m) => [
    panel('Choose release type', [
      Tx('Muted', 'This controls how tracks are grouped. Delivery rules are checked later.'),
      (m ? Col : Row)({ gap: 10, width: 'fill_container' }, [
        Option('Single', 'Single focuses this release on one primary track.', true),
        Option('EP', null),
        Option('Album', null),
      ]),
    ]),
    panel('Add audio', [
      s === 'ready'
        ? R('Form/Drop Zone', {}, { text: { content: 'Drop an audio file here' } })
        : s === 'error'
          ? Alert(
              'Upload interrupted',
              'Connection lost. Try again. Draft and file choice stay saved.',
            )
          : s === 'checking'
            ? Upload('Night Signal.wav', 'Checking audio · You can save and return.', null)
            : s === 'done'
              ? Check('Done', 'Night Signal.wav', 'Audio ready · passed processing')
              : Upload('Night Signal.wav', 'Uploading 42%'),
      s === 'error' && Button('Retry upload', 'default'),
      Tx(
        'Caption',
        s === 'uploading'
          ? 'Keep this page open while the current upload is in progress.'
          : 'File requirements will appear after a delivery service is confirmed.',
      ),
    ]),
  ]
export const releaseWizard = {
  'create-release-audio': {
    title: 'Artist / Create release / 1 Audio',
    route: 'designed — /dashboard/music/new (step 1)',
    context: 'Start with audio; save and return later.',
    shell: wizShell,
    mHeight: 1600,
    build: wiz(
      0,
      'Start with audio. You can save and return later.',
      audioBody(),
      [
        ['Release type', 'Single'],
        ['Tracks', 'Uploading'],
        ['Artwork', 'Not added'],
        ['Details', 'Incomplete'],
      ],
      'Finish uploading audio to continue.',
      'Continue to artwork',
    ),
    more: [
      ['Ready', 'ready'],
      ['Checking', 'checking'],
      ['Upload error', 'error'],
      ['Audio ready', 'done'],
    ].map(([l, s]) =>
      st(
        l,
        wizShell,
        wiz(
          0,
          'Start with audio. You can save and return later.',
          audioBody(s),
          [
            ['Release type', 'Single'],
            ['Tracks', s === 'done' ? 'Ready' : 'Pending'],
          ],
          s === 'done'
            ? 'Draft saved. Audio remains attached if you return later.'
            : 'Finish uploading audio to continue.',
          'Continue to artwork',
        ),
        1600,
      ),
    ),
  },
  'create-release-artwork': {
    title: 'Artist / Create release / 2 Artwork',
    route: 'designed — /dashboard/music/new (step 2)',
    context: 'Add the cover artwork that belongs to this release.',
    shell: wizShell,
    mHeight: 1600,
    build: wiz(
      1,
      'Add artwork that belongs to this release.',
      (_m) => [
        panel('Add cover artwork', [
          Tx('Muted', 'This image represents the release across your catalog.'),
          R('Form/Drop Zone', {}, { text: { content: 'Drop cover artwork here' } }),
          Tx('Body Strong', 'Before you add it'),
          Check('Pending', 'Use a clear, final cover—not a temporary file.'),
          Check('Pending', 'Confirm you have permission to use the artwork.'),
          Tx('Caption', 'Exact file requirements appear after a delivery service is confirmed.'),
        ]),
      ],
      [
        ['Release type', 'Single'],
        ['Tracks', 'Ready'],
        ['Artwork', 'Not added'],
      ],
      'Add and validate artwork to continue.',
      'Continue to details',
    ),
    more: [
      st(
        'Artwork added',
        wizShell,
        wiz(
          1,
          'Add artwork that belongs to this release.',
          (m) => [
            panel('Cover artwork', [
              R('Media/Cover Large', {
                width: m ? 326 : 280,
                height: m ? 326 : 280,
                fill: img(ART.afterglow),
              }),
              Check('Done', 'Afterglow cover.png', 'Ready · 3000 × 3000'),
              Button('Replace image', 'outline'),
            ]),
          ],
          [['Artwork', 'Ready']],
          'Artwork is ready.',
          'Continue to details',
        ),
        1600,
      ),
    ],
  },
  'create-release-details': {
    title: 'Artist / Create release / 3 Details',
    route: 'designed — /dashboard/music/new (step 3)',
    context: 'Public titles, version, explicit status and genres.',
    shell: wizShell,
    mHeight: 1800,
    build: wiz(
      2,
      'Add the public details listeners will see.',
      (_m) => [
        panel('Release and track details', [
          Tx('Muted', 'Required fields are marked with an asterisk.'),
          Input('Release title *', 'Afterglow'),
          Input('Track title *', 'Night Signal'),
          Input('Version', 'Optional · e.g. Original Mix'),
          Tx('Body Strong', 'Explicit content *'),
          Row({ gap: 10, width: 'fill_container' }, [
            Option('Clean', null, true),
            Option('Explicit', null),
          ]),
          Select('Primary genre *', 'Electronic'),
          Select('Secondary genre', 'Ambient'),
          Check(
            'Done',
            'Required details complete',
            'Optional fields can remain empty and will not block the next step.',
          ),
        ]),
      ],
      [
        ['Release type', 'Single'],
        ['Tracks', '1'],
        ['Details', 'Ready'],
      ],
      'Required details are complete.',
      'Continue to contributors',
    ),
    more: [
      st(
        'Required error',
        wizShell,
        wiz(
          2,
          'Add the public details listeners will see.',
          (_m) => [
            panel('Release and track details', [
              Input('Release title *', 'Enter release title'),
              FieldError('Enter a release title.'),
              Input('Track title *', 'Night Signal'),
            ]),
          ],
          [['Details', 'Incomplete']],
          '1 required field missing · Enter a release title to continue.',
          'Continue to contributors',
        ),
      ),
      st(
        'Saving',
        wizShell,
        wiz(
          2,
          'Add the public details listeners will see.',
          (_m) => [
            panel('Release and track details', [
              Input('Release title *', 'Afterglow'),
              Tx('Muted', 'Saving…'),
            ]),
          ],
          [['Draft', 'Pending']],
          'Saving…',
          'Continue to contributors',
        ),
      ),
      st(
        'Save failed',
        wizShell,
        wiz(
          2,
          'Add the public details listeners will see.',
          (_m) => [
            Alert(
              'Draft could not be saved. Your changes are still here.',
              'Check the connection and try again.',
            ),
            panel('Release and track details', [Input('Release title *', 'Afterglow')]),
          ],
          [['Draft', 'Save failed']],
          'Your entered values are kept.',
          'Try again',
        ),
      ),
    ],
  },
  'create-release-contributors': {
    title: 'Artist / Create release / 4 Contributors & rights',
    route: 'designed — /dashboard/music/new (step 4)',
    context: 'Credit everyone and confirm rights.',
    shell: wizShell,
    mHeight: 1800,
    build: wiz(
      3,
      'Credit everyone and confirm the rights information.',
      (_m) => [
        panel('Contributors', [
          Tx('Muted', 'Add every person involved and assign at least one role.'),
          Person('TR', 'Taylor Reid', 'Release contributor', [
            Badge('Primary artist', 'secondary'),
            Badge('Songwriter', 'secondary'),
          ]),
          Person('JL', 'Jordan Lee', 'Release contributor', [
            Badge('Producer', 'secondary'),
            Badge('Mixer', 'secondary'),
          ]),
          Button('Add contributor', 'outline', { icon: 'plus' }),
        ]),
        panel('Rights confirmation', [
          Tx('Muted', 'Confirm what is true for this draft before review.'),
          Check(
            'Done',
            'This artist controls the master recording',
            'Choose another owner if that is not accurate.',
            'Change owner',
          ),
          Check(
            'Done',
            'All songwriters and composers are listed',
            'Taylor Reid is credited as Songwriter.',
          ),
          CheckRow('I confirm this information is accurate'),
        ]),
      ],
      [
        ['Contributors', '2 added'],
        ['Rights', 'Confirmed'],
      ],
      'Contributor and rights checks are complete.',
      'Continue to review',
    ),
    more: [
      st(
        'Needs roles & rights',
        wizShell,
        wiz(
          3,
          'Credit everyone and confirm the rights information.',
          (_m) => [
            panel('Contributors', [
              Person('TR', 'Taylor Reid', 'Complete', [Badge('Songwriter', 'secondary')]),
              Person('JL', 'Jordan Lee', 'Choose at least one role', [Status('Needs role')]),
            ]),
            panel(
              'Rights incomplete',
              [
                Check('Blocked', 'Choose the master owner'),
                Check('Blocked', 'Confirm all writers are listed'),
                Check('Blocked', 'Confirm the information is accurate'),
              ],
              { right: Status('3 blockers', 'Warning') },
            ),
          ],
          [
            ['Contributors', 'Needs role'],
            ['Rights', 'Pending'],
          ],
          '4 blockers · All items are required before review.',
          'Continue to review',
        ),
        1800,
      ),
    ],
  },
  'create-release-review': {
    title: 'Artist / Create release / 5 Final review',
    route: 'designed — /dashboard/music/new (step 5)',
    context: 'Every step in one auditable summary before submission.',
    shell: wizShell,
    mHeight: 1800,
    build: wiz(
      4,
      'Check every part of the draft before you submit it.',
      (_m) => [
        panel(null, [
          releaseHead('Afterglow', 'Single · 1 track · Night Signal · Clean · Electronic', 'Ready'),
        ]),
        panel('Readiness checklist', [
          Tx('Muted', 'Choose Edit to return to the exact step.'),
          Check('Done', 'Night Signal.wav', 'Audio', 'Edit audio'),
          Check('Done', 'Cover artwork added', 'Artwork', 'Edit artwork'),
          Check('Done', 'Titles, explicit answer and genres', 'Details', 'Edit details'),
          Check('Done', '2 people with roles', 'Contributors', 'Edit people'),
          Check('Done', 'Master owner and confirmations', 'Rights', 'Edit rights'),
        ]),
        Alert(
          'Submission starts Bitrate review.',
          'It does not deliver this release to streaming services.',
        ),
      ],
      [
        ['Status', 'Ready'],
        ['Blockers', '0'],
      ],
      'Creates a Bitrate review request only.',
      'Submit for review',
    ),
    more: [
      st(
        'Blocked',
        wizShell,
        wiz(
          4,
          'Check every part of the draft before you submit it.',
          (_m) => [
            panel(
              'Readiness checklist',
              [
                Check('Blocked', 'Artwork is missing', 'Artwork', 'Edit artwork'),
                Check('Blocked', 'Jordan Lee needs a role', 'Contributors', 'Edit person'),
              ],
              { right: Status('2 blockers', 'Warning') },
            ),
          ],
          [['Blockers', '2']],
          'Resolve 2 blockers before submission.',
          'Submit for review',
        ),
      ),
      st(
        'Submitting',
        wizShell,
        wiz(
          4,
          'Check every part of the draft before you submit it.',
          (_m) => [
            panel(null, [
              Tx('H4', 'Creating review request…'),
              Progress(),
              Tx('Muted', 'The saved draft remains available. No external delivery starts here.'),
            ]),
          ],
          [['Status', 'In review']],
          'Keep this page open.',
          'Submitting…',
        ),
      ),
      st(
        'Submit error',
        wizShell,
        wiz(
          4,
          'Check every part of the draft before you submit it.',
          (_m) => [
            Alert(
              'Review request was not created.',
              'Connection was interrupted. Your saved draft and confirmation remain.',
            ),
          ],
          [['Status', 'Error']],
          'Check the connection and try again.',
          'Try again',
        ),
      ),
      st('Submitted', wizShell, (_m) => [
        PageHeader(
          'Submitted for review',
          'Afterglow is now in Bitrate review. External delivery has not started.',
        ),
        EmptyState(
          'Review in progress',
          'The release workspace keeps this draft, status and next actions together.',
          'Open release workspace',
          'circle-check',
        ),
      ]),
    ],
  },
}
const wsShell = (crumb, action) => ({
  nav: 'music',
  crumb: `Music / Afterglow${crumb ? ` / ${crumb}` : ''}`,
  action,
  actionIcon: null,
})
const wsTabs = (i) => tabs(['Overview', 'Tasks', 'Feedback', 'Delivery', 'Versions', 'Activity'], i)
export const releasePages = {
  'release-workspace': pair(
    'Release workspace',
    {
      title: 'Artist / Release workspace',
      route: '/dashboard/music/$releaseId',
      context:
        'One release: status, next action, timeline, readiness, rights, tracks, participants.',
      shell: wsShell(null, 'Back to music'),
      mHeight: 2000,
    },
    (m) => [
      releaseHead('Afterglow', 'Demo artist · Single · Updated Sep 09 UTC', 'Review in progress'),
      wsTabs(0),
      ...two(
        m,
        [
          panel(null, [
            Tx('Eyebrow', 'NEXT ACTION'),
            Tx('H3', 'Answer the rights question'),
            Tx('Paragraph', 'One reviewer question needs your confirmation.', { wrap: true }),
            Row({ gap: 10 }, [
              Button('Open feedback', 'default'),
              Button('View tracks', 'outline'),
            ]),
          ]),
          panel('Release timeline', [
            Stepper(WORKFLOW, 1, m),
            Tx('Caption', 'Bitrate review is available; delivery is coming soon.'),
          ]),
          panel('Tracks (1)', [
            Tx('Muted', 'Recordings linked to this release.'),
            Tr([
              cell('1. Night Signal', 'fill_container', 'Body Strong'),
              cell('Original · 3:56', 140),
              cell('No ISRC yet', 120),
              cell(Button('ISRC', 'ghost'), 80),
            ]),
          ]),
          panel(
            'Participants (2)',
            [
              Person('TR', 'Taylor Reid', 'Primary artist, Songwriter', [
                Button('Edit roles', 'ghost'),
              ]),
              Person('JL', 'Jordan Lee', 'Assign at least one role.', [Status('Needs role')]),
              Tx(
                'Caption',
                'Credits do not grant workspace access. Rights and revenue splits are coming soon.',
              ),
            ],
            { right: Button('Add contributor', 'outline', { icon: 'plus' }) },
          ),
        ],
        [
          panel(
            'Readiness checklist',
            [
              Check('Blocked', 'Choose the master owner'),
              Check('Done', 'Add at least one track'),
              Check('Pending', 'No UPC yet — a code is needed before delivery'),
            ],
            { right: Status('2 blockers', 'Warning') },
          ),
          panel('Preparation summary', [
            Kv('Tracks linked', '1'),
            Kv('Artwork', 'Added'),
            Kv('Scheduled date', 'Not scheduled'),
            Button('Edit schedule', 'outline', { width: 'fill_container' }),
            Tx('Caption', 'Preparation details do not confirm approval or external delivery.'),
          ]),
          panel('Rights and identifiers', [
            Kv('Master owner', 'Not chosen'),
            Kv('UPC/EAN', 'Not provided'),
            Row({ gap: 8 }, [Button('Edit rights', 'outline'), Button('Edit UPC', 'ghost')]),
          ]),
          panel('Submission', [
            CheckRow('I reviewed the information in this draft.'),
            Button('Submit for review', 'default', { width: 'fill_container' }),
            Tx(
              'Caption',
              'Creates a Bitrate review request only. It does not deliver this release to streaming services.',
            ),
          ]),
        ],
      ),
    ],
    [
      st('Changes requested', wsShell(null, 'Back to music'), (_m) => [
        releaseHead('Afterglow', 'Demo artist · Single', 'Changes requested'),
        panel('2 required changes', [
          Check('Blocked', 'Confirm master owner'),
          Check('Blocked', 'Replace cover artwork'),
          Tx('Muted', 'Existing draft stays intact. Review pauses until resubmission.'),
          Button('Review changes', 'default'),
        ]),
      ]),
      st('Approved', wsShell(null, 'Back to music'), (m) => [
        releaseHead('Afterglow', 'Demo artist · Single', 'Approved'),
        panel('Review completed', [
          Tx(
            'Paragraph',
            'Bitrate review is complete; preparation comes next. External delivery has not started.',
            { wrap: true },
          ),
          Stepper(WORKFLOW, 2, m),
          Button('Continue to prepare', 'default'),
        ]),
      ]),
      st('Status unavailable', wsShell(null, 'Back to music'), (_m) => [
        releaseHead('Afterglow', 'Demo artist · Single', 'Draft'),
        ErrorState(
          'Status could not be loaded',
          'Connection was interrupted. Saved release work is unaffected.',
          'Try again',
          'triangle-alert',
          'Return to Music',
        ),
      ]),
      st('Edit rights dialog', wsShell(null, 'Back to music'), (m) => [
        Panel(
          [
            Tx('H3', 'Rights confirmation'),
            Tx('Paragraph', 'Confirm what is true for this draft before review.', { wrap: true }),
            Tx('Body Strong', 'Who controls the master recording?'),
            Option('Demo artist (this artist)', null, true),
            Option('Another owner, such as a label', null),
            CheckRow('All songwriters and composers are listed'),
            CheckRow('I confirm this information is accurate'),
            Row({ gap: 10 }, [Button('Save rights', 'default'), Button('Cancel', 'ghost')]),
          ],
          { width: m ? 'fill_container' : 560 },
        ),
      ]),
      st('Splits dialog', wsShell(null, 'Back to music'), (m) => [
        Panel(
          [
            Tx('H3', 'Master splits'),
            Person('TR', 'Taylor Reid', 'Primary artist', [Input(null, '60%', 90)]),
            Person('JL', 'Jordan Lee', 'Producer', [Input(null, '30%', 90)]),
            Kv('Total', '90% of 100%'),
            FieldError('A draft can stay below 100%, but review requires exactly 100%.'),
            Row({ gap: 10 }, [Button('Save splits', 'default'), Button('Cancel', 'ghost')]),
          ],
          { width: m ? 'fill_container' : 560 },
        ),
      ]),
      st('Schedule dialog', wsShell(null, 'Back to music'), (m) => [
        Panel(
          [
            Tx('H3', 'Release timing'),
            Tx(
              'Paragraph',
              'Save a planned date and time. This does not submit or deliver your release.',
              { wrap: true },
            ),
            CheckRow('Set a planned release date'),
            Row({ gap: 10, width: 'fill_container' }, [
              Input('Release date', 'Sep 18, 2026'),
              Input('Time (UTC)', '00:00'),
            ]),
            Tx('Caption', 'Time zone: UTC. Uncheck the planned date to clear the schedule.'),
            Row({ gap: 10 }, [Button('Save schedule', 'default'), Button('Cancel', 'ghost')]),
          ],
          { width: m ? 'fill_container' : 560 },
        ),
      ]),
      st('Loading', wsShell(null, 'Back to music'), (m) => [
        Tx('H3', 'Loading the latest draft…'),
        Skeleton('collection', m),
      ]),
    ],
  ),
  'reviewer-feedback': pair(
    'Feedback',
    {
      title: 'Artist / Reviewer feedback',
      route: 'designed — /dashboard/music/$releaseId (Feedback)',
      context: 'Required changes block resubmission; recommendations never do.',
      shell: wsShell('Feedback', 'Release overview'),
      mHeight: 1800,
    },
    (m) => [
      releaseHead(
        'Afterglow',
        'Demo artist · Single · 1 track · Updated 6 min ago',
        'Changes requested',
      ),
      wsTabs(2),
      Alert(
        'Resolve 2 required changes before resubmitting',
        'Recommendations are optional and never block the review. 0 of 2 resolved.',
      ),
      ...two(
        m,
        [
          panel(
            'Reviewer notes',
            [
              Tx('Eyebrow', 'REQUIRED CHANGE · RIGHTS'),
              Tx('H4', 'Confirm the master recording owner'),
              Tx(
                'Paragraph',
                'The listed owner needs an explicit confirmation before review can continue.',
                { wrap: true },
              ),
              Input('Your response', 'I confirm Demo artist owns the master recording.'),
              Button('Save & mark resolved', 'default'),
              Divider(),
              Tx('Eyebrow', 'REQUIRED CHANGE · ARTWORK'),
              Tx('H4', 'Replace the cover artwork'),
              Button('Edit artwork', 'outline'),
              Divider(),
              Tx('Eyebrow', 'RECOMMENDATION · OPTIONAL'),
              Tx('H4', 'Clarify the mix version label'),
              Button('Dismiss', 'ghost'),
            ],
            { right: Badge('3 open items', 'outline') },
          ),
        ],
        [
          panel('Review progress', [
            Tx('Muted', '0 of 2 required resolved'),
            Progress(),
            Check('Blocked', 'Confirm master owner'),
            Check('Blocked', 'Replace cover artwork'),
            Check('Pending', 'Version label · optional'),
            Button('Resolve required changes first', 'secondary', { width: 'fill_container' }),
            Tx('Caption', 'Resubmit returns this release to Bitrate review only.'),
          ]),
        ],
      ),
    ],
    [
      st('Saving response', wsShell('Feedback', 'Release overview'), (_m) => [
        panel('Confirm master owner', [
          Input('Your response', 'I confirm Demo artist owns the master recording.'),
          Button('Saving response…', 'default'),
        ]),
      ]),
      st('Ready to resubmit', wsShell('Feedback', 'Release overview'), (_m) => [
        panel('2 of 2 resolved', [
          Check('Done', 'Master owner confirmed', 'Resolved just now', 'View response'),
          Check('Done', 'Cover artwork replaced', 'Resolved'),
          Button('Resubmit for review', 'default'),
        ]),
      ]),
      st('Resubmit error', wsShell('Feedback', 'Release overview'), (_m) => [
        ErrorState(
          'Could not resubmit',
          'The release is still in Changes requested. Saved responses remain available.',
          'Try again',
          'triangle-alert',
          null,
        ),
      ]),
    ],
  ),
  'release-tasks': pair(
    'Tasks',
    {
      title: 'Artist / Release tasks',
      route: '/dashboard/tasks (placeholder in code) · designed per release',
      context: 'Owners, deadlines with timezone, blockers.',
      shell: { nav: 'music', crumb: 'Music / Afterglow / Tasks', action: 'New task' },
      mHeight: 1800,
    },
    (m) => [
      releaseHead('Afterglow', 'Single · Review stage · Demo artist', 'In review'),
      stats(m, [
        ['OPEN', '5', 'Tasks'],
        ['BLOCKERS', '2', 'Block review'],
        ['NEXT DEADLINE', 'Today · 17:00', 'Europe/Kyiv'],
      ]),
      wsTabs(1),
      Row({ gap: 8 }, [Chip3('ALL'), Chip3('OPEN 5'), Chip3('BLOCKERS 2')]),
      ...two(
        m,
        [
          Col({ width: 'fill_container', gap: 0 }, [
            !m && Th([['Task'], ['Status', 150], ['Owner', 80], ['Due', 140]]),
            ...[
              ['Confirm master recording owner', 'Review blocker', 'YOU', 'Today · 17:00'],
              ['Replace cover artwork', 'Review blocker', 'MS', 'Today · 18:00'],
              ['Prepare editorial pitch copy', 'In review', 'JO', 'Sep 10 · 12:00'],
              ['Check release notes', 'Draft', '—', 'No due date'],
            ].map(([t, s, o, d]) =>
              m
                ? Tr([cell(t, 'fill_container', 'Body Strong'), cell(Status(s), 130)])
                : Tr([
                    cell(t, 'fill_container', 'Body Strong'),
                    cell(Status(s), 150),
                    cell(o, 80),
                    cell(d, 140),
                  ]),
            ),
          ]),
        ],
        [
          panel('Plan at a glance', [
            Kv('UPCOMING', 'Today · 2 tasks'),
            Kv('You', '2 open'),
            Kv('Maya Stone', '1 open'),
            Kv('Jordan Lee', '1 active'),
            Alert('2 tasks block review', 'Resolve both before resubmitting.'),
            Button('Open blocking feedback', 'outline', { width: 'fill_container' }),
          ]),
        ],
      ),
    ],
    [
      st('Placeholder (current app)', { nav: 'dashboard', crumb: 'Tasks' }, (_m) => [
        EmptyState(
          'Tasks',
          'Release tasks, deadlines and collaborators will appear here when release preparation is available.',
          'Back to dashboard',
          'list-checks',
        ),
      ]),
    ],
  ),
  'delivery-plan': pair(
    'Delivery plan',
    {
      title: 'Artist / Delivery plan',
      route: '/dashboard/distribution (placeholder in code) · designed per release',
      context: 'Timing and destinations; saving never sends anything.',
      shell: wsShell('Delivery', 'Release overview'),
      mHeight: 1800,
    },
    (m) => [
      releaseHead(
        'Afterglow',
        'Single · Approved for Bitrate review · Planned Sep 18, 2026 · Europe/Kyiv',
        'Approved',
      ),
      wsTabs(3),
      ...two(
        m,
        [
          panel('Release timing', [
            Tx('Muted', 'This remains a plan until the release is submitted for delivery.'),
            (m ? Col : Row)({ gap: 10, width: 'fill_container' }, [
              Input('Release date', 'Sep 18, 2026'),
              Input('Time', '00:00'),
              Select('Time zone', 'Europe/Kyiv'),
            ]),
            Tx(
              'Caption',
              'Changing the time zone changes the displayed local time, not the selected instant.',
            ),
          ]),
          panel(
            'Destinations',
            [
              R(
                'Setting Row',
                {},
                {
                  title: { content: 'Spotify' },
                  desc: { content: 'Connect an account to continue.' },
                  control: L({ gap: 8, alignItems: 'center' }, [
                    Status('Not connected'),
                    Button('Connect', 'outline'),
                  ]),
                },
              ),
              R(
                'Setting Row',
                {},
                {
                  title: { content: 'Apple Music' },
                  desc: { content: 'Connection request is still pending.' },
                  control: L({ gap: 8, alignItems: 'center' }, [
                    Status('Pending'),
                    Button('View status', 'ghost'),
                  ]),
                },
              ),
              R(
                'Setting Row',
                {},
                {
                  title: { content: 'YouTube Music' },
                  desc: { content: 'Delivery is not available in this demo.' },
                  control: L({ gap: 8, alignItems: 'center' }, [Status('Unavailable')]),
                },
              ),
            ],
            { right: Badge('0 of 3 ready', 'outline') },
          ),
        ],
        [
          panel('Before you continue', [
            Check('Done', 'Bitrate review approved'),
            Check('Done', 'Release date selected'),
            Check('Blocked', 'No destination is ready'),
            Tx('Eyebrow', 'NEXT ACTION'),
            Tx('Body Strong', 'Connect at least one destination'),
            Button('Save delivery plan', 'default', { width: 'fill_container' }),
            Button('Preview timeline', 'outline', { width: 'fill_container' }),
            Tx('Caption', 'Saving this plan does not send the release to any external platform.'),
          ]),
        ],
      ),
    ],
    [
      st('Placeholder (current app)', { nav: 'dashboard', crumb: 'Distribution' }, (_m) => [
        EmptyState(
          'Distribution',
          'External delivery is not connected. No music has been sent to a streaming service from this workspace.',
          'Back to dashboard',
          'send',
        ),
      ]),
    ],
  ),
  'delivery-status': pair(
    'Delivery status',
    {
      title: 'Artist / Delivery status',
      route: 'designed — release delivery status',
      context: 'Ready to submit is not delivered; pending and unavailable stay distinct.',
      shell: wsShell('Delivery status', 'Edit plan'),
      mHeight: 1600,
    },
    (m) => [
      releaseHead('Afterglow', 'Single · Planned Sep 18, 2026', 'Pending'),
      wsTabs(3),
      Alert(
        'No external submission has been sent',
        'Review a ready destination before any handoff. Connection states are demonstration data.',
      ),
      ...two(
        m,
        [
          panel(
            'Destination readiness',
            [
              R(
                'Setting Row',
                {},
                {
                  title: { content: 'Spotify' },
                  desc: { content: 'Metadata and artwork checks complete.' },
                  control: L({ gap: 8, alignItems: 'center' }, [
                    Status('Ready'),
                    Button('Review', 'outline'),
                  ]),
                },
              ),
              R(
                'Setting Row',
                {},
                {
                  title: { content: 'Apple Music' },
                  desc: { content: 'Waiting for the connection request.' },
                  control: L({ gap: 8, alignItems: 'center' }, [Status('Pending')]),
                },
              ),
              R(
                'Setting Row',
                {},
                {
                  title: { content: 'YouTube Music' },
                  desc: { content: 'Delivery is not available in this demo.' },
                  control: L({ gap: 8, alignItems: 'center' }, [Status('Unavailable')]),
                },
              ),
            ],
            { right: Tx('Caption', 'Updated just now') },
          ),
        ],
        [
          panel('Ready destination', [
            Check('Done', 'Audio master ready'),
            Check('Done', 'Artwork ready'),
            Check('Done', 'Metadata ready'),
            Check('Done', 'Rights confirmed'),
            Button('Review ready submission', 'default', { width: 'fill_container' }),
            Button('Edit delivery plan', 'outline', { width: 'fill_container' }),
          ]),
        ],
      ),
    ],
  ),
  'post-release': pair(
    'After launch',
    {
      title: 'Artist / Post-release',
      route: 'designed — release after launch',
      context: 'Published on Bitrate is separate from external destinations.',
      shell: wsShell('After launch', 'Release overview'),
      mHeight: 1800,
    },
    (m) => [
      releaseHead('Afterglow', 'Single · Demo artist · Sep 18, 2026', 'Live'),
      wsTabs(0),
      ...two(
        m,
        [
          panel('Release links', [
            Tx('Muted', 'Availability is shown per destination; missing links are never implied.'),
            R(
              'Setting Row',
              {},
              {
                title: { content: 'Primary release page' },
                desc: { content: 'Demo link' },
                control: L({ gap: 8, alignItems: 'center' }, [
                  Status('Available', 'Success'),
                  Button('Copy link', 'outline'),
                ]),
              },
            ),
            R(
              'Setting Row',
              {},
              {
                title: { content: 'Spotify' },
                desc: { content: 'No public link received yet.' },
                control: L({ gap: 8, alignItems: 'center' }, [Status('Pending')]),
              },
            ),
            R(
              'Setting Row',
              {},
              {
                title: { content: 'Apple Music' },
                desc: { content: 'Destination was not connected.' },
                control: L({ gap: 8, alignItems: 'center' }, [Status('Unavailable')]),
              },
            ),
          ]),
          stats(m, [
            ['PLAYS', '1,284', 'Source · Bitrate'],
            ['LISTENERS', '742', 'Updated 12 min ago'],
            ['SAVES', '96', 'Demo data'],
          ]),
        ],
        [
          panel('What happens next', [
            Check('Pending', 'Share the Bitrate link', 'Due today · Assigned to you'),
            Check('Pending', 'Review first-week signals', 'Due Sep 25 · Bitrate data'),
            Check('Pending', 'Prepare a promotion plan', 'Optional · Not started'),
            Button('Plan promotion', 'default', { width: 'fill_container' }),
          ]),
        ],
      ),
    ],
  ),
  'metadata-editor': pair(
    'Metadata',
    {
      title: 'Artist / Metadata editor',
      route: 'designed — /dashboard/music/$trackId metadata',
      context: 'Keep release and track details accurate.',
      shell: {
        nav: 'music',
        crumb: 'Music / Night Signal',
        action: 'Open workspace',
        actionIcon: null,
      },
      mHeight: 1800,
    },
    (m) => [
      PageHeader('Edit metadata', 'Keep release and track details accurate', [], 'NIGHT SIGNAL'),
      tabs(['Track details', 'Release details', 'Contributors & rights']),
      ...two(
        m,
        [
          panel(null, [
            Row({ width: 'fill_container', justifyContent: 'space_between' }, [
              Status('Unsaved changes', 'Warning'),
              Tx('Caption', 'Fields marked required block review when missing.'),
            ]),
            Input('Track title (Required)', 'Night Signal'),
            Input('Version (Optional)', 'Original mix'),
            Select('Release', 'Afterglow · Single'),
            Select('Lyrics language', 'English'),
            (m ? Col : Row)({ gap: 10, width: 'fill_container' }, [
              Select('Primary genre', 'Electronic'),
              Select('Secondary genre', 'Downtempo'),
            ]),
            Tx('Body Strong', 'Explicit content'),
            Row({ gap: 10, width: 'fill_container' }, [
              Option('No', null, true),
              Option('Yes', null),
            ]),
            Kv('ISRC (read only)', 'Not assigned'),
            Row({ gap: 10 }, [Button('Save changes', 'default'), Button('Discard', 'ghost')]),
          ]),
        ],
        [
          panel('Catalog context', [
            Kv('RELEASE', 'Afterglow'),
            Kv('STATUS', Status('In review')),
            Kv('LAST UPDATED', 'Sep 09, 2026 · 11:14 EEST'),
            Tx(
              'Paragraph',
              'Open the release workspace for tasks, versions and reviewer feedback.',
              { wrap: true },
            ),
            Tx('Caption', 'Catalog metadata stays private until the release is published.'),
          ]),
        ],
      ),
    ],
  ),
  'track-order': pair(
    'Track order',
    {
      title: 'Artist / EP track order',
      route: 'designed — release track order',
      context: 'Set the listening sequence before review.',
      shell: {
        nav: 'music',
        crumb: 'Music / Afterglow EP',
        action: 'Save order',
        actionIcon: null,
      },
      mHeight: 1600,
    },
    (m) => [
      PageHeader(
        'Track order',
        'Set the listening sequence before review',
        [],
        'AFTERGLOW · EP · DRAFT',
      ),
      ...two(
        m,
        [
          panel(
            'Afterglow EP',
            [
              Tx('Muted', '5 tracks · 18:42 total · draft order'),
              ...[
                ['Night Signal', 'Original mix · 3:56', 'Ready'],
                ['Static Lines', '3:47', 'Ready'],
                ['Drift Control', 'Radio edit · 3:19', 'Needs details'],
                ['Afterglow', '4:02', 'Processing'],
                ['Echoes in Motion', 'Extended mix · 3:38', 'Ready'],
              ].map(([t, meta, s], i) =>
                R(
                  'Candidate Row/Compact',
                  {},
                  {
                    rank: { content: String(i + 1) },
                    cover: {
                      fill: img(ART[['night', 'static', 'drift', 'afterglow', 'echoes'][i]]),
                    },
                    title: { content: t },
                    meta: { content: `${meta} · ${s}` },
                  },
                ),
              ),
              Tx('Caption', 'Drag tracks or use Move up / Move down from each row menu.'),
              Row({ gap: 10 }, [
                Button('Add track', 'outline', { icon: 'plus' }),
                Button('Reset', 'ghost'),
              ]),
            ],
            { right: Status('Unsaved order', 'Warning') },
          ),
        ],
        [
          panel('Order readiness', [
            Tx('Muted', '3 / 5 ready · Three tracks can proceed.'),
            Check(
              'Blocked',
              'Drift Control needs details',
              'Add the missing primary genre before review.',
              'Edit metadata',
            ),
            Check(
              'Pending',
              'Afterglow is processing',
              'You can reorder it, but review stays unavailable.',
            ),
          ]),
        ],
      ),
    ],
  ),
  'music-lifecycle': pair(
    'Lifecycle',
    {
      title: 'Artist / Music lifecycle & archive',
      route: 'designed — lifecycle, archive and delete',
      context: 'What can be changed, archived or deleted in each state.',
      shell: {
        nav: 'music',
        crumb: 'Music / Lifecycle',
        action: 'Back to music',
        actionIcon: null,
      },
      mHeight: 1800,
    },
    (m) => [
      PageHeader('States & archive', 'Know what can be changed, archived or deleted'),
      panel('Music lifecycle', [
        Tx('Muted', 'Status always includes meaning and next action.'),
        Row(
          { gap: 8 },
          ['Draft', 'Processing', 'Processing failed', 'In review', 'Published'].map((s) =>
            Status(s),
          ),
        ),
      ]),
      panel('Actions by current state', [
        !m && Th([['Item'], ['State', 140], ['Available actions', 240], ['Impact', 220]]),
        ...[
          ['Neon Sketches', 'Draft', 'Edit · Archive · Delete draft', 'No public listeners'],
          ['Parallel Minds', 'Processing failed', 'Retry · Remove upload', 'Draft remains intact'],
          ['Afterglow', 'In review', 'Open workspace', 'Archive unavailable during review'],
          ['Night Signal', 'Published', 'Archive', 'Analytics and history preserved'],
        ].map(([t, s, a, i]) =>
          m
            ? Tr([cell(t, 'fill_container', 'Body Strong'), cell(Status(s), 140)])
            : Tr([
                cell(t, 'fill_container', 'Body Strong'),
                cell(Status(s), 140),
                cell(a, 240),
                cell(i, 220),
              ]),
        ),
      ]),
    ],
    [
      st('Archive confirmation', { nav: 'music', crumb: 'Music / Lifecycle' }, (m) => [
        Panel(
          [
            Tx('Eyebrow', 'PUBLISHED RELEASE'),
            Tx('H3', 'Archive Night Signal?'),
            Tx(
              'Paragraph',
              'The release will disappear from your public catalog on Bitrate. Existing analytics, comments and history stay.',
              { wrap: true },
            ),
            Kv('Preserved', 'Analytics · history · release workspace'),
            Kv('Hidden publicly', 'Removed from the artist catalog'),
            Tx('Caption', 'You can restore this release later.'),
            Row({ gap: 10 }, [Button('Archive release', 'destructive'), Button('Cancel', 'ghost')]),
          ],
          { width: m ? 'fill_container' : 520 },
        ),
      ]),
    ],
  ),
}
function Chip3(l) {
  return R('Chip/Default', {}, { label: { content: l } })
}
function legal() {
  return [
    R(
      'Alert/Warning',
      {},
      {
        text: {
          content:
            'Draft — pending legal review. This draft covers only the hosting licence needed for uploads today.',
        },
      },
    ),
    Tx('Eyebrow', 'LEGAL'),
    Tx('H1', 'Artist Agreement'),
    Tx('H3', '1. What Bitrate is'),
    Tx(
      'Paragraph',
      'Bitrate is a service you use to host and share your music. Bitrate is not a record label, publisher or manager and does not acquire ownership of your recordings or compositions.',
      { wrap: true },
    ),
    Tx('H3', '2. Your content and warranties'),
    Tx('Paragraph', '2.1 "Your Content" means audio, artwork, titles and metadata you upload.', {
      wrap: true,
    }),
    ...[
      '3. Licence to Bitrate',
      '4. Removal and disputes',
      '5. Indemnity',
      '6. Payments',
      '7. Term and termination',
      '8. Governing law',
      '9. Contact',
    ].map((h) => Tx('H4', h)),
    Divider(),
    Tx('Body Strong', 'Other legal documents'),
    ...['Terms of Use', 'Privacy Policy', 'Community Guidelines', 'Complaints', 'Copyright'].map(
      (d) => Tx('Link', d),
    ),
  ]
}
