// The Security panel of settings (features/account-security TwoFactorSection, ActiveSessionsSection and
// the password reset link): two-factor off, setting up (QR, key, code), on, turning off; the reset link
// sent; signed-in devices with "Sign out other devices" first, a sign-out per device and "Show all".

const DEVICES = [
  ['monitor', 'Chrome on macOS', 'This device · active now', true],
  ['smartphone', 'Safari on iOS', 'Last active Nov 21, 2026', false],
  ['monitor', 'Firefox on Windows', 'Signed in Oct 30, 2026', false],
]

/** Security panel builder bound to the screen helpers `ui`: `(o) → Tile`. */
export function settingsSecurity(ui) {
  const { W, Tx, P, Row, Col, inline, Btn, Tile } = ui
  const code = (error) =>
    W(
      error ? 'Field/Code Error' : 'Field/Code',
      { name: 'Authenticator code', width: 'fill_container' },
      {
        label: { content: 'Authenticator code' },
        value: { content: error ? '4821' : '482913' },
        ...(error
          ? { error: { content: 'Enter the 6-digit code from your authenticator app.' } }
          : { hint: { enabled: false } }),
      },
    )
  const twoFactor = (o) => {
    const head = Row({ name: 'Two-factor', width: 'fill_container', gap: 12 }, [
      W(
        o.on ? 'Check/Done' : 'Check/Pending',
        { name: o.on ? 'Shield on' : 'Shield off', width: 24 },
        { label: { enabled: false } },
      ),
      Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
        Tx('Body Strong', 'Two-factor sign-in'),
        P(
          'Muted',
          o.on
            ? 'On. Sign-in asks for a code from your authenticator app.'
            : 'Off. Add a second step to protect your releases.',
        ),
      ]),
      ...(o.setup || o.turningOff
        ? []
        : [Btn(o.on ? 'Turn off' : o.preparing ? 'Preparing…' : 'Set up', 'Compact Outline')]),
    ])
    if (!o.setup && !o.turningOff) return [head]
    return [
      head,
      ...(o.setup
        ? [
            Row({ name: 'QR', width: 'fill_container', justifyContent: 'center' }, [
              W('QR/Code', { name: 'QR code for your authenticator app' }),
            ]),
            P('Muted', 'Scan the code with an authenticator app, or enter this key manually:'),
            Tx('Body Strong', 'JBSW Y3DP EHPK 3PXP'),
            P('Muted', 'Then enter the 6-digit code it shows to finish.'),
          ]
        : []),
      code(o.codeError),
      Row({ name: 'Actions', gap: 10 }, [
        Btn(
          o.checking ? 'Checking…' : o.turningOff ? 'Turn off two-factor' : 'Turn on two-factor',
          'Primary',
        ),
        Btn('Cancel', 'Ghost'),
      ]),
    ]
  }
  const device = ([icon, title, meta, current]) =>
    W(
      current ? 'Row/Device Current' : 'Row/Device',
      { name: `Device / ${title}`, width: 'fill_container' },
      {
        icon: { icon },
        title: { content: title },
        meta: { content: meta },
        trail: current ? { enabled: false } : inline('Trail', [Btn('Sign out', 'Compact Ghost')]),
      },
    )
  const sessions = (o) => [
    Row({ name: 'Devices head', width: 'fill_container', gap: 12 }, [
      Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
        Tx('Body Strong', 'Signed-in devices'),
        P(
          'Muted',
          o.signedOut
            ? 'Signed out 2 devices.'
            : 'Sign out anywhere you no longer use or do not recognise.',
        ),
      ]),
      Btn(o.signingOut ? 'Signing out…' : 'Sign out other devices', 'Compact Outline'),
    ]),
    ...(o.sessionsLoading
      ? [P('Caption', 'Loading devices…')]
      : o.sessionsError
        ? [
            P('Error', 'Could not load your signed-in devices. Please try again.'),
            Btn('Try again', 'Compact Outline'),
          ]
        : [
            ...(o.allDevices
              ? [...DEVICES, ['tablet', 'Chrome on Android', 'Signed in Sep 12, 2026', false]]
              : DEVICES
            ).map(device),
            Btn(o.allDevices ? 'Show fewer' : 'Show all devices (4)', 'Compact Ghost'),
          ]),
  ]
  return (o = {}) =>
    Tile('Security', 'shield', [
      ...twoFactor(o),
      W('Divider', { name: 'Divider', width: 'fill_container' }),
      Tx('Body Strong', 'Password'),
      P(
        'Muted',
        o.resetSent
          ? 'If mira@nightsignal.fm can receive mail, a reset link is on its way.'
          : 'We email you a link to choose a new password.',
      ),
      Btn(o.resetBusy ? 'Sending…' : 'Send reset link', 'Compact Outline'),
      W('Divider', { name: 'Divider', width: 'fill_container' }),
      ...sessions(o),
    ])
}
