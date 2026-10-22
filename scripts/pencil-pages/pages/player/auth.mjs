// Web-player page specs: auth.
import {
  Alert,
  AuthDesktop,
  AuthMobile,
  Button,
  CardDesktop,
  CheckRow,
  Col,
  FieldError,
  Input,
  OAuth,
  OtpField,
  R,
  Row,
  Tx,
  state,
} from '../../ui.mjs'
import { title } from './shared.mjs'

/* ---------------- auth ---------------- */
const providers = (open) => OAuth(open)
const footer = (lead, link) =>
  Row({ name: 'Footer Link', gap: 6 }, [Tx('Muted', lead), Tx('Link', link)])
const loginForm = (extra, open) => [
  title('Login to your account', 'Welcome back! Please sign in to continue.'),
  extra,
  Col({ name: 'Fields', gap: 14, width: 'fill_container' }, [
    Input('Email Address', 'you@example.com'),
    Input('Password', '••••••••'),
    Row({ width: 'fill_container', justifyContent: 'end' }, [Tx('Link', 'Forgot password?')]),
  ]),
  Button('Log in', 'large-default', { width: 'fill_container' }),
  R('Auth/Or Divider'),
  providers(open),
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
  err
    ? OtpField('Authentication code', 'Error', 'Invalid or expired 2FA code')
    : OtpField('Authentication code', 'Active'),
  Button('Verify', 'large-default', { width: 'fill_container' }),
]
const regForm = (open) => [
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
  OAuth(open, { consent: false }),
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

export const authPages = {
  /* ---------- public ---------- */
  'auth-login': {
    assistant: true,
    title: 'Auth / Login',
    route: '/auth/login',
    context: 'Login with email/password and social providers.',
    ...auth('Login', () => loginForm()),
    states: [
      authState('Submitting', loggingIn),
      authState('Error', () =>
        loginForm(Alert('Sign-in failed', 'Check your email and password and try again.')),
      ),
      authState('More sign-in options', () => loginForm(null, true)),
    ],
  },
  'auth-login-2fa': {
    assistant: true,
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
          OtpField('Authentication code', 'Success', 'Code verified — signing you in…'),
          Button('Verifying...', 'large-default', { width: 'fill_container' }),
        ],
        'One more step.',
      ),
    ],
  },
  'auth-registration': {
    assistant: true,
    title: 'Auth / Registration',
    route: '/auth/registration',
    context: 'Single-step sign-up; password rules surface as validation errors.',
    ...auth('Registration', regForm, 'Start listening for free.'),
    states: [
      authState('More sign-in options', () => regForm(true), 'Start listening for free.'),
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
    assistant: true,
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
    assistant: true,
    title: 'Auth / Reset password',
    route: '/auth/reset-password?token=',
    context: 'Set a new password from the emailed link.',
    desktop: () => CardDesktop('Reset', reset()),
    mobile: () => AuthMobile('Reset', reset()),
    states: [cardState('Mismatch', resetMismatch), cardState('Missing token', noToken)],
  },
  'auth-verify-email': {
    assistant: true,
    title: 'Auth / Verify email',
    route: '/verify-email?email=',
    context: 'Confirm the account email or resend the link.',
    desktop: () => CardDesktop('Verify', verify(true)),
    mobile: () => AuthMobile('Verify', verify(true)),
    states: [
      cardState('Verifying', () => verify(true, true)),
      cardState('No token', () => verify(false)),
    ],
  },
}
