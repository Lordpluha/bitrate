// Every screen of the web player, composed only from library instances (see ui.mjs).
import { TRACKS } from './kit.mjs'
import {
  R,
  L,
  Row,
  Col,
  Fill,
  Spacer,
  Tx,
  Ic,
  Cover,
  BigCover,
  Avatar,
  Chip,
  Chips,
  Divider,
  IconBtn,
  Play,
  Logo,
  Concept,
  AlbumCard,
  ArtistCard,
  PlaylistCard,
  CardRow,
  TrackTable,
  MobileTrack,
  ErrorState,
  withMore,
  EmptyState,
  OfflineState,
  Skeleton,
  Panel,
  Menu,
  SettingRow,
  SectionHeader,
  CollectionHeader,
  FieldError,
  CheckRow,
  Desktop,
  Mobile,
  MHeader,
  AuthDesktop,
  AuthMobile,
  CardDesktop,
  Blank,
  state,
  Button,
  Input,
  Select,
  Switch,
  Badge,
  Tab,
  Progress,
  Alert,
  C,
  ART,
} from './ui.mjs'
import { img, Ref } from './kit.mjs'
import { landing } from './pages-landing.mjs'
import { friends, friendsFind, friendsRequests } from './pages-friends.mjs'
import { loading } from './pages-loading.mjs'
import { APP_STATES } from './pages-app.mjs'

const T5 = TRACKS.slice(0, 5)
const mrows = (rows) => rows.map((t) => MobileTrack(t[0], t[1], t[4]))
const bar = ({ like, invite, download = true } = {}) =>
  R(
    'Action Bar',
    {},
    {
      like: like ? undefined : { enabled: false },
      invite: invite ? undefined : { enabled: false },
      download: download ? undefined : { enabled: false },
    },
  )
const title = (t, sub, o = {}) =>
  Col({ name: 'Heading', gap: 8, width: 'fill_container' }, [
    Tx(o.size ?? 'H2', t, { wrap: true }),
    sub && Tx('Paragraph', sub, { wrap: true }),
  ])
const pageTitle = (t, right, concept) =>
  Row({ name: 'Page Title', width: 'fill_container', justifyContent: 'space_between' }, [
    Row({ gap: 10 }, [Tx('H1', t), concept && Concept()]),
    right,
  ])
const mobileHero = (art, t, sub) => [
  Row({ name: 'Cover Area', width: 'fill_container', justifyContent: 'center' }, [
    art === 'liked' ? R('Media/Liked Cover', { width: 220, height: 220 }) : BigCover(art, 220),
  ]),
  Col({ gap: 4, width: 'fill_container' }, [Tx('H2', t, { wrap: true }), Tx('Muted', sub)]),
  Row({ width: 'fill_container', gap: 18 }, [
    Ic('heart'),
    Ic('circle-arrow-down'),
    Ic('ellipsis'),
    Spacer(),
    Ic('shuffle'),
    Play(true),
  ]),
]
/** Loading / error / not-found pairs shared by data screens. */
const std = (m, { loading = 'list', error, notFound, mobileOpts = {}, desktopOpts = {} } = {}) =>
  [
    loading &&
      state(
        'Loading',
        () => Desktop(`${m} loading`, [Skeleton(loading)], desktopOpts),
        () => Mobile(`${m} loading`, [Skeleton(loading, true)], mobileOpts),
      ),
    error &&
      state(
        'Error',
        () => Desktop(`${m} error`, [ErrorState(...error)], desktopOpts),
        () => Mobile(`${m} error`, [ErrorState(...error)], mobileOpts),
      ),
    notFound &&
      state(
        'Not found',
        () => Desktop(`${m} not found`, [EmptyState(...notFound)], desktopOpts),
        () => Mobile(`${m} not found`, [EmptyState(...notFound)], mobileOpts),
      ),
  ].filter(Boolean)

/* ---------------- auth ---------------- */
const providers = () =>
  Col({ name: 'Social Sign-in', width: 'fill_container', gap: 10 }, [
    CheckRow('I accept the Terms of Use and Privacy Policy'),
    Button('Continue with Google', 'outline', { width: 'fill_container' }),
    Row(
      { name: 'Providers 1', width: 'fill_container', gap: 8 },
      [
        ['Facebook', false],
        ['Apple', true],
      ].map(([p, soon]) =>
        R(
          'Auth/Provider',
          {},
          { label: { content: p }, soon: soon ? undefined : { enabled: false } },
        ),
      ),
    ),
    Row(
      { name: 'Providers 2', width: 'fill_container', gap: 8 },
      ['Discord', 'GitHub'].map((p) => R('Auth/Provider', {}, { label: { content: p } })),
    ),
    Tx('Caption', '+ 9 more: Microsoft, X, Instagram, TikTok, Twitch, LinkedIn, Reddit, Telegram', {
      wrap: true,
    }),
  ])
const footer = (lead, link) =>
  Row({ name: 'Footer Link', gap: 6 }, [Tx('Muted', lead), Tx('Link', link)])
const loginForm = (extra) => [
  title('Login to your account', 'Welcome back! Please sign in to continue.'),
  extra,
  Col({ name: 'Fields', gap: 14, width: 'fill_container' }, [
    Input('Email Address', 'you@example.com'),
    Input('Password', '••••••••'),
    Row({ width: 'fill_container', justifyContent: 'end' }, [Tx('Link', 'Forgot password?')]),
  ]),
  Button('Log in', 'large-default', { width: 'fill_container' }),
  R('Auth/Or Divider'),
  providers(),
  footer("Don't have an account?", 'Sign up'),
]
const loggingIn = () => [
  title('Login to your account', 'Welcome back! Please sign in to continue.'),
  Col({ gap: 14, width: 'fill_container' }, [
    Input('Email Address', 'maya@example.com'),
    Input('Password', '••••••••'),
  ]),
  Button('Logging in...', 'large-default', { width: 'fill_container' }),
]
const twoFa = (err) => [
  title('Enter your 2FA code', 'Use the 6-digit code from your authenticator app.'),
  Input('Authentication code', '123456'),
  err && FieldError('Invalid or expired 2FA code'),
  Button('Verify', 'large-default', { width: 'fill_container' }),
]
const regForm = () => [
  title(
    'Create your account for free and start listening',
    'Sign up with your email or continue with a social account.',
  ),
  Col({ gap: 12, width: 'fill_container' }, [
    Input('Full Name', 'Maya Rivers'),
    Input('Email Address', 'you@example.com'),
    Input('Password', '••••••••'),
    Input('Confirm Password', '••••••••'),
  ]),
  CheckRow(
    'I am at least 16 years old, I accept the Terms of Use and Community Guidelines, and I have read the Privacy Policy.',
  ),
  Button('Register', 'large-default', { width: 'fill_container' }),
  R('Auth/Or Divider'),
  Button('Continue with Google', 'outline', { width: 'fill_container' }),
  footer('Already have an account?', 'Log in'),
]
const regErrors = () => [
  title('Create your account for free and start listening'),
  Col({ gap: 12, width: 'fill_container' }, [
    Input('Email Address', 'maya@example.com'),
    Input('Password', 'bitrate'),
    Input('Confirm Password', 'bitrat'),
  ]),
  Col(
    { gap: 6, width: 'fill_container' },
    [
      'Password must be at least 8 characters',
      'Password must include at least one uppercase letter',
      'Password must include at least one number',
      'Password must include at least one special character',
      "Passwords don't match",
      'You must accept the Terms of Use and Community Guidelines',
    ].map(FieldError),
  ),
  Button('Register', 'large-default', { width: 'fill_container' }),
]
const forgot = () => [
  title('Reset your password', 'Enter the email associated with your account.'),
  Input('Email address', 'you@example.com'),
  Button('Send reset link', 'large-default', { width: 'fill_container' }),
  Tx('Link', 'Back to login'),
]
const sent = () => [
  title('Reset your password', 'Enter the email associated with your account.'),
  Alert('Check your inbox', 'If an account exists for this email, a reset link has been sent.'),
  Button('Back to login', 'large-outline', { width: 'fill_container' }),
]
const reset = () => [
  title('Create a new password', 'Choose a new password for your account.'),
  Input('New password', '••••••••'),
  Input('Confirm new password', '••••••••'),
  Button('Update password', 'large-default', { width: 'fill_container' }),
]
const resetMismatch = () => [
  title('Create a new password', 'Choose a new password for your account.'),
  Input('New password', '••••••••'),
  Input('Confirm new password', '••••••'),
  FieldError("Passwords don't match"),
  Button('Update password', 'large-default', { width: 'fill_container' }),
]
const noToken = () => [
  title('Create a new password'),
  Alert(
    'Link incomplete',
    'This password reset link is missing its token. Request a new link and try again.',
  ),
  Button('Request another link', 'large-outline', { width: 'fill_container' }),
]
const verify = (token, busy) => [
  title(
    'Verify your email',
    token
      ? 'Confirm the email address connected to your account.'
      : 'Check your inbox or request a new verification link.',
  ),
  token &&
    Button(busy ? 'Verifying...' : 'Verify email', 'large-default', { width: 'fill_container' }),
  Input('Email address', 'maya@example.com'),
  Button('Resend verification email', 'large-secondary', { width: 'fill_container' }),
  Tx('Link', 'Back to login'),
]
const auth = (d, m, h) => ({
  desktop: () => AuthDesktop(d, m(), h),
  mobile: () => AuthMobile(d, m()),
})
const authState = (label, form, h) =>
  state(
    label,
    () => AuthDesktop(label, form(), h),
    () => AuthMobile(label, form()),
  )
const cardState = (label, form) =>
  state(
    label,
    () => CardDesktop(label, form()),
    () => AuthMobile(label, form()),
  )

/* ---------------- library / settings shared ---------------- */
const libHead = () =>
  Row({ width: 'fill_container', alignItems: 'end' }, [
    Col({ gap: 4, width: 'fill_container' }, [Tx('Eyebrow', 'YOUR LIBRARY'), Tx('H1', 'Library')]),
    Button('Create playlist', 'default', { icon: 'plus' }),
  ])
const libTabs = () =>
  Row({ name: 'Tabs', gap: 4 }, [
    Tab('Playlists', true),
    Tab('Liked tracks'),
    Tab('Albums'),
    Tab('History'),
  ])
const LIB_ITEMS = [
  ['Night Drive', 'Playlist · 24 songs', 'night'],
  ['Afterglow Sessions', 'Playlist · 18 songs', 'afterglow'],
  ['Static Lines', 'Album · Kite Harbor', 'static'],
  ['Echoes in Motion', 'Album · Lumen Choir', 'echoes'],
  ['Drift Control', 'Album · Mira Sol', 'drift'],
  ['Road Radio', 'Playlist · 31 songs', 'afterglow'],
  ['Low Orbit', 'Playlist · 12 songs', 'static'],
  ['Late Signal', 'Playlist · 9 songs', 'echoes'],
]
const cardGrid = (items, cols = 5) =>
  Col(
    { name: 'Grid', gap: 22 },
    Array.from({ length: Math.ceil(items.length / cols) }, (_, r) =>
      CardRow(items.slice(r * cols, r * cols + cols).map(([t, m, a]) => PlaylistCard(t, m, a))),
    ),
  )
const libMobileHeader = () => MHeader('Your Library', { back: false, actions: ['search', 'plus'] })
const settingsSections = (mobile, { twoFaOn, sessionsError } = {}) => {
  const sel = (v) => Select(null, v, mobile ? 150 : 220)
  const sec = (t, rows) =>
    Col({ name: `Section / ${t}`, width: 'fill_container', gap: 0 }, [Tx('H4', t), ...rows])
  return [
    sec('Account', [
      SettingRow('Edit login methods', null, Button('Edit', 'outline', { icon: 'external-link' })),
      SettingRow('Email address', 'maya@example.com', Badge('Verified', 'secondary')),
    ]),
    sec(
      'Active sessions',
      sessionsError
        ? [Alert('Sessions could not be loaded.', 'Try again in a moment.')]
        : [
            SettingRow('This browser', 'Started 9 Oct 2026', Badge('Current', 'outline')),
            SettingRow('Browser session', 'Started 2 Oct 2026', IconBtn('log-out', false)),
            Row({ padding: [14, 0] }, [Button('Log out all other sessions', 'outline')]),
          ],
    ),
    sec('Your plan', [
      SettingRow('Free', 'Review your subscription status.', Badge('Free', 'outline')),
    ]),
    sec('Language', [
      SettingRow('Choose the language used throughout the app', null, sel('English')),
    ]),
    sec('Audio quality', [
      SettingRow('Streaming quality', null, sel('Automatic')),
      SettingRow(
        'Normalize volume',
        'Set the same volume level for all songs and podcasts',
        Switch('', true),
      ),
    ]),
    sec('Videos and visuals', [
      Tx('Muted', 'It may take some time for your experience to update.'),
      SettingRow(
        'Music videos',
        'When off, music videos and live performances play as audio-only.',
        Switch('', true),
      ),
      SettingRow(
        'Looping visuals',
        'Short, looping visuals when a song is playing.',
        Switch('', true),
      ),
      SettingRow(
        'Other videos',
        'Vertically scrolling videos, video podcasts, and videos from creators.',
        Switch('', false),
      ),
    ]),
    sec('Playback', [
      Col({ padding: [14, 0], width: 'fill_container', gap: 10 }, [
        Tx('Body Strong', 'Equalizer'),
        R('Equalizer'),
      ]),
    ]),
    sec('Listening activity and insights', [
      SettingRow('Listening activity on desktop and mobile', null, Switch('', true)),
    ]),
    sec('What others can see on your profile', [
      SettingRow('Followers and following', null, Switch('', true)),
      SettingRow(
        'People can see the playlists you have added to your profile.',
        null,
        Switch('', false),
      ),
    ]),
    sec('Account privacy', [
      SettingRow(
        'Explicit content',
        'Allow tracks marked as explicit to appear in your account.',
        Switch('', true),
      ),
      SettingRow(
        'Private session',
        'Keep your listening activity private for this account.',
        Switch('', false),
      ),
    ]),
    sec('Profile details', [
      Col({ padding: [14, 0], gap: 14, width: 'fill_container' }, [
        Input('Username', 'maya'),
        Input('Description', 'Tell people about yourself'),
        R('Form/Drop Zone'),
        Button('Save profile', 'default'),
      ]),
    ]),
    sec(
      'Two-factor authentication',
      twoFaOn
        ? [
            SettingRow('2FA is enabled for this account.', null, Badge('Enabled', 'secondary')),
            Col({ padding: [14, 0], gap: 12, width: 'fill_container' }, [
              Input('Current authentication code', '123456', mobile ? 'fill_container' : 280),
              Button('Disable 2FA', 'destructive'),
            ]),
          ]
        : [
            SettingRow(
              'Protect your account with an authenticator app.',
              null,
              Button('Set up 2FA', 'default'),
            ),
          ],
    ),
  ]
}
const settingsDesktop = (name, o) =>
  Desktop(
    name,
    [
      Col({ name: 'Settings Column', width: 760, gap: 32 }, [
        pageTitle('Settings', IconBtn('search')),
        ...settingsSections(false, o),
      ]),
    ],
    { library: false, height: 2900 },
  )
const settingsMobile = (name, o) =>
  Mobile(name, settingsSections(true, o), {
    mini: false,
    header: MHeader('Settings', { actions: ['search'] }),
    height: 3200,
  })
const twoFaSetup = (mobile) => [
  Tx('H3', 'Two-factor authentication'),
  Tx('Paragraph', 'Protect your account with an authenticator app.', { wrap: true }),
  Panel([Tx('Muted', 'Manual code'), Tx('Code', 'JBSW Y3DP EHPK 3PXP')]),
  Input('Authentication code', '123456', mobile ? 'fill_container' : 280),
  Button(
    'Enable 2FA',
    mobile ? 'large-default' : 'default',
    mobile ? { width: 'fill_container' } : {},
  ),
]

/* ---------------- music pages ---------------- */
const GENRES = [
  ['Pop', C.magenta500],
  ['Hip-Hop', C.amber600],
  ['Electronic', C.purple600],
  ['Rock', C.red600],
  ['Indie', C.green600],
  ['Jazz', C.blue600],
  ['Podcasts', C.neutral700],
  ['Charts', C.purple800],
  ['Chill', C.blue800],
  ['Workout', C.red800],
]
const genre = ([g, c], w = 192, h = 120) =>
  R('Genre Tile', { width: w, height: h, fill: c }, { label: { content: g } })
const gridOf = (items, cols, cell, gap = 20) =>
  Col(
    { name: 'Grid', gap },
    Array.from({ length: Math.ceil(items.length / cols) }, (_, r) =>
      Row({ gap }, items.slice(r * cols, r * cols + cols).map(cell)),
    ),
  )
const searchTabs = () => Chips(['All', 'Songs', 'Artists', 'Albums', 'Playlists', 'Profiles'])
const songs = (rows) =>
  Col(
    { name: 'Songs', width: 'fill_container', gap: 0 },
    rows.map((r, i) =>
      R(
        'Chart Row',
        {},
        {
          rank: { content: String(i + 1) },
          trend: { enabled: false },
          cover: { fill: img(ART[r[4]]) },
          title: { content: r[0] },
          artist: { content: r[1] },
          plays: { enabled: false },
          duration: { content: r[3] },
        },
      ),
    ),
  )
const ARTISTS = [
  ['Nova & the Static', 'afterglow'],
  ['Mira Sol', 'night'],
  ['Kite Harbor', 'static'],
  ['Lumen Choir', 'echoes'],
  ['Luma Vale', 'luma'],
]
const artistRow = (n = 5) =>
  CardRow(ARTISTS.slice(0, n).map(([a, art]) => ArtistCard(a, 'Artist', art, 150)))
const _centerMsg = (stateNode) => [stateNode]

export const pages = {
  landing,
  /* ---------- public ---------- */
  'auth-login': {
    title: 'Auth / Login',
    route: '/auth/login',
    context: 'Login with email/password and social providers.',
    ...auth('Login', () => loginForm()),
    states: [
      authState('Submitting', loggingIn),
      authState('Error', () =>
        loginForm(Alert('Sign-in failed', 'Check your email and password and try again.')),
      ),
    ],
  },
  login: {
    title: 'Login (redirect)',
    route: '/login',
    context: 'Redirects to /auth/login keeping ?error; same screen.',
    ...auth('Login', () => loginForm()),
    states: [
      authState('With redirect error', () => loginForm(Alert('Sign-in failed', 'Try again.'))),
    ],
  },
  'auth-login-2fa': {
    title: 'Auth / Login / 2FA',
    route: '/auth/login/2fa',
    context: 'Second login step: authenticator code.',
    ...auth('2FA', () => twoFa(), 'One more step.'),
    states: [
      authState('Invalid code', () => twoFa(true), 'One more step.'),
      authState(
        'Verifying',
        () => [
          title('Enter your 2FA code', 'Use the 6-digit code from your authenticator app.'),
          Input('Authentication code', '482913'),
          Button('Verifying...', 'large-default', { width: 'fill_container' }),
        ],
        'One more step.',
      ),
    ],
  },
  'login-2fa': {
    title: 'Login / 2FA (redirect)',
    route: '/login/2fa',
    context: 'Redirects to /auth/login/2fa; same screen.',
    ...auth('2FA', () => twoFa(), 'One more step.'),
    states: [authState('Invalid code', () => twoFa(true), 'One more step.')],
  },
  'auth-registration': {
    title: 'Auth / Registration',
    route: '/auth/registration',
    context: 'Single-step sign-up; password rules surface as validation errors.',
    ...auth('Registration', regForm, 'Start listening for free.'),
    states: [
      authState('Validation errors', regErrors, 'Start listening for free.'),
      authState(
        'Submitting',
        () => [
          title('Create your account for free and start listening'),
          Input('Email Address', 'maya@example.com'),
          Button('Registering...', 'large-default', { width: 'fill_container' }),
        ],
        'Start listening for free.',
      ),
    ],
  },
  'auth-forgot-password': {
    title: 'Auth / Forgot password',
    route: '/auth/forgot-password',
    context: 'Request a reset email.',
    desktop: () => CardDesktop('Forgot', forgot()),
    mobile: () => AuthMobile('Forgot', forgot()),
    states: [
      cardState('Link sent', sent),
      cardState('Invalid email', () => [
        title('Reset your password'),
        Input('Email address', 'maya@'),
        FieldError('Enter a valid email address'),
        Button('Send reset link', 'large-default', { width: 'fill_container' }),
      ]),
    ],
  },
  'auth-reset-password': {
    title: 'Auth / Reset password',
    route: '/auth/reset-password?token=',
    context: 'Set a new password from the emailed link.',
    desktop: () => CardDesktop('Reset', reset()),
    mobile: () => AuthMobile('Reset', reset()),
    states: [cardState('Mismatch', resetMismatch), cardState('Missing token', noToken)],
  },
  'verify-email': {
    title: 'Verify email',
    route: '/verify-email?email=',
    context: 'Confirm the account email or resend the link.',
    desktop: () => CardDesktop('Verify', verify(true)),
    mobile: () => AuthMobile('Verify', verify(true)),
    states: [
      cardState('Verifying', () => verify(true, true)),
      cardState('No token', () => verify(false)),
    ],
  },
  legal: {
    title: 'Legal / Document',
    route: '/legal/[slug] — terms, privacy, community, complaints, copyright',
    context: 'One template renders every legal document; shown with Terms of Use.',
    desktop: () =>
      Blank('Legal', 1440, 1500, [
        R('Public Header'),
        L(
          {
            name: 'Document Column',
            width: 'fill_container',
            height: 'fill_container',
            justifyContent: 'center',
            padding: [48, 0],
          },
          [Col({ name: 'Document', width: 760, gap: 18 }, legal())],
        ),
      ]),
    mobile: () => AuthMobile('Legal', legal()),
  },
  'not-found': {
    title: 'Not found (404)',
    route: 'any unknown route',
    context: 'Global not-found page (app/not-found.tsx).',
    desktop: () =>
      Blank('404', 1440, 900, [
        Logo(),
        Tx('Display Primary', '404'),
        EmptyState(
          'Page not found',
          "We couldn't find the page you were looking for.",
          'Back to home',
          'compass',
        ),
      ]),
    mobile: () =>
      Blank('404', 390, 844, [
        Logo(),
        Tx('Display Primary', '404'),
        EmptyState(
          'Page not found',
          "We couldn't find the page you were looking for.",
          'Back to home',
          'compass',
        ),
      ]),
  },
  error: {
    title: 'Error',
    route: 'app/main/error.tsx · app/error.tsx · global-error',
    context: 'Error boundaries: a page inside the player, the app root, and a failed start.',
    desktop: () =>
      Desktop('Page error', [
        ErrorState(
          'Something went wrong',
          'This page could not be loaded. Try again, or head back home.',
        ),
      ]),
    mobile: () =>
      Mobile(
        'Page error',
        [
          ErrorState(
            'Something went wrong',
            'This page could not be loaded. Try again, or head back home.',
          ),
        ],
        { header: MHeader('', { back: true }) },
      ),
    states: [
      state(
        'Root error',
        () =>
          Blank('Root error', 1440, 900, [
            Logo(),
            ErrorState(
              'Something went wrong',
              'Something went wrong on our side. Try again, or head back home.',
            ),
          ]),
        () =>
          Blank('Root error', 390, 844, [
            Logo(),
            ErrorState(
              'Something went wrong',
              'Something went wrong on our side. Try again, or head back home.',
            ),
          ]),
      ),
      state(
        'Global failure',
        () =>
          Blank('Global failure', 1440, 900, [
            Logo(),
            ErrorState(
              'The app failed to load',
              'An unexpected error stopped the player from starting. Reloading usually fixes it.',
              'Reload the app',
              'power',
              null,
            ),
          ]),
        () =>
          Blank('Global failure', 390, 844, [
            Logo(),
            ErrorState(
              'The app failed to load',
              'An unexpected error stopped the player from starting. Reloading usually fixes it.',
              'Reload the app',
              'power',
              null,
            ),
          ]),
      ),
    ],
  },
  offline: {
    title: 'Offline',
    route: '/offline',
    context: 'Shown by the service worker without a connection.',
    desktop: () =>
      Blank('Offline', 1440, 900, [
        Logo(),
        OfflineState(
          'You are offline',
          'Check your connection and try opening the page again.',
          'Try again',
        ),
      ]),
    mobile: () =>
      Blank('Offline', 390, 844, [
        Logo(),
        OfflineState(
          'You are offline',
          'Check your connection and try opening the page again.',
          'Try again',
        ),
      ]),
  },

  /* ---------- main app ---------- */
  player: {
    file: 'web-player-main.pen',
    title: 'Home',
    route: '/main',
    context: 'Player home: library quick grid, recommendations, artists, recently played.',
    desktop: () => Desktop('Home', homeAll(), { nowPlaying: true }),
    mobile: () => Mobile('Home', homeMobile()),
    states: [
      state(
        'Podcasts tab',
        () =>
          Desktop(
            'Podcasts',
            [
              Chips(['All', 'Music', 'Podcasts'], 2),
              SectionHeader('Your episodes'),
              Col(
                { gap: 0, width: 'fill_container' },
                [
                  ['Ep. 12 — Mixing for headphones', 'Signal & Noise · 48 min'],
                  ['Ep. 11 — The second album', 'Signal & Noise · 52 min'],
                ].map(([t, m]) =>
                  R('Episode Row', {}, { title: { content: t }, meta: { content: m } }),
                ),
              ),
              SectionHeader('Podcasts & shows'),
              CardRow([
                AlbumCard('Signal & Noise', 'Bitrate Studios', 'stage'),
                AlbumCard('Night Shift', 'Mira Sol', 'night'),
              ]),
            ],
            { nowPlaying: true },
          ),
        () =>
          Mobile('Podcasts', [
            Chips(['All', 'Music', 'Podcasts'], 2),
            Tx('H4', 'Your episodes'),
            MobileTrack('Ep. 12 — Mixing for headphones', 'Signal & Noise · 48 min', 'stage'),
            Tx('H4', 'Podcasts & shows'),
            Row({ gap: 12 }, [
              AlbumCard('Signal & Noise', 'Bitrate Studios', 'stage', 171),
              AlbumCard('Night Shift', 'Mira Sol', 'night', 171),
            ]),
          ]),
      ),
      state(
        'No podcasts',
        () =>
          Desktop(
            'No podcasts',
            [
              Chips(['All', 'Music', 'Podcasts'], 2),
              EmptyState(
                'No podcasts have been published yet.',
                'Shows will appear here when creators publish them.',
                null,
                'podcast',
              ),
            ],
            { nowPlaying: true },
          ),
        () =>
          Mobile('No podcasts', [
            Chips(['All', 'Music', 'Podcasts'], 2),
            EmptyState(
              'No podcasts have been published yet.',
              'Shows will appear here when creators publish them.',
              null,
              'podcast',
            ),
          ]),
      ),
      state(
        'Connect to a device',
        () =>
          Desktop(
            'Devices',
            [
              Row(
                { width: 'fill_container', height: 'fill_container', gap: 24, alignItems: 'end' },
                [Col({ width: 'fill_container', gap: 24 }, homeAll().slice(0, 3)), devices()],
              ),
            ],
            { nowPlaying: true },
          ),
        () =>
          Mobile(
            'Devices',
            [
              Fill([], { height: 'fill_container' }),
              R(
                'Surface/Sheet',
                { width: 'fill_container' },
                {
                  content: L(
                    { name: 'Sheet Content', layout: 'vertical', gap: 8, width: 'fill_container' },
                    [
                      Tx('H4', 'Connect to a device'),
                      Tx('Muted', 'Afterglow · Nova & the Static'),
                      ...deviceRows(),
                    ],
                  ),
                },
              ),
            ],
            { mini: false },
          ),
      ),
      state(
        'Library expanded',
        () => Desktop('Library', [libHead(), libTabs(), cardGrid(LIB_ITEMS)], { library: false }),
        () =>
          Mobile(
            'Library',
            LIB_ITEMS.slice(0, 7).map(([t, m, a]) => MobileTrack(t, m, a)),
            { tab: 'library', header: libMobileHeader() },
          ),
      ),
      state(
        'Now playing expanded',
        () =>
          Desktop(
            'Now playing',
            [
              Row(
                { width: 'fill_container', height: 'fill_container', gap: 40, alignItems: 'start' },
                [
                  Col({ width: 420, gap: 16 }, [
                    BigCover('afterglow', 420),
                    Row({ width: 'fill_container' }, [
                      Col({ gap: 4, width: 'fill_container' }, [
                        Tx('H1', 'Afterglow'),
                        Tx('Muted', 'Nova & the Static'),
                      ]),
                      Ic('heart', 'Primary', 24),
                    ]),
                    Row({ gap: 8 }, [Tab('Audio', true), Tab('Watch clip')]),
                  ]),
                  Col({ width: 'fill_container', gap: 14 }, [
                    Tx('Eyebrow', 'LYRICS'),
                    Tx('Lyric Past', 'Streetlights fade to violet,'),
                    Tx('Lyric Active', 'the city hums an afterglow'),
                    Tx('Lyric', 'and nowhere left to go.'),
                    SectionHeader('Up next', 'Clear'),
                    ...mrows(TRACKS.slice(2, 5)),
                  ]),
                ],
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile('Now playing', nowPlayingMobile(), {
            mini: false,
            header: MHeader('Afterglow Sessions', {
              backIcon: 'chevron-down',
              actions: ['ellipsis'],
            }),
          }),
      ),
      state(
        'Collapsed library',
        () => Desktop('Collapsed', homeAll(), { nowPlaying: true, library: false }),
        null,
        'the phone has no library sidebar to collapse',
      ),
      state(
        'Track details hover',
        () =>
          Desktop(
            'Hover',
            [
              ...homeAll().slice(0, 3),
              Fill([], { height: 'fill_container' }),
              Row({ width: 'fill_container' }, [
                Ref(
                  'K5fBgt',
                  { name: 'Tooltip / Track details' },
                  { owwOU: { content: 'Track details' } },
                ),
              ]),
            ],
            { nowPlaying: true },
          ),
        null,
        'hover does not exist on touch screens',
      ),
      state(
        'Mini player',
        () =>
          Desktop(
            'Mini player',
            [
              ...homeAll().slice(0, 3),
              Fill([], { height: 'fill_container' }),
              Row({ width: 'fill_container', justifyContent: 'end' }, [
                Ref('H4C7bY', { name: 'Mini Player' }),
              ]),
            ],
            { nowPlaying: false },
          ),
        null,
        'the floating mini player is a desktop window; the phone uses the Mini Bar shown on every mobile frame',
      ),
      ...std('Home', {
        loading: 'grid',
        error: ['Recommendations are unavailable', 'Your recommendations could not be loaded.'],
      }),
    ],
  },

  search: {
    title: 'Search',
    route: '/main/search (?q=, ?category=)',
    context: 'Browse all; results with type tabs; category pages.',
    desktop: () => Desktop('Search', [Tx('H1', 'Browse all'), gridOf(GENRES, 5, (g) => genre(g))]),
    mobile: () =>
      Mobile(
        'Search',
        [
          Tx('H2', 'Search'),
          Input(null, 'What do you want to play?'),
          Tx('H4', 'Browse all'),
          gridOf(GENRES.slice(0, 8), 2, (g) => genre(g, 171, 96), 12),
        ],
        { tab: 'search' },
      ),
    states: [
      state(
        'Results',
        () =>
          Desktop('Results', [
            searchTabs(),
            Row({ width: 'fill_container', gap: 24, alignItems: 'start' }, [
              Col({ width: 420, gap: 12 }, [
                Tx('H3', 'Top result'),
                Panel([
                  BigCover('night', 96),
                  Tx('H2', 'Night Signal'),
                  Row({ gap: 8 }, [Badge('Song', 'secondary'), Tx('Muted', 'Mira Sol')]),
                ]),
              ]),
              Col({ width: 'fill_container', gap: 8 }, [
                Tx('H3', 'Songs'),
                songs(TRACKS.slice(0, 4)),
              ]),
            ]),
            SectionHeader('Jump in: night playlists', null),
            CardRow(
              [
                ['Night Drive', 'Playlist', 'night'],
                ['Late Signal', 'Playlist', 'echoes'],
                ['After Hours', 'Playlist', 'afterglow'],
                ['Low Orbit', 'Playlist', 'static'],
                ['Night Static', 'Playlist', 'drift'],
              ].map(([t, m, a]) => PlaylistCard(t, m, a)),
            ),
          ]),
        () =>
          Mobile(
            'Results',
            [
              Input(null, 'night'),
              Chips(['All', 'Songs', 'Artists', 'Albums']),
              ...mrows(TRACKS.slice(0, 6)),
            ],
            { tab: 'search' },
          ),
      ),
      state(
        'No results',
        () =>
          Desktop('No results', [
            searchTabs(),
            EmptyState(
              'No results found for "neon tide"',
              'Please make sure your words are spelled correctly, or use fewer or different keywords.',
              null,
              'search-x',
            ),
          ]),
        () =>
          Mobile(
            'No results',
            [
              Input(null, 'neon tide'),
              EmptyState(
                'No results found for "neon tide"',
                'Please make sure your words are spelled correctly, or use fewer or different keywords.',
                null,
                'search-x',
              ),
            ],
            { tab: 'search' },
          ),
      ),
      state(
        'Partial results',
        () =>
          Desktop('Partial', [
            searchTabs(),
            Alert(
              'Some result types could not be loaded.',
              'Songs are shown; artists and albums will load when the service recovers.',
            ),
            songs(TRACKS.slice(0, 4)),
          ]),
        () =>
          Mobile(
            'Partial',
            [
              Input(null, 'night'),
              Alert('Some result types could not be loaded.', 'Showing songs only.'),
              ...mrows(TRACKS.slice(0, 4)),
            ],
            { tab: 'search' },
          ),
      ),
      state(
        'Category',
        () =>
          Desktop('Category', [
            R(
              'Collection Header',
              {},
              {
                cover: { enabled: false },
                type: { content: 'Category' },
                title: { content: 'Electronic' },
                owner: { enabled: false },
                meta: { content: 'Popular Electronic · Featured charts' },
              },
            ),
            SectionHeader('Popular Electronic'),
            CardRow(LIB_ITEMS.slice(0, 5).map(([t, m, a]) => AlbumCard(t, m, a))),
          ]),
        () =>
          Mobile(
            'Category',
            [
              Tx('H1', 'Electronic'),
              SectionHeader('Popular Electronic'),
              ...mrows(TRACKS.slice(0, 5)),
            ],
            { tab: 'search' },
          ),
      ),
      ...std('Search', {
        loading: 'grid',
        error: [
          'Search is unavailable',
          'Something went wrong while searching. Try again in a moment.',
          'Try again →',
        ],
        mobileOpts: { tab: 'search' },
      }),
    ],
  },
  library: {
    title: 'Library',
    route: '/main/library (?create=playlist)',
    context: 'Saved collection: tabs, filter, sort; inline create form.',
    desktop: () =>
      Desktop(
        'Library',
        [
          libHead(),
          libTabs(),
          Row({ width: 'fill_container', gap: 12 }, [
            Input(null, 'Filter your library', 320),
            Spacer(),
            Select(null, 'Recents', 180),
          ]),
          cardGrid(LIB_ITEMS),
        ],
        { library: false },
      ),
    mobile: () =>
      Mobile(
        'Library',
        [
          Chips(['Playlists', 'Liked tracks', 'Albums', 'History']),
          Row({ width: 'fill_container', justifyContent: 'space_between' }, [
            Row({ gap: 6 }, [Ic('arrow-down-up', 'Foreground', 16), Tx('Body Strong', 'Recents')]),
            Ic('layout-grid'),
          ]),
          ...LIB_ITEMS.slice(0, 6).map(([t, m, a]) => MobileTrack(t, m, a)),
        ],
        { tab: 'library', header: libMobileHeader() },
      ),
    states: [
      state(
        'Create playlist',
        () =>
          Desktop(
            'Create',
            [
              libHead(),
              libTabs(),
              Panel(
                [
                  Tx('H4', 'New playlist'),
                  Input('Playlist title', 'My playlist #4'),
                  Input('Description', 'Add an optional description'),
                  Switch('Public playlist', true),
                  Row({ gap: 10 }, [Button('Create', 'default'), Button('Cancel', 'ghost')]),
                ],
                { width: 560 },
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Create',
            [
              Tx('H3', 'New playlist'),
              Input('Playlist title', 'My playlist #4'),
              Input('Description', 'Add an optional description'),
              Switch('Public playlist', true),
              Button('Create', 'large-default', { width: 'fill_container' }),
              Button('Cancel', 'large-outline', { width: 'fill_container' }),
            ],
            { tab: 'create', mini: false, header: MHeader('Create playlist') },
          ),
      ),
      state(
        'Create menu',
        () =>
          Desktop(
            'Create menu',
            [
              libHead(),
              Row({ width: 'fill_container', justifyContent: 'end' }, [
                Menu([
                  ['Playlist — Create a playlist with songs or episodes'],
                  ["Blend — Combine your friends' tastes into a playlist", 'disabled'],
                  ['Folder — Organize your playlists', 'disabled'],
                ]),
              ]),
              libTabs(),
              cardGrid(LIB_ITEMS.slice(0, 5)),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Create menu',
            [Menu([['Playlist'], ['Blend', 'disabled'], ['Folder', 'disabled']])],
            { tab: 'create', header: libMobileHeader() },
          ),
      ),
      state(
        'Empty',
        () =>
          Desktop(
            'Empty',
            [
              libHead(),
              libTabs(),
              EmptyState(
                'Nothing here yet.',
                'Playlists you create and albums you save will show up here.',
                'Create playlist →',
                'library-big',
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Empty',
            [
              EmptyState(
                'Nothing here yet.',
                'Playlists you create and albums you save will show up here.',
                'Create playlist →',
                'library-big',
              ),
            ],
            { tab: 'library', header: libMobileHeader() },
          ),
      ),
      ...std('Library', {
        loading: 'grid',
        error: ['Your library could not be loaded', 'Something went wrong on our side. Try again.'],
        desktopOpts: { library: false },
        mobileOpts: { tab: 'library', header: libMobileHeader() },
      }),
    ],
  },
  'liked-songs': {
    title: 'Liked Songs',
    route: '/main/liked-songs',
    context: 'Liked tracks presented as a playlist.',
    desktop: () =>
      Desktop('Liked', [
        CollectionHeader({
          type: 'Playlist',
          title: 'Liked Songs',
          owner: 'Your Library',
          meta: '· 128 songs',
          art: 'liked',
        }),
        bar(),
        TrackTable(TRACKS.slice(0, 6)),
      ]),
    mobile: () =>
      Mobile(
        'Liked',
        [...mobileHero('liked', 'Liked Songs', 'Your Library · 128 songs'), ...mrows(T5)],
        { tab: 'library', header: MHeader('') },
      ),
    states: [
      state(
        'Empty',
        () =>
          Desktop('Liked empty', [
            CollectionHeader({
              type: 'Playlist',
              title: 'Liked Songs',
              owner: 'Your Library',
              meta: '· 0 songs',
              art: 'liked',
            }),
            EmptyState(
              'No liked tracks yet',
              "You haven't liked any songs yet. Start exploring and like your favorite tracks!",
              'Find something to play →',
              'heart',
            ),
          ]),
        () =>
          Mobile(
            'Liked empty',
            [
              EmptyState(
                'No liked tracks yet',
                "You haven't liked any songs yet. Start exploring and like your favorite tracks!",
                'Find something to play →',
                'heart',
              ),
            ],
            { tab: 'library', header: MHeader('Liked Songs') },
          ),
      ),
      ...std('Liked', {
        loading: 'collection',
        error: ['Liked songs could not be loaded', 'Something went wrong on our side. Try again.'],
        notFound: [
          'No liked songs found',
          "You haven't liked any songs yet. Start exploring and like your favorite tracks!",
          'Back to home →',
          'heart',
        ],
        mobileOpts: { tab: 'library', header: MHeader('') },
      }),
    ],
  },
  playlist: {
    title: 'Playlist',
    route: '/main/playlist/[id]',
    context: 'Playlist detail with owner actions, finder, menus and error states.',
    desktop: () =>
      Desktop('Playlist', [
        CollectionHeader({
          type: 'Public playlist',
          title: 'Night Drive',
          owner: 'Maya',
          meta: '· 24 songs, 1 h 32 min',
          art: 'night',
        }),
        Row({ gap: 18 }, [bar({ invite: true }), Badge('Mix', 'outline')]),
        TrackTable(T5),
      ]),
    mobile: () =>
      Mobile('Playlist', [...mobileHero('night', 'Night Drive', 'Maya · 24 songs'), ...mrows(T5)], {
        tab: 'library',
        header: MHeader(''),
      }),
    states: [
      state(
        'Find songs',
        () =>
          Desktop('Finder', [
            CollectionHeader({
              type: 'Public playlist',
              title: 'Night Drive',
              owner: 'Maya',
              meta: '· 0 songs',
              art: 'night',
            }),
            Panel([
              Tx('H3', "Let's find something for your playlist"),
              Input(null, 'Search for songs or episodes', 420),
              ...TRACKS.slice(0, 3).map((t) =>
                Row({ width: 'fill_container', gap: 12 }, [
                  MobileTrack(t[0], t[1], t[4]),
                  Button('Add', 'outline'),
                ]),
              ),
            ]),
          ]),
        () =>
          Mobile(
            'Finder',
            [
              Tx('H3', "Let's find something for your playlist"),
              Input(null, 'Search for songs or episodes'),
              ...TRACKS.slice(0, 4).map((t) =>
                Row({ width: 'fill_container', gap: 8 }, [
                  MobileTrack(t[0], t[1], t[4]),
                  Button('Add', 'outline'),
                ]),
              ),
            ],
            { tab: 'library', header: MHeader('Night Drive') },
          ),
      ),
      state(
        'More menu',
        () =>
          Desktop('Menu', [
            CollectionHeader({
              type: 'Public playlist',
              title: 'Night Drive',
              owner: 'Maya',
              meta: '· 24 songs',
              art: 'night',
            }),
            Row({ gap: 24, alignItems: 'start' }, [
              bar({ invite: true }),
              Menu([
                ['Add to queue', 'disabled'],
                ['Add to profile'],
                ['Edit details'],
                ['Delete', 'destructive'],
                ['Make private', 'disabled'],
                ['Invite collaborators'],
                ['Exclude from your taste profile'],
                ['Move to folder'],
                ['Share'],
                ['Report'],
                ['Open in Desktop app'],
              ]),
            ]),
          ]),
        () =>
          Mobile(
            'Menu',
            [
              Menu([
                ['Add to profile'],
                ['Edit details'],
                ['Delete', 'destructive'],
                ['Invite collaborators'],
                ['Share'],
                ['Report'],
              ]),
            ],
            { tab: 'library', header: MHeader('Night Drive') },
          ),
      ),
      state(
        'Edit details',
        () =>
          Desktop('Edit', [
            CollectionHeader({
              type: 'Public playlist',
              title: 'Night Drive',
              owner: 'Maya',
              meta: '· 24 songs',
              art: 'night',
            }),
            Panel(
              [
                Tx('H4', 'Edit details'),
                Input('Title', 'Night Drive'),
                Input('Description', 'Late streets, low volume.'),
                Row({ gap: 10 }, [Button('Save', 'default'), Button('Cancel', 'ghost')]),
              ],
              { width: 560 },
            ),
          ]),
        () =>
          Mobile(
            'Edit',
            [
              Input('Title', 'Night Drive'),
              Input('Description', 'Late streets, low volume.'),
              Button('Save', 'large-default', { width: 'fill_container' }),
            ],
            { tab: 'library', mini: false, header: MHeader('Edit details') },
          ),
      ),
      state(
        'Report',
        () =>
          Desktop('Report', [
            CollectionHeader({
              type: 'Public playlist',
              title: 'Night Drive',
              owner: 'Maya',
              meta: '· 24 songs',
              art: 'night',
            }),
            Panel(
              [
                Tx('H3', 'Report playlist'),
                Select('Reason', 'Spam or misleading content', 'fill_container'),
                Row({ gap: 10 }, [Button('Send report', 'default'), Button('Cancel', 'ghost')]),
              ],
              { width: 480 },
            ),
          ]),
        () =>
          Mobile(
            'Report',
            [
              Tx('H3', 'Report playlist'),
              Select('Reason', 'Spam or misleading content'),
              Button('Send report', 'large-default', { width: 'fill_container' }),
            ],
            { tab: 'library', mini: false, header: MHeader('Report') },
          ),
      ),
      state(
        'Empty',
        () =>
          Desktop('Empty', [
            CollectionHeader({
              type: 'Public playlist',
              title: 'Night Drive',
              owner: 'Maya',
              meta: '· 0 songs',
              art: 'night',
            }),
            EmptyState(
              'No tracks in this playlist.',
              "Let's find something for your playlist.",
              'Search tracks →',
              'list-music',
            ),
          ]),
        () =>
          Mobile(
            'Empty',
            [
              EmptyState(
                'No tracks in this playlist.',
                "Let's find something for your playlist.",
                'Search tracks →',
                'list-music',
              ),
            ],
            { tab: 'library', header: MHeader('Night Drive') },
          ),
      ),
      state(
        'Private',
        () =>
          Desktop('Private', [
            ErrorState(
              'Playlist is private',
              'Only its owner and collaborators can open it.',
              'Try again →',
              'lock',
            ),
          ]),
        () =>
          Mobile(
            'Private',
            [
              ErrorState(
                'Playlist is private',
                'Only its owner and collaborators can open it.',
                'Try again →',
                'lock',
              ),
            ],
            { tab: 'library' },
          ),
      ),
      state(
        'Session expired',
        () =>
          Desktop('Expired', [
            ErrorState(
              'Your session has expired',
              'Log in again to keep listening.',
              'Log in →',
              'log-in',
            ),
          ]),
        () =>
          Mobile(
            'Expired',
            [
              ErrorState(
                'Your session has expired',
                'Log in again to keep listening.',
                'Log in →',
                'log-in',
              ),
            ],
            { tab: 'library' },
          ),
      ),
      ...std('Playlist', {
        loading: 'collection',
        error: ['Unable to load playlist', 'Something went wrong on our side. Try again.'],
        notFound: [
          'Playlist not found',
          'This playlist may have been removed, or the link is incorrect.',
          'Back to home →',
          'list-music',
        ],
        mobileOpts: { tab: 'library' },
      }),
    ],
  },
  album: {
    title: 'Album',
    route: '/main/album/[id]',
    context: 'Album hero, like, track list.',
    desktop: () =>
      Desktop('Album', [
        CollectionHeader({
          type: 'Album',
          title: 'Afterglow',
          owner: 'Nova & the Static',
          meta: '· 2026 · 9 songs, 36 min',
          art: 'afterglow',
        }),
        bar({ like: true }),
        TrackTable(
          T5.map((t) => [t[0], 'Nova & the Static', 'Afterglow', t[3], 'afterglow']),
          { added: false },
        ),
      ]),
    mobile: () =>
      Mobile(
        'Album',
        [
          ...mobileHero('afterglow', 'Afterglow', 'Album · Nova & the Static · 2026'),
          ...T5.map((t) => MobileTrack(t[0], 'Nova & the Static', 'afterglow')),
        ],
        { header: MHeader('') },
      ),
    states: [
      state(
        'Empty',
        () =>
          Desktop('Empty', [
            CollectionHeader({
              type: 'Album',
              title: 'Afterglow',
              owner: 'Nova & the Static',
              meta: '· 2026',
              art: 'afterglow',
            }),
            EmptyState(
              'No tracks in this album',
              'Tracks will appear here once they are published.',
              null,
              'disc-3',
            ),
          ]),
        () =>
          Mobile(
            'Empty',
            [
              EmptyState(
                'No tracks in this album',
                'Tracks will appear here once they are published.',
                null,
                'disc-3',
              ),
            ],
            { header: MHeader('Afterglow') },
          ),
      ),
      ...std('Album', {
        loading: 'collection',
        error: ['Album could not be loaded', 'Something went wrong on our side. Try again.'],
        notFound: [
          'Album not found.',
          'This album may have been removed, or the link is incorrect.',
          'Back to home →',
          'disc-3',
        ],
      }),
    ],
  },
  artist: {
    title: 'Artist',
    route: '/main/artist/[id]',
    context: 'Public artist page: popular, discography, related, about.',
    desktop: () =>
      Desktop(
        'Artist',
        [
          R('Artist Hero', {}, { name: { content: 'Luma Vale' } }),
          Row({ gap: 18 }, [
            Play(),
            Ic('shuffle', 'Muted', 26),
            Button('Follow', 'outline'),
            Ic('ellipsis', 'Muted', 26),
          ]),
          Row({ width: 'fill_container', gap: 32, alignItems: 'start' }, [
            Col({ width: 'fill_container', gap: 8 }, [
              Tx('H3', 'Popular'),
              songs(TRACKS.slice(0, 4)),
              Tx('Link', 'See more'),
            ]),
            Col({ width: 440, gap: 12 }, [
              Tx('H3', 'Discography'),
              Chips(['Popular releases', 'Albums', 'Singles and EPs']),
              CardRow([
                AlbumCard('Afterglow', '2026 · Album', 'afterglow', 130),
                AlbumCard('Night Signal', '2025 · Single', 'night', 130),
                AlbumCard('Low Orbit', '2024 · EP', 'static', 130),
              ]),
            ]),
          ]),
        ],
        { library: false },
      ),
    mobile: () =>
      Mobile(
        'Artist',
        [
          R('Artist Hero/Mobile', { width: 'fill_container' }, { name: { content: 'Luma Vale' } }),
          Row({ width: 'fill_container', gap: 14 }, [
            Button('Follow', 'outline'),
            Ic('ellipsis'),
            Spacer(),
            Ic('shuffle'),
            Play(true),
          ]),
          Tx('H4', 'Popular'),
          ...TRACKS.slice(0, 4).map((t) => MobileTrack(t[0], 'Released 2026', t[4])),
        ],
        { header: MHeader('') },
      ),
    states: [
      state(
        'More sections',
        () =>
          Desktop(
            'More',
            [
              Tx('H3', 'Featuring Luma Vale'),
              CardRow([
                PlaylistCard('This Is Luma Vale', 'The essential tracks', 'luma', 180),
                PlaylistCard('Luma Vale Radio', 'With Mira Sol, Kite Harbor', 'night', 180),
              ]),
              Tx('H3', 'Fans also like'),
              artistRow(4),
              Tx('H3', 'About'),
              Panel(
                [
                  Tx('Paragraph', 'Luma Vale writes late-night synth pop with spacious vocals.', {
                    wrap: true,
                  }),
                  Tx('Link', 'Show more'),
                ],
                { width: 720 },
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'More',
            [
              Tx('H4', 'Fans also like'),
              Row(
                { gap: 12 },
                ARTISTS.slice(0, 2).map(([a, art]) => ArtistCard(a, 'Artist', art, 171)),
              ),
              Tx('H4', 'About'),
              Panel([
                Tx('Paragraph', 'Luma Vale writes late-night synth pop with spacious vocals.', {
                  wrap: true,
                }),
              ]),
            ],
            { header: MHeader('Luma Vale') },
          ),
      ),
      state(
        'No music yet',
        () =>
          Desktop(
            'No music',
            [
              R('Artist Hero', {}, { name: { content: 'Luma Vale' } }),
              EmptyState(
                'This artist has no published music yet.',
                'Follow them to hear about their first release.',
                'Follow →',
                'mic-vocal',
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'No music',
            [
              EmptyState(
                'This artist has no published music yet.',
                'Follow them to hear about their first release.',
                'Follow →',
                'mic-vocal',
              ),
            ],
            { header: MHeader('Luma Vale') },
          ),
      ),
      ...std('Artist', {
        loading: 'collection',
        error: ['The catalogue could not be loaded right now.', 'Try again in a moment.'],
        notFound: [
          'Artist not found',
          "We couldn't find this artist. They may have been removed, or the link is incorrect.",
          'Back to home →',
          'mic-vocal',
        ],
        desktopOpts: { library: false },
      }),
    ],
  },
  podcast: {
    title: 'Podcast',
    route: '/main/podcast/[id]',
    context: 'Podcast detail and episode list.',
    desktop: () =>
      Desktop('Podcast', [
        Row({ width: 'fill_container', gap: 28, alignItems: 'end' }, [
          BigCover('stage', 220),
          Col({ gap: 8, width: 'fill_container' }, [
            Tx('Eyebrow', 'PODCAST'),
            Tx('Display', 'Signal & Noise'),
            Tx('Body Strong', 'Bitrate Studios'),
            Tx('Paragraph', 'Conversations with the people who make the music you love.', {
              wrap: true,
            }),
          ]),
        ]),
        Tx('H3', 'All episodes'),
        Col(
          { gap: 0, width: 'fill_container' },
          [
            ['Ep. 12 — Mixing for headphones', '8 Oct 2026 · 48 min'],
            ['Ep. 11 — The second album', '1 Oct 2026 · 52 min'],
            ['Ep. 10 — Live from the night bus', '24 Sep 2026 · 39 min'],
          ].map(([t, m]) => R('Episode Row', {}, { title: { content: t }, meta: { content: m } })),
        ),
      ]),
    mobile: () =>
      Mobile(
        'Podcast',
        [
          BigCover('stage', 200),
          Tx('Eyebrow', 'PODCAST'),
          Tx('H2', 'Signal & Noise'),
          Tx('Muted', 'Bitrate Studios'),
          Tx('H4', 'All episodes'),
          ...[
            ['Ep. 12 — Mixing for headphones', '8 Oct · 48 min'],
            ['Ep. 11 — The second album', '1 Oct · 52 min'],
          ].map(([t, m]) => MobileTrack(t, m, 'stage')),
        ],
        { header: MHeader('') },
      ),
    states: [
      state(
        'Empty',
        () =>
          Desktop('Empty', [
            Tx('H1', 'Signal & Noise'),
            EmptyState(
              'No episodes have been published yet.',
              'New episodes will appear here.',
              null,
              'podcast',
            ),
          ]),
        () =>
          Mobile(
            'Empty',
            [
              EmptyState(
                'No episodes have been published yet.',
                'New episodes will appear here.',
                null,
                'podcast',
              ),
            ],
            { header: MHeader('Signal & Noise') },
          ),
      ),
      ...std('Podcast', {
        loading: 'collection',
        error: [
          'Podcast not found',
          'This podcast may have been removed or is temporarily unavailable.',
          'Try again →',
        ],
      }),
    ],
  },
  queue: {
    title: 'Queue',
    route: '/main/queue',
    context: 'Now playing, next in queue, next from the context.',
    desktop: () =>
      Desktop(
        'Queue',
        [
          pageTitle('Queue', Button('Clear queue', 'ghost')),
          Tx('H4', 'Now playing'),
          TrackTable([TRACKS[0]]),
          Tx('H4', 'Next in queue'),
          TrackTable(TRACKS.slice(1, 3), { playing: -1 }),
          Tx('H4', 'Next from: Night Drive'),
          TrackTable(TRACKS.slice(3, 6), { playing: -1 }),
        ],
        { nowPlaying: true },
      ),
    mobile: () =>
      Mobile(
        'Queue',
        [
          Tx('Body Strong', 'Now playing'),
          MobileTrack(TRACKS[0][0], TRACKS[0][1], TRACKS[0][4]),
          Tx('Body Strong', 'Next in queue'),
          ...mrows(TRACKS.slice(1, 3)),
          Tx('Body Strong', 'Next from: Night Drive'),
          ...mrows(TRACKS.slice(3, 6)),
        ],
        { mini: false, header: MHeader('Queue', { actions: ['trash-2'] }) },
      ),
    states: [
      state(
        'Empty',
        () =>
          Desktop('Empty', [
            Tx('H1', 'Queue'),
            EmptyState(
              'Your queue is empty',
              'Play something and the tracks lined up next will show up here.',
              'Find something to play →',
              'list-music',
            ),
          ]),
        () =>
          Mobile(
            'Empty',
            [
              EmptyState(
                'Your queue is empty',
                'Play something and the tracks lined up next will show up here.',
                'Find something to play →',
                'list-music',
              ),
            ],
            { mini: false, header: MHeader('Queue') },
          ),
      ),
    ],
  },
  lyrics: {
    title: 'Lyrics',
    route: '/main/lyrics',
    context: 'Full-screen synced lyrics of the playing track.',
    desktop: () =>
      Desktop('Lyrics', [
        Row({ gap: 14 }, [
          Cover('afterglow', 56),
          Col({ gap: 2 }, [Tx('Body Strong', 'Afterglow'), Tx('Link', 'Nova & the Static')]),
        ]),
        Col({ name: 'Lines', gap: 14, width: 'fill_container' }, [
          Tx('Lyric Past', 'Streetlights fade to violet,'),
          Tx('Lyric Past', 'we keep the volume low,'),
          Tx('Lyric Active', 'the city hums an afterglow'),
          Tx('Lyric', 'and nowhere left to go.'),
          Tx('Lyric', 'Hold the signal steady,'),
        ]),
      ]),
    mobile: () =>
      Mobile(
        'Lyrics',
        [
          Row({ gap: 12 }, [
            Cover('afterglow', 48),
            Col({ gap: 2 }, [Tx('Body Strong', 'Afterglow'), Tx('Link', 'Nova & the Static')]),
          ]),
          ...[
            ['Lyric Past', 'Streetlights fade to violet,'],
            ['Lyric Active', 'the city hums an afterglow'],
            ['Lyric', 'and nowhere left to go.'],
          ].map(([s, l]) => Tx(s, l, { wrap: true })),
        ],
        { header: MHeader('Lyrics') },
      ),
    states: [
      state(
        'Nothing playing',
        () =>
          Desktop('Nothing', [
            EmptyState(
              'Nothing is playing',
              'Start a track and its lyrics will appear here.',
              'Find something to play →',
              'mic-vocal',
            ),
          ]),
        () =>
          Mobile(
            'Nothing',
            [
              EmptyState(
                'Nothing is playing',
                'Start a track and its lyrics will appear here.',
                'Find something to play →',
                'mic-vocal',
              ),
            ],
            { header: MHeader('Lyrics') },
          ),
      ),
      state(
        'No lyrics',
        () =>
          Desktop('No lyrics', [
            Row({ gap: 14 }, [
              Cover('static', 56),
              Col({ gap: 2 }, [Tx('Body Strong', 'Static Lines'), Tx('Link', 'Kite Harbor')]),
            ]),
            EmptyState(
              'No lyrics for this track',
              "Lyrics haven't been added to this track yet.",
              null,
              'mic-vocal',
            ),
          ]),
        () =>
          Mobile(
            'No lyrics',
            [
              EmptyState(
                'No lyrics for this track',
                "Lyrics haven't been added to this track yet.",
                null,
                'mic-vocal',
              ),
            ],
            { header: MHeader('Lyrics') },
          ),
      ),
    ],
  },
  recents: {
    title: 'Recents',
    route: '/main/recents',
    context: 'Listening history grouped by day.',
    desktop: () =>
      Desktop('Recents', [
        pageTitle('Recents', Button('Clear listening history', 'ghost')),
        Tx('H4', 'Today'),
        TrackTable(TRACKS.slice(0, 3), { playing: -1 }),
        Tx('H4', 'Yesterday'),
        TrackTable(TRACKS.slice(3, 5), { playing: -1 }),
        Tx('H4', '6 October'),
        TrackTable(TRACKS.slice(5, 6), { playing: -1 }),
      ]),
    mobile: () =>
      Mobile(
        'Recents',
        [
          Tx('Body Strong', 'Today'),
          ...mrows(TRACKS.slice(0, 3)),
          Tx('Body Strong', 'Yesterday'),
          ...mrows(TRACKS.slice(3, 6)),
        ],
        { header: MHeader('Recents', { actions: ['trash-2'] }) },
      ),
    states: [
      state(
        'Empty',
        () =>
          Desktop('Empty', [
            Tx('H1', 'Recents'),
            EmptyState(
              'No recent listening activity yet.',
              'Tracks you play will show up here.',
              'Find something to play →',
              'history',
            ),
          ]),
        () =>
          Mobile(
            'Empty',
            [
              EmptyState(
                'No recent listening activity yet.',
                'Tracks you play will show up here.',
                'Find something to play →',
                'history',
              ),
            ],
            { header: MHeader('Recents') },
          ),
      ),
      ...std('Recents', {
        loading: 'table',
        error: ['Recents could not be loaded', 'Something went wrong on our side. Try again.'],
      }),
    ],
  },
  profile: {
    title: 'Profile',
    route: '/main/profile',
    context: "The listener's own profile.",
    desktop: () =>
      Desktop(
        'Profile',
        [
          R(
            'Profile Header',
            {},
            {
              name: { content: 'Maya' },
              sub: { content: 'Night-bus playlists and too many synth records.' },
              action: L({ name: 'Action' }, [IconBtn('settings', false)]),
            },
          ),
          Row({ width: 'fill_container', justifyContent: 'space_between' }, [
            Col({ gap: 2 }, [
              Tx('H3', 'Top artists this month'),
              Tx('Muted', 'Only visible to you'),
            ]),
            Tx('Link', 'Show all'),
          ]),
          artistRow(5),
        ],
        { library: false },
      ),
    mobile: () =>
      Mobile(
        'Profile',
        [
          Row({ gap: 16 }, [
            Avatar('avatar2', 88),
            Col({ gap: 4 }, [
              Tx('Caption', 'Profile'),
              Tx('H2', 'Maya'),
              Tx('Muted', '3 public playlists · 12 following'),
            ]),
          ]),
          Tx('H4', 'Top artists this month'),
          Row(
            { gap: 12 },
            ARTISTS.slice(0, 2).map(([a, art]) => ArtistCard(a, 'Artist', art, 171)),
          ),
          Tx('H4', 'Top tracks this month'),
          ...mrows(TRACKS.slice(0, 3)),
        ],
        { header: MHeader('Profile', { back: false, actions: ['settings'] }) },
      ),
    states: [
      state(
        'Sections',
        () =>
          Desktop(
            'Sections',
            [
              SectionHeader('Top tracks this month'),
              TrackTable(TRACKS.slice(0, 4), { playing: -1 }),
              SectionHeader('Your playlists'),
              CardRow([
                PlaylistCard('Night Drive', 'Public playlist', 'night'),
                PlaylistCard('Afterglow Sessions', 'Public playlist', 'afterglow'),
                PlaylistCard('Focus', 'Private playlist', 'static'),
              ]),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Sections',
            [
              Tx('H4', 'Your playlists'),
              ...[
                ['Night Drive', 'Public playlist', 'night'],
                ['Focus', 'Private playlist', 'static'],
              ].map(([t, m, a]) => MobileTrack(t, m, a)),
              Tx('H4', 'Following'),
              ...[
                ['Jonah', 'avatar3'],
                ['Ana', 'avatar1'],
              ].map(([n, a]) => MobileTrack(n, 'Profile', a)),
            ],
            { header: MHeader('Profile', { back: false }) },
          ),
      ),
      state(
        'Empty',
        () =>
          Desktop(
            'Empty',
            [
              R(
                'Profile Header',
                {},
                { name: { content: 'Maya' }, sub: { content: 'New listener' } },
              ),
              EmptyState(
                'No artists yet.',
                'Your top artists this month will appear as you listen.',
                'Find something to play →',
                'user-round',
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Empty',
            [
              EmptyState(
                'No artists yet.',
                'Your top artists this month will appear as you listen.',
                'Find something to play →',
                'user-round',
              ),
            ],
            { header: MHeader('Profile', { back: false }) },
          ),
      ),
      state(
        'Signed out',
        () =>
          Desktop(
            'Signed out',
            [
              EmptyState(
                'Sign in to view your profile.',
                'Log in to see your top artists, tracks and playlists.',
                'Log in →',
                'log-in',
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Signed out',
            [
              EmptyState(
                'Sign in to view your profile.',
                'Log in to see your top artists, tracks and playlists.',
                'Log in →',
                'log-in',
              ),
            ],
            { mini: false, header: MHeader('Profile', { back: false }) },
          ),
      ),
      ...std('Profile', {
        loading: 'grid',
        error: ['Profile could not be loaded', 'Something went wrong on our side. Try again.'],
        desktopOpts: { library: false },
      }),
    ],
  },
  user: {
    title: 'User',
    route: '/main/user/[id]',
    context: "Another listener's public profile.",
    desktop: () =>
      Desktop(
        'User',
        [
          R(
            'Profile Header',
            {},
            {
              avatar: {
                fill: {
                  type: 'image',
                  url: '../design-system/assets/avatars/avatar3.jpg',
                  mode: 'cover',
                },
              },
              name: { content: 'Jonah' },
              sub: { content: 'Collector of B-sides.' },
              action: L({ name: 'Action' }, [Button('Follow', 'outline')]),
            },
          ),
          SectionHeader('Public playlists'),
          CardRow([
            PlaylistCard('B-sides Forever', 'Public playlist', 'static'),
            PlaylistCard('Rain Drive', 'Public playlist', 'drift'),
            PlaylistCard('Choir Nights', 'Public playlist', 'echoes'),
          ]),
        ],
        { library: false },
      ),
    mobile: () =>
      Mobile(
        'User',
        [
          Row({ gap: 16 }, [
            Avatar('avatar3', 88),
            Col({ gap: 4 }, [Tx('Caption', 'Profile'), Tx('H2', 'Jonah')]),
          ]),
          Button('Follow', 'outline'),
          Tx('H4', 'Public playlists'),
          ...[
            ['B-sides Forever', 'static'],
            ['Rain Drive', 'drift'],
            ['Choir Nights', 'echoes'],
          ].map(([t, a]) => MobileTrack(t, 'Public playlist', a)),
        ],
        { header: MHeader('') },
      ),
    states: [
      state(
        'No playlists',
        () =>
          Desktop(
            'No playlists',
            [
              R(
                'Profile Header',
                {},
                { name: { content: 'Jonah' }, sub: { content: 'Collector of B-sides.' } },
              ),
              EmptyState('No public playlists yet.', null, null, 'list-music'),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'No playlists',
            [EmptyState('No public playlists yet.', null, null, 'list-music')],
            { header: MHeader('Jonah') },
          ),
      ),
      ...std('User', {
        loading: 'grid',
        error: [
          'Playlists could not be loaded. Try again later.',
          'Something went wrong on our side.',
        ],
        notFound: [
          'User not found',
          'This profile is unavailable or no longer exists.',
          'Back to home →',
          'user-x',
        ],
        desktopOpts: { library: false },
      }),
    ],
  },
  preferences: {
    title: 'Settings (Preferences)',
    route: '/main/preferences',
    context: 'All settings sections on one page; ROUTES.settings points here.',
    desktop: () => settingsDesktop('Settings'),
    mobile: () => settingsMobile('Settings'),
    states: [
      state(
        '2FA enabled',
        () => settingsDesktop('2FA on', { twoFaOn: true }),
        () => settingsMobile('2FA on', { twoFaOn: true }),
      ),
      state(
        'Sessions error',
        () => settingsDesktop('Sessions error', { sessionsError: true }),
        () => settingsMobile('Sessions error', { sessionsError: true }),
      ),
      state(
        'Search settings',
        () =>
          Desktop(
            'Search settings',
            [
              Col({ width: 760, gap: 24 }, [
                Row({ width: 'fill_container', gap: 10 }, [
                  Tx('H1', 'Settings'),
                  Spacer(),
                  Input(null, 'Search settings', 320),
                  IconBtn('x'),
                ]),
                SettingRow('Streaming quality', null, Select(null, 'Automatic', 220)),
                SettingRow(
                  'Normalize volume',
                  'Set the same volume level for all songs and podcasts',
                  Switch('', true),
                ),
              ]),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Search settings',
            [
              Input(null, 'Search settings'),
              SettingRow('Streaming quality', null, Select(null, 'Automatic', 150)),
            ],
            { mini: false, header: MHeader('Settings', { actions: ['x'] }) },
          ),
      ),
      state(
        'Loading',
        () => Desktop('Loading', [Skeleton('list')], { library: false }),
        () =>
          Mobile('Loading', [Skeleton('list', true)], { mini: false, header: MHeader('Settings') }),
      ),
    ],
  },
  settings: {
    title: 'Settings (redirect)',
    route: '/main/settings',
    context: 'Redirects to /main/preferences; shown with the 2FA set-up step.',
    desktop: () =>
      Desktop(
        '2FA setup',
        [Col({ width: 760, gap: 16 }, [Tx('H1', 'Settings'), ...twoFaSetup(false)])],
        { library: false },
      ),
    mobile: () =>
      Mobile('2FA setup', twoFaSetup(true), { mini: false, header: MHeader('Settings') }),
    states: [
      state(
        'Invalid code',
        () =>
          Desktop(
            '2FA invalid',
            [
              Col({ width: 760, gap: 16 }, [
                Tx('H1', 'Settings'),
                ...twoFaSetup(false),
                FieldError('Invalid or expired 2FA code'),
              ]),
            ],
            { library: false },
          ),
        () =>
          Mobile('2FA invalid', [...twoFaSetup(true), FieldError('Invalid or expired 2FA code')], {
            mini: false,
            header: MHeader('Settings'),
          }),
      ),
    ],
  },

  /* ---------- concepts from the docs ---------- */
  'activity-feed': {
    title: 'Activity feed',
    route: 'concept — roadmap "Activity feed", "Follow users"',
    context: 'What the people you follow are doing. Concept.',
    desktop: () =>
      Desktop(
        'Activity',
        [
          pageTitle('Activity', null, true),
          Chips(['All', 'Listening', 'Likes', 'Playlists']),
          Col({ width: 760, gap: 0 }, activity()),
        ],
        { nowPlaying: true },
      ),
    mobile: () =>
      Mobile('Activity', [Chips(['All', 'Listening', 'Likes']), ...activity()], {
        header: MHeader('Activity', { back: false }),
      }),
    states: [
      state(
        'Empty',
        () =>
          Desktop('Empty', [
            pageTitle('Activity', null, true),
            EmptyState(
              'Follow listeners to see their activity',
              'Their likes, playlists and what they are playing will show up here.',
              'Find people to follow →',
              'users',
            ),
          ]),
        () =>
          Mobile(
            'Empty',
            [
              EmptyState(
                'Follow listeners to see their activity',
                'Their likes and playlists will show up here.',
                'Find people to follow →',
                'users',
              ),
            ],
            { header: MHeader('Activity', { back: false }) },
          ),
      ),
      ...std('Activity', {
        loading: 'notifications',
        error: ['Activity is unavailable', 'Try again in a moment.'],
      }),
    ],
  },
  charts: {
    title: 'Trending & charts',
    route: 'concept — roadmap "Trending & charts"',
    context: 'Top tracks, artists and albums. Concept.',
    desktop: () =>
      Desktop('Charts', [
        pageTitle('Trending & charts', null, true),
        Row({ gap: 4 }, [
          Tab('Top songs', true),
          Tab('Top artists'),
          Tab('Top albums'),
          Tab('Rising'),
        ]),
        Col({ gap: 0, width: 'fill_container' }, chart(8)),
      ]),
    mobile: () =>
      Mobile('Charts', [Chips(['Top songs', 'Top artists', 'Rising']), ...chart(7, true)], {
        tab: 'search',
        header: MHeader('Charts'),
      }),
    states: std('Charts', {
      loading: 'chart',
      error: ['Charts are unavailable', 'Try again in a moment.'],
      mobileOpts: { tab: 'search' },
    }),
  },
  discovery: {
    title: 'Discovery',
    route: 'concept — backlog "Smart Recommendations", "Music Discovery Graph"',
    context: 'Listener-controlled recommendation filters and the influence graph. Concept.',
    desktop: () =>
      Desktop(
        'Discovery',
        [
          pageTitle('Discover', null, true),
          Row({ gap: 8 }, [
            Chip('Unknown artists', true),
            Chip('Less popular'),
            Chip('Synth pop'),
            Chip('Night'),
            Chip('2020s'),
            Button('More filters', 'ghost', { icon: 'sliders-horizontal' }),
          ]),
          Panel([
            Row(
              { width: 'fill_container', justifyContent: 'space_between', alignItems: 'center' },
              [
                Col({ gap: 24 }, [
                  node('Lumen Choir', 'Influence', 'echoes'),
                  node('Kite Harbor', 'Influence', 'static'),
                ]),
                Ic('arrow-right', 'Muted', 28),
                R('Graph Node/Focus', {}, { label: { content: 'Luma Vale' } }),
                Ic('arrow-right', 'Primary', 28),
                Col({ gap: 24 }, [
                  node('Mira Sol', 'Similar', 'night'),
                  node('Nova & the Static', 'Similar', 'afterglow'),
                ]),
                Ic('arrow-right', 'Info', 28),
                Col(
                  { gap: 10 },
                  ['Synth pop', 'Dream pop', 'Night drive'].map((g) => Chip(g)),
                ),
              ],
            ),
          ]),
          SectionHeader('Picked with your filters'),
          CardRow(LIB_ITEMS.slice(0, 5).map(([t, m, a]) => AlbumCard(t, m, a))),
        ],
        { library: false },
      ),
    mobile: () =>
      Mobile(
        'Discovery',
        [
          Chips(['Unknown artists', 'Synth pop', 'Night']),
          Panel([
            R('Graph Node/Focus', {}, { label: { content: 'Luma Vale' } }),
            Row({ gap: 8 }, [
              node('Mira Sol', 'Similar', 'night'),
              node('Lumen Choir', 'Influence', 'echoes'),
            ]),
          ]),
          Tx('H4', 'Picked with your filters'),
          ...mrows(TRACKS.slice(5, 8)),
        ],
        {
          tab: 'search',
          header: MHeader('Discover', { back: false, actions: ['sliders-horizontal'] }),
        },
      ),
    states: [
      state(
        'No matches',
        () =>
          Desktop(
            'No matches',
            [
              pageTitle('Discover', null, true),
              Row({ gap: 8 }, [
                Chip('Unknown artists', true),
                Chip('Polka', true),
                Chip('1950s', true),
              ]),
              EmptyState(
                'Nothing matches these filters',
                'Loosen a filter to see more music.',
                'Clear filters →',
                'sliders-horizontal',
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'No matches',
            [
              EmptyState(
                'Nothing matches these filters',
                'Loosen a filter to see more music.',
                'Clear filters →',
                'sliders-horizontal',
              ),
            ],
            { tab: 'search', header: MHeader('Discover', { back: false }) },
          ),
      ),
      ...std('Discovery', {
        loading: 'grid',
        error: ['Recommendations are unavailable', 'Your recommendations could not be loaded.'],
        desktopOpts: { library: false },
        mobileOpts: { tab: 'search' },
      }),
    ],
  },
  'ai-playlist-builder': {
    title: 'Playlist builder',
    route: 'concept — backlog "AI Playlist Builder", PRODUCT.md explorations',
    context: 'Goal-driven builder: 3–5 step questionnaire, then ranked candidate batches. Concept.',
    desktop: () =>
      Desktop(
        'Builder',
        [
          pageTitle('Build a playlist', null, true),
          stepper(2),
          Row({ width: 'fill_container', gap: 24, alignItems: 'start' }, [
            Col({ width: 'fill_container', gap: 10 }, [
              Row({ width: 'fill_container', justifyContent: 'space_between' }, [
                Tx('H4', 'Batch 2 of 4 — rank, keep or reject'),
                Button('Regenerate batch', 'outline', { icon: 'refresh-cw' }),
              ]),
              ...T5.map(candidate),
            ]),
            Panel(
              [
                Tx('Body Strong', 'Your brief'),
                Tx(
                  'Paragraph',
                  'Late-night drive home, calm but not sleepy, about 45 minutes. Start from liked songs.',
                  { wrap: true },
                ),
                Divider(),
                Tx('Muted', 'Kept so far · 7 tracks · 28 min'),
                Progress(),
                Button('Review playlist', 'default', { width: 'fill_container' }),
              ],
              { width: 320 },
            ),
          ]),
        ],
        { library: false },
      ),
    mobile: () =>
      Mobile(
        'Builder',
        [
          stepper(2, true),
          Tx('H3', 'Rank, keep or reject'),
          ...TRACKS.slice(0, 4).map((t, i) =>
            R(
              'Candidate Row/Compact',
              {},
              {
                rank: { content: `#${i + 1}` },
                cover: { fill: img(ART[t[4]]) },
                title: { content: t[0] },
                meta: { content: t[1] },
              },
            ),
          ),
          Button('Regenerate batch', 'outline', { icon: 'refresh-cw', width: 'fill_container' }),
        ],
        { mini: false, header: MHeader('Build a playlist') },
      ),
    states: [
      state(
        'Questionnaire',
        () =>
          Desktop(
            'Questions',
            [
              pageTitle('Build a playlist', null, true),
              stepper(1),
              Panel(
                [
                  Tx('Eyebrow', 'QUESTION 2 OF 4'),
                  Tx('H2', 'What should it feel like?'),
                  Chips(['Calm', 'Focused', 'Euphoric', 'Melancholic', 'Energetic']),
                  Divider(),
                  Tx('Body Strong', 'Start from'),
                  Chips(['Liked songs', 'Everything']),
                  Row({ gap: 10 }, [Button('Back', 'ghost'), Button('Next', 'default')]),
                ],
                { width: 720 },
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Questions',
            [
              stepper(1, true),
              Tx('Eyebrow', 'QUESTION 2 OF 4'),
              Tx('H2', 'What should it feel like?'),
              Chips(['Calm', 'Focused', 'Euphoric']),
              Button('Next', 'large-default', { width: 'fill_container' }),
            ],
            { mini: false, header: MHeader('Build a playlist') },
          ),
      ),
      state(
        'Generating',
        () =>
          Desktop(
            'Generating',
            [pageTitle('Build a playlist', null, true), stepper(2), Skeleton('list')],
            { library: false },
          ),
        () =>
          Mobile('Generating', [stepper(2, true), Skeleton('list', true)], {
            mini: false,
            header: MHeader('Build a playlist'),
          }),
      ),
      state(
        'Error',
        () =>
          Desktop(
            'Error',
            [
              pageTitle('Build a playlist', null, true),
              stepper(2),
              ErrorState('Candidates could not be generated', 'Your answers are saved. Try again.'),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Error',
            [ErrorState('Candidates could not be generated', 'Your answers are saved. Try again.')],
            { mini: false, header: MHeader('Build a playlist') },
          ),
      ),
    ],
  },
  'listening-analytics': {
    title: 'Listening analytics',
    route: 'concept — backlog "Listening Analytics"',
    context: 'Personal listening statistics. Concept.',
    desktop: () =>
      Desktop(
        'Analytics',
        [
          pageTitle('Your listening', null, true),
          Tx('Muted', 'October so far. Only visible to you.'),
          Row({ width: 'fill_container', gap: 16 }, [
            stat('Minutes listened', '1,284', '+18% vs September'),
            stat('Tracks', '342', '96 new to you'),
            stat('Top genre', 'Synth pop', '41% of listening'),
            stat('Streak', '12 days', 'Longest this year'),
          ]),
          Row({ width: 'fill_container', gap: 16, alignItems: 'start' }, [
            Panel([Tx('Body Strong', 'Listening by day'), bars()]),
            Panel(
              [
                Tx('Body Strong', 'Top artists'),
                ...ARTISTS.slice(4)
                  .concat(ARTISTS.slice(1, 3))
                  .map(([a, art]) => MobileTrack(a, 'Artist', art)),
              ],
              { width: 380 },
            ),
          ]),
        ],
        { library: false },
      ),
    mobile: () =>
      Mobile(
        'Analytics',
        [
          Row({ gap: 12, width: 'fill_container' }, [
            stat('Minutes', '1,284', '+18%'),
            stat('Tracks', '342', '96 new'),
          ]),
          Panel([Tx('Body Strong', 'Listening by day'), bars()]),
          Tx('H4', 'Top artists'),
          ...ARTISTS.slice(1, 4).map(([a, art]) => MobileTrack(a, 'Artist', art)),
        ],
        { tab: 'library', header: MHeader('Your listening') },
      ),
    states: [
      state(
        'Not enough data',
        () =>
          Desktop(
            'Not enough',
            [
              pageTitle('Your listening', null, true),
              EmptyState(
                'Not enough listening yet',
                'Listen for a few days and your statistics will appear here.',
                'Find something to play →',
                'chart-column',
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Not enough',
            [
              EmptyState(
                'Not enough listening yet',
                'Listen for a few days and your statistics will appear here.',
                'Find something to play →',
                'chart-column',
              ),
            ],
            { tab: 'library', header: MHeader('Your listening') },
          ),
      ),
      ...std('Analytics', {
        loading: 'grid',
        error: ['Statistics are unavailable', 'Try again in a moment.'],
        desktopOpts: { library: false },
        mobileOpts: { tab: 'library' },
      }),
    ],
  },
  loading,
  friends,
  'friends-find': friendsFind,
  'friends-requests': friendsRequests,
  notifications: {
    title: 'Notifications',
    route: 'concept — header popover exists; full page parked until a backend exists',
    context: 'Followers, releases, playlists and events. Concept.',
    desktop: () =>
      Desktop('Notifications', [
        Row({ width: 760, justifyContent: 'space_between' }, [
          Row({ gap: 10 }, [Tx('H1', 'Notifications'), Concept()]),
          Button('Mark all read', 'ghost'),
        ]),
        Chips(['All', 'Followers', 'Releases', 'Playlists', 'Events']),
        Col({ gap: 4, width: 760 }, notes()),
      ]),
    mobile: () =>
      Mobile('Notifications', [Chips(['All', 'Followers', 'Releases']), ...notes()], {
        header: MHeader('Notifications', { actions: ['check-check'] }),
      }),
    states: [
      state(
        'All caught up',
        () =>
          Desktop('Caught up', [
            Tx('H1', 'Notifications'),
            EmptyState(
              "You're all caught up",
              'Watch this space for news on your followers, playlists, events and more.',
              null,
              'circle-check',
            ),
          ]),
        () =>
          Mobile(
            'Caught up',
            [
              EmptyState(
                "You're all caught up",
                'Watch this space for news on your followers, playlists, events and more.',
                null,
                'circle-check',
              ),
            ],
            { header: MHeader('Notifications') },
          ),
      ),
      state(
        'Loading',
        () => Desktop('Loading', [Tx('H1', 'Notifications'), Skeleton('notifications')]),
        () =>
          Mobile('Loading', [Skeleton('notifications', true)], {
            header: MHeader('Notifications'),
          }),
      ),
      state(
        'Error',
        () =>
          Desktop('Error', [
            Tx('H1', 'Notifications'),
            ErrorState('Notifications are unavailable right now.', 'Try again in a moment.'),
          ]),
        () =>
          Mobile(
            'Error',
            [ErrorState('Notifications are unavailable right now.', 'Try again in a moment.')],
            { header: MHeader('Notifications') },
          ),
      ),
    ],
  },
}

/* long lists stream in: every infinite list also draws its "loading more" state */
const MORE = {
  'liked-songs': ['track', '50 of 128'],
  playlist: ['track', '20 of 24'],
  recents: ['track', 'Loading earlier days'],
  charts: ['chart', '50 of 100'],
  search: ['track', '20 of 312 results'],
  notifications: ['notifications', '20 of 64'],
  'activity-feed': ['notifications', '20 of 80'],
  'friends-find': ['people', '4 of 38 people'],
}
for (const [key, [kind, count]] of Object.entries(MORE)) {
  const spec = pages[key]
  spec.states = [
    ...(spec.states ?? []),
    state(
      'Loading more',
      () => withMore(spec.desktop(), false, kind, count),
      () => withMore(spec.mobile(), true, kind, count),
    ),
  ]
}

/* app motion patterns drawn as states (command search, atmosphere, mobile panels, video) */
for (const [key, extra] of Object.entries(APP_STATES))
  pages[key].states = [...(pages[key].states ?? []), ...extra]

/* helpers used above */
function quickGrid(cols = 4) {
  const items = [
    ['Liked Songs'],
    ['Night Drive', 'night'],
    ['Afterglow Sessions', 'afterglow'],
    ['Static Lines', 'static'],
    ['Echoes in Motion', 'echoes'],
    ['Drift Control', 'drift'],
    ['Signal On Air', 'night'],
    ['Road Radio', 'afterglow'],
  ]
  const tile = ([t, art]) =>
    art
      ? R('Quick Tile', {}, { cover: { fill: img(ART[art]) }, title: { content: t } })
      : R('Quick Tile/Liked', {}, { title: { content: t } })
  return Col(
    { name: 'Quick Grid', gap: 8, width: 'fill_container' },
    Array.from({ length: Math.ceil(items.length / cols) }, (_, r) =>
      Row({ width: 'fill_container', gap: 8 }, items.slice(r * cols, r * cols + cols).map(tile)),
    ),
  )
}
function homeAll() {
  return [
    Chips(['All', 'Music', 'Podcasts']),
    Col({ gap: 4 }, [Tx('Eyebrow', 'MADE FOR MAYA'), Tx('H1', 'Good evening, Maya')]),
    quickGrid(),
    SectionHeader('Recommended for you'),
    CardRow(LIB_ITEMS.slice(0, 4).map(([t, m, a]) => AlbumCard(t, m, a, 176))),
    SectionHeader('Popular artists'),
    artistRow(4),
  ]
}
function homeMobile() {
  return [
    Row({ width: 'fill_container', gap: 12 }, [
      Avatar('avatar2', 36),
      Col({ gap: 2, width: 'fill_container' }, [
        Tx('Eyebrow', 'MADE FOR MAYA'),
        Tx('H2', 'Good evening'),
      ]),
      IconBtn('bell'),
    ]),
    Chips(['All', 'Music', 'Podcasts']),
    quickGrid(2),
    SectionHeader('Recommended for you'),
    Row(
      { gap: 12 },
      LIB_ITEMS.slice(0, 3).map(([t, m, a]) => AlbumCard(t, m, a, 148)),
    ),
  ]
}
function deviceRows() {
  return [
    R(
      'Device Row/Active',
      {},
      { name: { content: 'This computer' }, status: { content: 'Playing here' } },
    ),
    ...[
      ['speaker', 'Living room speaker', 'Bitrate Connect'],
      ['smartphone', "Maya's iPhone", 'Available'],
      ['tablet', 'Kitchen display', 'Available'],
    ].map(([icon, n, st]) =>
      R('Device Row', {}, { icon: { icon }, name: { content: n }, status: { content: st } }),
    ),
    Tx('Link', "Don't see your device?"),
  ]
}
function devices() {
  return Panel(
    [
      Tx('H4', 'Connect to a device'),
      Tx('Muted', 'Afterglow · Nova & the Static'),
      ...deviceRows(),
    ],
    { width: 340 },
  )
}
function nowPlayingMobile() {
  return [
    BigCover('afterglow', 342),
    Row({ width: 'fill_container' }, [
      Col({ gap: 4, width: 'fill_container' }, [
        Tx('H1', 'Afterglow'),
        Tx('Muted', 'Nova & the Static'),
      ]),
      Ic('heart', 'Primary', 24),
    ]),
    R('Seek Bar'),
    R('Transport'),
    Row({ width: 'fill_container', justifyContent: 'space_between' }, [
      Row({ gap: 8 }, [Ic('monitor-speaker', 'Primary'), Tx('Link', 'This phone')]),
      Row({ gap: 4 }, [IconBtn('mic-vocal'), IconBtn('list-music')]),
    ]),
  ]
}

function legal() {
  return [
    R(
      'Alert/Warning',
      {},
      {
        text: {
          content:
            'Draft — pending legal review. Text in [[double brackets]] is not filled in yet.',
        },
      },
    ),
    Tx('Eyebrow', 'LEGAL'),
    Tx('H1', 'Terms of Use'),
    Tx(
      'Paragraph',
      'These terms govern your use of Bitrate — the web player, the mobile apps and the artist tools.',
      { wrap: true },
    ),
    ...[
      ['1. Acceptance and eligibility', 'You must be at least 16 years old to use Bitrate.'],
      [
        '2. Your account',
        'Keep your login details safe. Tell us at [[support email]] if you suspect unauthorised access.',
      ],
      [
        '3. Using the service',
        'Bitrate gives you a personal, non-transferable licence to stream music for private listening.',
      ],
    ].flatMap(([h, b]) => [Tx('H3', h), Tx('Paragraph', b, { wrap: true })]),
    R(
      'Note',
      {},
      {
        text: {
          content:
            'Note — these terms do not limit rights you have under the consumer law of your country.',
        },
      },
    ),
    Divider(),
    Tx('Body Strong', 'Other legal documents'),
    ...[
      'Privacy Policy',
      'Community Guidelines',
      'Complaints and reports',
      'Copyright and notice-and-action',
    ].map((d) => Row({ gap: 8 }, [Ic('file-text', 'Muted', 16), Tx('Link', d)])),
  ]
}
function activity() {
  return [
    ['avatar3', 'Jonah', 'liked', 'Night Signal', 'night', '12 min ago'],
    ['avatar1', 'Ana', 'added 3 tracks to', 'Rain Drive', 'drift', '1 h ago'],
    ['avatar4', 'Leo', 'started following', 'Luma Vale', 'luma', '3 h ago'],
    ['avatar2', 'Maya', 'is listening to', 'Afterglow', 'afterglow', 'now'],
  ].map(([av, n, a, item, art, t]) =>
    R(
      'Activity Row',
      {},
      {
        avatar: {
          fill: { type: 'image', url: `../design-system/assets/avatars/${av}.jpg`, mode: 'cover' },
        },
        name: { content: n },
        action: { content: a },
        item: { content: item },
        time: { content: t },
        cover: { fill: img(ART[art]) },
      },
    ),
  )
}
function chart(n, mobile) {
  const trend = ['arrow-up', 'arrow-down', 'minus']
  return TRACKS.slice(0, n).map((r, i) =>
    R(
      'Chart Row',
      {},
      {
        rank: { content: String(i + 1) },
        trend: { icon: trend[i % 3] },
        cover: { fill: img(ART[r[4]]) },
        title: { content: r[0] },
        artist: { content: r[1] },
        plays: mobile ? { enabled: false } : { content: `${(9.8 - i * 0.7).toFixed(1)}M plays` },
        duration: { content: r[3] },
      },
    ),
  )
}
function node(label, sub, _art) {
  return R('Graph Node', {}, { label: { content: label }, sub: { content: sub } })
}
function stepper(current, compact) {
  const names = ['Purpose', 'Questions', 'Candidates', 'Review']
  const parts = []
  names.forEach((s, i) => {
    const kind =
      i < current
        ? 'Stepper/Step Done'
        : i === current
          ? 'Stepper/Step Current'
          : 'Stepper/Step Upcoming'
    parts.push(
      R(
        kind,
        {},
        {
          label: compact ? { enabled: false } : { content: s },
          ...(i >= current ? { number: { content: String(i + 1) } } : {}),
        },
      ),
    )
    if (i < names.length - 1)
      parts.push(R(i < current ? 'Stepper/Connector Done' : 'Stepper/Connector'))
  })
  return Row({ name: 'Stepper', width: 'fill_container', gap: 10 }, parts)
}
function candidate([t, a, , d, art], i) {
  return R(
    'Candidate Row',
    {},
    {
      rank: { content: `#${i + 1}` },
      cover: { fill: img(ART[art]) },
      title: { content: t },
      meta: { content: `${a} · ${d}` },
    },
  )
}
function stat(label, value, sub) {
  return R(
    'Stat Tile',
    {},
    { label: { content: label }, value: { content: value }, sub: { content: sub } },
  )
}
function bars() {
  return Row(
    { name: 'Listening By Day', width: 'fill_container', height: 180, gap: 18, alignItems: 'end' },
    [
      ['Mon', 46],
      ['Tue', 62],
      ['Wed', 38],
      ['Thu', 74],
      ['Fri', 100],
      ['Sat', 88],
      ['Sun', 56],
    ].map(([d, v]) =>
      R(
        v === 100 ? 'Bar Chart/Bar Highlight' : 'Bar Chart/Bar',
        {},
        { bar: { height: Math.round((150 * v) / 100) }, label: { content: d } },
      ),
    ),
  )
}
function notes() {
  return [
    ['user-plus', 'Jonah started following you', '5 min ago', true],
    ['disc-3', 'Luma Vale released a new single: Low Orbit', '2 h ago', true],
    ['list-music', 'Ana added 3 tracks to Rain Drive', 'Yesterday', false],
    ['calendar', 'Mira Sol announced a live session on 18 Oct', '2 days ago', false],
  ].map(([icon, text, time, unread]) =>
    R(
      unread ? 'Notification Row/Unread' : 'Notification Row/Read',
      {},
      { icon: { icon }, text: { content: text }, time: { content: time } },
    ),
  )
}
