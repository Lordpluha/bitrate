// Artist / Login (routes/login.tsx → features/login LoginForm + TwoFactorLoginForm): email and password,
// the social sign-in locked until consent, and every state the form renders — field errors, wrong
// credentials, unverified email, OAuth failure (?error=), submitting, add-account (?addAccount) and the
// two-factor code step.
import { authKit } from './auth-kit.mjs'
import { publicSpec } from './spec.mjs'

const INVALID_EMAIL = 'Please enter a valid email address'

/** The login page spec. */
export function loginPage(ui, frames) {
  const { Btn } = ui
  const a = authKit(ui)
  const fields = (email = 'mira@nightsignal.fm', o = {}) => [
    a.input('Email Address', email || 'example@gmail.com', o.emailError),
    a.password('Password', o.password ?? '••••••••••••', o.passwordError),
  ]
  const form = (m, o = {}) =>
    a.card(m, o.title ?? 'Welcome back!', o.desc, [
      fields(o.email, o),
      ...(o.alert ? [o.alert] : []),
      a.primary(o.busy ? 'Logging in...' : 'Continue', o.busy ? 'loader-circle' : null),
      a.or(),
      a.social(o.unlocked),
      a.footnote("Don't have an account?", 'Sign up.'),
      ...(o.back ? [a.footnote(null, 'Back to workspace')] : []),
    ])
  const twoFactor = (m, o = {}) =>
    a.card(m, 'Verify your sign-in', 'Enter the code from your authenticator app.', [
      a.code('Authentication code', o.code ?? '482913', o.error, null),
      ...(o.root ? [a.alert('Error', o.root)] : []),
      a.primary(o.busy ? 'Verifying…' : 'Verify and sign in', o.busy ? 'loader-circle' : null),
      a.ghost('Back to sign-in'),
    ])
  const verifyLink = Btn('Verify email', 'Compact Outline', 'mail-check')
  return publicSpec(
    frames,
    {
      title: 'Artist / Login',
      route: '/login',
      context:
        'Sign in with email and password or a social account (locked until the legal consent is ticked). ?next= returns to the page that asked; ?twoFactor opens the code step.',
    },
    (m) => [form(m, { email: '', password: 'Password' })],
    [
      ['Filled', (m) => [form(m)]],
      [
        'Field errors',
        (m) => [
          form(m, {
            email: 'mira@nightsignal',
            emailError: INVALID_EMAIL,
            password: 'Password',
            passwordError: 'Password is required',
          }),
        ],
      ],
      [
        'Invalid credentials',
        (m) => [
          form(m, { alert: a.alert('Error', 'Invalid email or password. Please try again.') }),
        ],
      ],
      [
        'Unverified email',
        (m) => [
          form(m, {
            alert: a.alert('Warning', 'Verify your email before signing in.', verifyLink),
          }),
        ],
      ],
      [
        'OAuth error',
        (m) => [
          form(m, {
            email: '',
            password: 'Password',
            alert: a.alert('Error', 'Sign-in was cancelled. Choose a way to sign in to continue.'),
          }),
        ],
      ],
      ['Consent given', (m) => [form(m, { email: '', password: 'Password', unlocked: true })]],
      ['Submitting', (m) => [form(m, { busy: true })]],
      [
        'Add account',
        (m) => [
          form(m, {
            email: '',
            password: 'Password',
            title: 'Add another account',
            desc: 'Sign in to another artist account. Your current account stays saved in this browser.',
            back: true,
          }),
        ],
      ],
      ['Two-factor code', (m) => [twoFactor(m)]],
      [
        'Two-factor invalid',
        (m) => [
          twoFactor(m, {
            code: '48291',
            error: 'Enter the 6-digit code from your authenticator',
          }),
        ],
      ],
      [
        'Two-factor rejected',
        (m) => [twoFactor(m, { root: 'Invalid or expired code. Please try again.' })],
      ],
      ['Two-factor verifying', (m) => [twoFactor(m, { busy: true })]],
    ],
  )
}
