// Native app: sign-in and the second factor (copy = apps/mobile/lib/i18n/messages/en/auth.ts).
import {
  Alert,
  AuthMobile,
  Button,
  Col,
  FieldError,
  IconBtn,
  Input,
  OtpField,
  Row,
  Tx,
} from '../../ui.mjs'
import { title } from '../player/shared.mjs'
import { ms } from './shell.mjs'

export const footer = (lead, link) =>
  Row({ name: 'Footer Link', gap: 6 }, [Tx('Muted', lead), Tx('Link', link)])
/** A password input with the show/hide toggle beside it. */
export const PasswordField = (label, value = '••••••••', icon = 'eye') =>
  Row({ name: 'Password Field', width: 'fill_container', gap: 8, alignItems: 'end' }, [
    Input(label, value),
    IconBtn(icon),
  ])

const LOGIN = ['Login to your account', 'Welcome back! Please sign in to continue.']
const loginForm = ({ alert, email = 'you@example.com', errors = [], busy = false } = {}) => [
  title(...LOGIN),
  alert,
  Col({ name: 'Fields', gap: 14, width: 'fill_container' }, [
    Input('Email Address', email),
    errors[0] && FieldError(errors[0]),
    PasswordField('Password'),
    errors[1] && FieldError(errors[1]),
    Row({ width: 'fill_container', justifyContent: 'end' }, [Tx('Link', 'Forgot password?')]),
  ]),
  Button(busy ? 'Logging in...' : 'Log in', 'large-default', { width: 'fill_container' }),
  footer("Don't have an account?", 'Sign up'),
]
const failed = (body) => Alert('Sign-in failed', body)

const twoFactor = ({ otp = 'Active', hint, busy = false } = {}) => [
  title('Enter your 2FA code', 'Use the 6-digit code from your authenticator app.'),
  OtpField('Authentication code', otp, hint),
  Button('Verify', 'large-default', {
    width: 'fill_container',
    ...(busy ? { icon: 'loader-circle' } : {}),
  }),
  Tx('Link', 'Back to login'),
]

export const signInPages = {
  'auth-login': {
    title: 'Mobile / Login',
    route: 'app (auth)/login',
    context: 'Native app sign-in: email + password; session cookies live in the OS cookie store.',
    mobile: () => AuthMobile('Login', loginForm()),
    states: [
      ms('Validation errors', () =>
        AuthMobile(
          'Validation',
          loginForm({
            email: 'maya@',
            errors: ['Enter a valid email address.', 'Use 6 to 32 characters.'],
          }),
        ),
      ),
      ms('Submitting', () =>
        AuthMobile('Submitting', loginForm({ email: 'maya@example.com', busy: true })),
      ),
      ms('Wrong credentials', () =>
        AuthMobile(
          'Credentials',
          loginForm({ alert: failed('Check your email and password and try again.') }),
        ),
      ),
      ms('Network error', () =>
        AuthMobile(
          'Network',
          loginForm({ alert: failed("Can't reach Bitrate. Check your connection and try again.") }),
        ),
      ),
      ms('Rate limited', () =>
        AuthMobile(
          'Rate limited',
          loginForm({ alert: failed('Too many requests. Wait a moment and try again.') }),
        ),
      ),
    ],
  },
  'auth-two-factor': {
    title: 'Mobile / Two-factor',
    route: 'app (auth)/two-factor',
    context: 'Second sign-in step after a login that answered requires2fa.',
    mobile: () => AuthMobile('Two-factor', twoFactor()),
    states: [
      ms('Incomplete code', () =>
        AuthMobile('Incomplete', twoFactor({ otp: 'Error', hint: 'Enter the 6-digit code.' })),
      ),
      ms('Invalid code', () =>
        AuthMobile('Invalid', twoFactor({ otp: 'Error', hint: 'Invalid or expired 2FA code' })),
      ),
      ms('Submitting', () => AuthMobile('Submitting', twoFactor({ otp: 'Filled', busy: true }))),
    ],
  },
}
