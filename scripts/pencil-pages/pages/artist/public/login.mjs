// Artist / Login (routes/login.tsx → features/login LoginForm + TwoFactorLoginForm): email and password,
// the social sign-in locked until consent, and every state the form renders — field errors, wrong
// credentials, unverified email (with the underlined "Verify email" link), each OAuth failure the API
// redirects back with (?error=), submitting, add-account (?addAccount) and the two-factor code step.
import { authKit } from './auth-kit.mjs'
import { publicSpec } from './spec.mjs'

/* model/oauthFailure.ts: ?error= code → message (auth.ts) */
const OAUTH = [
  [
    'legal',
    'To create an account, accept the Terms of Use, Community Guidelines and Artist Agreement first.',
  ],
  [
    'account exists',
    'An account with this email already exists. Sign in with your password and confirm your email first.',
  ],
  ['account unavailable', 'This account is no longer available.'],
  ['cancelled', 'Sign-in was cancelled. Choose a way to sign in to continue.'],
  [
    'email missing',
    'We did not receive an email address from that account. Allow access to your email, or sign in another way.',
  ],
  [
    'email unverified',
    'That account has not confirmed its email address. Confirm it with the provider, or sign in another way.',
  ],
  ['expired', 'Your sign-in session expired. Please try again.'],
  ['unavailable', 'This sign-in option is not available yet. Use another way to sign in.'],
  ['other', 'Social sign-in did not finish. Please try again.'],
]

/** The login page spec. */
export function loginPage(ui, frames) {
  const { P } = ui
  const a = authKit(ui)
  const form = (m, o = {}) =>
    a.card(m, o.add ? 'Add another account' : 'Welcome back!', null, [
      ...(o.add
        ? [
            P(
              'Muted',
              'Sign in to another artist account. Your current account stays saved in this browser.',
            ),
          ]
        : []),
      a.input('Email Address', o.email ?? 'example@gmail.com', o.emailError),
      a.password('Password', o.password ?? 'Password', o.passwordError),
      /* design ahead of code: LoginForm has no reset link yet (DESIGN.md § Design ahead of code) */
      a.endLink('Forgot password?'),
      ...(o.alert ? [o.alert] : []),
      a.primary(o.busy ? 'Logging in...' : 'Continue'),
      a.or(),
      a.social(o.unlocked),
      a.footnote("Don't have an account?", 'Sign up.'),
      ...(o.add ? [a.footnote(null, 'Back to workspace')] : []),
    ])
  const filled = { email: 'mira@nightsignal.fm', password: '••••••••••••' }
  const twoFactor = (m, o = {}) =>
    a.card(m, 'Verify your sign-in', 'Enter the code from your authenticator app.', [
      a.code('Authentication code', o.code ?? '482913', null, null),
      ...(o.codeError ? [a.alert('Body', o.codeError)] : []),
      ...(o.root ? [a.alert('Body', o.root)] : []),
      a.primary(o.busy ? 'Verifying…' : 'Verify and sign in'),
      a.ghost('Back to sign-in'),
    ])
  return publicSpec(
    frames,
    {
      title: 'Artist / Login',
      route: '/login?next=&twoFactor=&addAccount=&error=',
      context:
        'Sign in with email and password or a social account (locked until the legal consent is ticked). ?next= returns to the page that asked; ?twoFactor opens the code step.',
    },
    (m) => [form(m)],
    [
      ['Filled', (m) => [form(m, filled)]],
      [
        'Field errors',
        (m) => [
          form(m, {
            email: 'mira@nightsignal',
            emailError: 'Please enter a valid email address',
            passwordError: 'Password is required',
          }),
        ],
      ],
      [
        'Invalid credentials',
        (m) => [
          form(m, {
            ...filled,
            alert: a.alert('Body', 'Invalid email or password. Please try again.'),
          }),
        ],
      ],
      [
        'Unverified email',
        (m) => [
          form(m, {
            ...filled,
            alert: a.alert('Body', 'Verify your email before signing in.', 'Verify email'),
          }),
        ],
      ],
      ...OAUTH.map(([key, text]) => [
        `OAuth error — ${key}`,
        (m) => [form(m, { alert: a.alert('Body', text) })],
      ]),
      ['Consent given', (m) => [form(m, { unlocked: true })]],
      ['Submitting', (m) => [form(m, { ...filled, busy: true })]],
      ['Add account', (m) => [form(m, { add: true })]],
      ['Two-factor code', (m) => [twoFactor(m)]],
      [
        'Two-factor invalid',
        (m) => [
          twoFactor(m, {
            code: '48291',
            codeError: 'Enter the 6-digit code from your authenticator',
          }),
        ],
      ],
      [
        'Two-factor rejected',
        (m) => [twoFactor(m, { root: 'Invalid or expired code. Please try again.' })],
      ],
      [
        'Two-factor expired',
        (m) => [twoFactor(m, { root: 'Your sign-in attempt expired. Go back and sign in again.' })],
      ],
      [
        'Two-factor failed',
        (m) => [twoFactor(m, { root: 'Could not verify your code. Please try again.' })],
      ],
      ['Two-factor verifying', (m) => [twoFactor(m, { busy: true })]],
    ],
  )
}
