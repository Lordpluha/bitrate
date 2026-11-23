// Artist / Forgot password (features/forgot-password): one email field and "Send reset link"; the
// result is a toast (sent — worded so it never reveals whether the address exists — or failed).
import { authKit } from './auth-kit.mjs'
import { publicSpec } from './spec.mjs'

/** The forgot-password page spec. */
export function forgotPasswordPage(ui, frames) {
  const a = authKit(ui)
  const form = (m, o = {}) =>
    a.card(m, 'Forgot password', null, [
      a.input('Email', o.email ?? '', o.error),
      a.secondary('Send reset link'),
    ])
  const withToast = (tone, text, o) => (m) => [a.toast(tone, text, m), form(m, o)]
  return publicSpec(
    frames,
    {
      title: 'Artist / Forgot password',
      route: '/forgot-password',
      context:
        'Requests a reset link by email. The answer is the same whether or not the address has an account; the form clears after sending.',
    },
    (m) => [form(m)],
    [
      ['Filled', (m) => [form(m, { email: 'mira@nightsignal.fm' })]],
      [
        'Email invalid',
        (m) => [
          form(m, { email: 'mira@nightsignal', error: 'Please enter a valid email address' }),
        ],
      ],
      ['Sent', withToast('Success', 'If that email exists, a reset link was sent', {})],
      [
        'Request failed',
        withToast('Error', 'Unable to process request', { email: 'mira@nightsignal.fm' }),
      ],
    ],
  )
}
