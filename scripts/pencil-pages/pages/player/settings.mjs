// Web-player page specs: settings.
import {
  Alert,
  Badge,
  Button,
  Col,
  Desktop,
  FieldError,
  IconBtn,
  Input,
  MHeader,
  Mobile,
  OtpField,
  Panel,
  R,
  Row,
  Select,
  SettingRow,
  Skeleton,
  Spacer,
  Switch,
  Tx,
  state,
} from '../../ui.mjs'
import { Switch as NotificationSwitch } from '../../pages-notifications.mjs'
import { pageTitle } from './shared.mjs'

/* Preferences as bento tiles: each section is a self-contained tile (future: user-arranged); device-only
   settings are badged, because they live in this browser only (see the inventory in the design notes) */
const settingsTiles = (mobile, { twoFaOn, sessionsError } = {}) => {
  const sel = (v) => Select(null, v, mobile ? 150 : 200)
  const tile = (t, rows, device) =>
    Panel(
      [
        Row({ name: 'Tile Head', width: 'fill_container', justifyContent: 'space_between' }, [
          Tx('H4', t, { wrap: true, width: 'fill_container' }),
          device && Badge('This device', 'outline'),
        ]),
        ...rows,
      ],
      { width: 'fill_container', gap: 4 },
    )
  return {
    account: tile('Account', [
      SettingRow('Edit login methods', null, Button('Edit', 'outline', { icon: 'external-link' })),
      SettingRow('Email address', 'maya@example.com', Badge('Verified', 'secondary')),
    ]),
    sessions: tile(
      'Active sessions',
      sessionsError
        ? [Alert('Sessions could not be loaded.', 'Try again in a moment.')]
        : [
            SettingRow('This browser', 'Started 9 Oct 2026, 21:40', Badge('Current', 'outline')),
            SettingRow('Browser session', 'Started 2 Oct 2026, 08:12', IconBtn('trash-2', false)),
            Row({ padding: [12, 0, 0, 0] }, [Button('Log out all other sessions', 'outline')]),
          ],
    ),
    notifications: tile('Notifications', [
      Tx('Muted', 'One mode at a time.', { wrap: true }),
      Row({ padding: [8, 0, 0, 0], width: 'fill_container' }, [NotificationSwitch('app')]),
    ]),
    plan: tile('Your plan', [
      SettingRow('Free', 'Your subscription is active.', Badge('Active', 'secondary')),
    ]),
    language: tile(
      'Language',
      [SettingRow('Choose the language used throughout the app', null, sel('English'))],
      true,
    ),
    audio: tile(
      'Audio quality',
      [
        SettingRow('Streaming quality', null, sel('Automatic')),
        SettingRow('Normalize volume', 'Set the same volume level for all songs', Switch('', true)),
      ],
      true,
    ),
    library: tile('Your Library', [
      SettingRow(
        'Use compact library layout',
        'Track lists gain a separate artist column and tighter rows.',
        Switch('', false),
      ),
    ]),
    display: tile('Display', [
      SettingRow('Show the now-playing panel on click of play', null, Switch('', true)),
    ]),
    videos: tile(
      'Videos and visuals',
      [
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
          'Vertically scrolling videos and clips from artists.',
          Switch('', false),
        ),
      ],
      true,
    ),
    playback: tile('Playback', [
      Col({ padding: [10, 0, 0, 0], width: 'fill_container', gap: 10 }, [
        Tx('Body Strong', 'Equalizer'),
        R('Equalizer'),
      ]),
    ]),
    activity: tile(
      'Listening activity and insights',
      [
        SettingRow(
          'Listening activity on desktop and mobile',
          'People can see the music you are playing and compare listening activity.',
          Switch('', false),
        ),
      ],
      true,
    ),
    visible: tile(
      'What others can see on your profile',
      [
        SettingRow(
          'Followers and following',
          'People can see who is following you and who you are following.',
          Switch('', true),
        ),
        SettingRow(
          'Playlists on your profile',
          'People can see the playlists you have added to your profile.',
          Switch('', false),
        ),
      ],
      true,
    ),
    privacy: tile('Account privacy', [
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
    profile: tile('Profile details', [
      Col({ padding: [10, 0, 0, 0], gap: 14, width: 'fill_container' }, [
        Input('Username', 'maya'),
        Input('Description', 'Tell people about yourself'),
        R('Form/Drop Zone'),
        Button('Save profile', 'default'),
      ]),
    ]),
    twofa: tile(
      'Two-factor authentication',
      twoFaOn
        ? [
            SettingRow('2FA is enabled for this account.', null, Badge('Enabled', 'secondary')),
            Col({ padding: [12, 0, 0, 0], gap: 12, width: 'fill_container' }, [
              OtpField(
                'Current authentication code',
                'Filled',
                'Enter a current code to turn 2FA off.',
              ),
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
  }
}
const BENTO_L = ['account', 'plan', 'audio', 'library', 'display', 'videos', 'twofa']
const BENTO_R = [
  'profile',
  'notifications',
  'sessions',
  'language',
  'playback',
  'activity',
  'visible',
  'privacy',
]
const settingsDesktop = (name, o) => {
  const t = settingsTiles(false, o)
  return Desktop(
    name,
    [
      pageTitle('Settings', IconBtn('search')),
      Row({ name: 'Bento', width: 'fill_container', gap: 20, alignItems: 'start' }, [
        Col(
          { name: 'Column A', width: 'fill_container', gap: 20 },
          BENTO_L.map((k) => t[k]),
        ),
        Col(
          { name: 'Column B', width: 'fill_container', gap: 20 },
          BENTO_R.map((k) => t[k]),
        ),
      ]),
    ],
    { library: false, height: 2560 },
  )
}
const settingsMobile = (name, o) => {
  const t = settingsTiles(true, o)
  return Mobile(
    name,
    [...BENTO_L, ...BENTO_R].map((k) => t[k]),
    {
      mini: false,
      header: MHeader('Settings', { actions: ['search'] }),
      height: 4300,
    },
  )
}
const twoFaSetup = (mobile) => [
  Tx('H3', 'Two-factor authentication'),
  Tx('Paragraph', 'Protect your account with an authenticator app.', { wrap: true }),
  Panel([Tx('Muted', 'Manual code'), Tx('Code', 'JBSW Y3DP EHPK 3PXP')]),
  OtpField(
    'Code from your app',
    'Filled',
    'Scan the QR or type the manual code, then enter the 6 digits.',
  ),
  Button(
    'Enable 2FA',
    mobile ? 'large-default' : 'default',
    mobile ? { width: 'fill_container' } : {},
  ),
]

export const settingsPages = {
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
              Col({ width: 'fill_container', gap: 24 }, [
                Row({ width: 'fill_container', gap: 10 }, [
                  Tx('H1', 'Settings'),
                  Spacer(),
                  Input(null, 'Search settings', 320),
                  IconBtn('x'),
                ]),
                SettingRow('Streaming quality', null, Select(null, 'Automatic', 220)),
                SettingRow(
                  'Normalize volume',
                  'Set the same volume level for all songs',
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
        () => Desktop('Loading', [Tx('H1', 'Settings'), Skeleton('settings')], { library: false }),
        () =>
          Mobile('Loading', [Skeleton('settings', true)], {
            mini: false,
            header: MHeader('Settings'),
          }),
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
}
