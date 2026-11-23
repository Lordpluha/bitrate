// Artist / Reset password (features/reset-password, ?token=): new password and confirmation; field
// errors, a missing or rejected token as a toast, success as a toast on the way to /login, and the
// route's Suspense spinner while the form loads.
import { authKit } from './auth-kit.mjs'
import { publicSpec } from './spec.mjs'

/** The reset-password page spec. */
export function resetPasswordPage(ui, frames) {
  const { W, Tx, Row } = ui
  const a = authKit(ui)
  const form = (m, o = {}) =>
    a.card(m, 'Reset password', null, [
      a.password('New password', o.password ?? '', o.passwordError),
      a.password('Confirm password', o.confirm ?? '', o.confirmError),
      a.secondary('Set new password'),
    ])
  const filled = { password: '••••••••••', confirm: '••••••••••' }
  const withToast = (tone, text, o) => (m) => [a.toast(tone, text), form(m, o)]
  return publicSpec(
    frames,
    {
      title: 'Artist / Reset password',
      route: '/reset-password?token=…',
      context:
        'Opened from the reset email. Sets a new password for the token; success returns to /login with a toast.',
    },
    (m) => [form(m)],
    [
      ['Filled', (m) => [form(m, filled)]],
      [
        'Field errors',
        (m) => [
          form(m, {
            password: '•••',
            passwordError: 'Password must be at least 6 characters',
            confirm: '••••••••',
            confirmError: 'Passwords do not match',
          }),
        ],
      ],
      ['Missing token', withToast('Error', 'Missing token', filled)],
      ['Reset failed', withToast('Error', 'Unable to reset password', filled)],
      ['Password updated', withToast('Success', 'Password updated — please log in', filled)],
      [
        'Loading',
        () => [
          Row({ name: 'Loading', gap: 10 }, [
            W('Spinner', { name: 'Spinner' }),
            Tx('Muted', 'Loading page'),
          ]),
        ],
        { height: 900 },
      ],
    ],
  )
}
