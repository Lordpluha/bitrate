// Native app: registration and password recovery (copy = apps/mobile/lib/i18n/messages/en/auth.ts).
import {
  Alert,
  AuthMobile,
  Button,
  CheckRow,
  Col,
  FieldError,
  Input,
  Panel,
  Tx,
} from '../../ui.mjs'
import { title } from '../player/shared.mjs'
import { PasswordField, footer } from './auth-sign-in.mjs'
import { ms } from './shell.mjs'

const CONSENT =
  'I am at least 16 years old and I accept the Terms of Use, Community Guidelines and Privacy Policy'
const REG = [
  'Create your account for free and start listening',
  'Sign up with your email to start listening.',
]

const registration = ({ alert, errors = {}, busy = false, filled = false } = {}) => [
  title(...REG),
  alert,
  Col({ name: 'Fields', gap: 12, width: 'fill_container' }, [
    Input('Email Address', filled ? 'maya@example.com' : 'you@example.com'),
    errors.email && FieldError(errors.email),
    Input('Username', filled ? 'maya' : 'yourname'),
    errors.username && FieldError(errors.username),
    PasswordField('Password'),
    errors.password && FieldError(errors.password),
  ]),
  CheckRow(CONSENT),
  errors.legal && FieldError(errors.legal),
  Button(busy ? 'Registering...' : 'Register', 'large-default', { width: 'fill_container' }),
  footer('Already have an account?', 'Log in'),
]
const done = () => [
  Panel([
    Tx('H3', 'Confirm your email'),
    Tx('Paragraph', 'We sent a confirmation link to maya@example.com. Open it, then log in.', {
      wrap: true,
    }),
  ]),
  Button('Back to login', 'large-outline', { width: 'fill_container' }),
]

const forgot = ({ alert, error, busy = false } = {}) => [
  title('Reset your password', 'Enter the email associated with your account.'),
  alert,
  Input('Email Address', error ? 'maya@' : 'you@example.com'),
  error && FieldError(error),
  Button(busy ? 'Sending...' : 'Send reset link', 'large-default', { width: 'fill_container' }),
  Tx('Link', 'Back to login'),
]
const sent = () => [
  title('Reset your password', 'Enter the email associated with your account.'),
  Alert('Check your inbox', 'If an account exists for this email, a reset link has been sent.'),
  Button('Back to login', 'large-outline', { width: 'fill_container' }),
]

const reset = ({ error, busy = false } = {}) => [
  title('Create a new password', 'Choose a new password for your account.'),
  PasswordField('New password', error ? '123' : '••••••••'),
  error && FieldError(error),
  Button(busy ? 'Updating...' : 'Update password', 'large-default', { width: 'fill_container' }),
]
const resetDone = () => [
  Panel([Tx('H3', 'Password updated. You can now log in.', { wrap: true })]),
  Button('Log in', 'large-default', { width: 'fill_container' }),
]
const noToken = () => [
  title('Create a new password'),
  Alert(
    'Link incomplete',
    'This password reset link is missing its token. Request a new link and try again.',
  ),
  Button('Request another link', 'large-outline', { width: 'fill_container' }),
]

export const accountPages = {
  'auth-registration': {
    title: 'Mobile / Registration',
    route: 'app (auth)/register',
    context: 'Email sign-up; the account confirms its email before the first login.',
    mobile: () => AuthMobile('Registration', registration()),
    states: [
      ms('Validation errors', () =>
        AuthMobile(
          'Validation',
          registration({
            errors: {
              email: 'Enter a valid email address.',
              username: 'Use 3 to 20 characters.',
              password: 'Use 6 to 32 characters.',
              legal: 'Accept the terms to create an account.',
            },
          }),
        ),
      ),
      ms('Taken', () =>
        AuthMobile(
          'Taken',
          registration({
            filled: true,
            alert: Alert(
              'Unable to create account. Please try again.',
              'This email or username is already taken.',
            ),
          }),
        ),
      ),
      ms('Submitting', () => AuthMobile('Submitting', registration({ filled: true, busy: true }))),
      ms('Done', () => AuthMobile('Done', done())),
    ],
  },
  'auth-forgot-password': {
    title: 'Mobile / Forgot password',
    route: 'app (auth)/forgot-password',
    context: 'Request a reset email; the answer never reveals whether the account exists.',
    mobile: () => AuthMobile('Forgot', forgot()),
    states: [
      ms('Invalid email', () =>
        AuthMobile('Invalid email', forgot({ error: 'Enter a valid email address.' })),
      ),
      ms('Submitting', () => AuthMobile('Submitting', forgot({ busy: true }))),
      ms('Link sent', () => AuthMobile('Sent', sent())),
      ms('Failed', () =>
        AuthMobile(
          'Failed',
          forgot({
            alert: Alert(
              'Unable to request a password reset.',
              "Can't reach Bitrate. Check your connection and try again.",
            ),
          }),
        ),
      ),
    ],
  },
  'auth-reset-password': {
    title: 'Mobile / Reset password',
    route: 'app (auth)/reset-password?token= (deep link bitrate://reset-password)',
    context: 'Set a new password from the emailed link opened in the app.',
    mobile: () => AuthMobile('Reset', reset()),
    states: [
      ms('Validation error', () =>
        AuthMobile('Validation', reset({ error: 'Use 6 to 32 characters.' })),
      ),
      ms('Submitting', () => AuthMobile('Submitting', reset({ busy: true }))),
      ms('Updated', () => AuthMobile('Updated', resetDone())),
      ms('Link incomplete', () => AuthMobile('No token', noToken())),
      ms('Failed', () => AuthMobile('Failed', reset({ error: 'Unable to reset the password.' }))),
    ],
  },
}
