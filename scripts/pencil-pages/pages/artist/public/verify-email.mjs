// Artist / Verify email (features/verify-email VerifyEmailForm, ?email= ?token= ?next=): the six-digit
// code from the verification email (or the link's token), resend with a 60-second cooldown, and the
// results — code or link rejected, verification failed, rate limited, delivery unavailable or local
// (development), verified. Errors are red text; the code hint stays visible beside a code error.
import { authKit } from './auth-kit.mjs'
import { publicSpec } from './spec.mjs'

const EMAIL = 'mira@nightsignal.fm'
const HINT = 'Six digits. You can paste the entire code.'

/** The verify-email page spec. */
export function verifyEmailPage(ui, frames) {
  const { W, P } = ui
  const a = authKit(ui)
  const form = (m, o = {}) =>
    a.card(m, 'Verify your email', 'One more step to your artist workspace.', [
      P(
        'Body',
        'Enter the six-digit code from your verification email. The code is valid for 10 minutes.',
      ),
      ...(o.token ? [a.secondary(o.busy ? 'Verifying…' : 'Verify email')] : []),
      a.input('Email address', o.email ?? EMAIL, o.emailError),
      a.code('Verification code', o.code ?? '000000', o.codeError, HINT),
      ...(o.verifyError ? [a.alert('Error', o.verifyError)] : []),
      a.primary(o.busy ? 'Verifying…' : 'Verify and continue'),
      a.ghost(
        o.cooldown ? 'Send again in 42s' : o.sending ? 'Sending…' : 'Resend verification email',
      ),
      ...(o.resendError ? [a.alert('Error', o.resendError)] : []),
      ...(o.note ? [P('Muted', o.note)] : []),
      a.footnote(null, 'Back to login'),
    ])
  const verified = (m) =>
    a.card(m, 'Verify your email', 'You’re ready to make some noise.', [
      W(
        'Legal/Note',
        { name: 'Verified', width: 'fill_container' },
        { text: { content: 'Your email has been verified. You can now sign in.' } },
      ),
      a.footnote(null, 'Back to login'),
    ])
  return publicSpec(
    frames,
    {
      title: 'Artist / Verify email',
      route: '/verify-email?email=&token=&next=',
      context:
        'Reached after sign-up (email prefilled) or from the verification email. The link adds a one-click "Verify email"; the code works on its own.',
    },
    (m) => [form(m)],
    [
      ['Code entered', (m) => [form(m, { code: '730514' })]],
      ['From the email link', (m) => [form(m, { token: true })]],
      [
        'Field errors',
        (m) => [
          form(m, {
            email: 'mira@nightsignal',
            emailError: 'Please enter a valid email address',
            code: '7305',
            codeError: 'Enter the six-digit code',
          }),
        ],
      ],
      ['Verifying', (m) => [form(m, { code: '730514', busy: true })]],
      [
        'Code rejected',
        (m) => [
          form(m, {
            code: '730514',
            verifyError: 'This code is invalid or expired. Request a new code if needed.',
          }),
        ],
      ],
      [
        'Link invalid',
        (m) => [
          form(m, { token: true, verifyError: 'This verification link is invalid or expired.' }),
        ],
      ],
      [
        'Verification failed',
        (m) => [
          form(m, {
            code: '730514',
            verifyError: 'Unable to verify your email right now. Please try again.',
          }),
        ],
      ],
      [
        'Too many attempts',
        (m) => [
          form(m, { code: '730514', verifyError: 'Please wait one minute before trying again.' }),
        ],
      ],
      ['Sending code', (m) => [form(m, { sending: true })]],
      [
        'Code requested',
        (m) => [
          form(m, {
            cooldown: true,
            note: 'If the account needs verification, a new code has been requested. Check your inbox and spam folder.',
          }),
        ],
      ],
      [
        'Local delivery',
        (m) => [
          form(m, {
            cooldown: true,
            note: 'Local email delivery is disabled. Use the verification code in the API terminal.',
          }),
        ],
      ],
      [
        'Delivery unavailable',
        (m) => [
          form(m, {
            note: 'The verification email could not be sent. Please try again later or contact support.',
          }),
        ],
      ],
      [
        'Resend rate limited',
        (m) => [
          form(m, { cooldown: true, resendError: 'Please wait one minute before trying again.' }),
        ],
      ],
      [
        'Resend failed',
        (m) => [
          form(m, { resendError: 'Could not resend the verification email. Please try again.' }),
        ],
      ],
      ['Verified', (m) => [verified(m)]],
    ],
  )
}
