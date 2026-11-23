// Artist / Registration (features/registration): two steps on one card — the email (checked for
// availability before advancing) with social sign-up, then the password with its live rules and the two
// consents. States: email errors, address taken, password rules, consent errors, submitting, failure.
import { authKit } from './auth-kit.mjs'
import { publicSpec } from './spec.mjs'

const TITLE = 'Sign up and immerse yourself in music'
const LEGAL =
  'I am at least 16 years old, I accept the Terms of Use and Community Guidelines, and I have read the Privacy Policy.'
const AGREEMENT = 'I accept the Artist Agreement.'
const RULES = ['1 letter', '1 number or special symbol (for example, # ? ! &)', '10 characters']

/** The registration page spec. */
export function registrationPage(ui, frames) {
  const { W, Tx, Col, Row } = ui
  const a = authKit(ui)
  const emailStep = (m, o = {}) =>
    a.card(m, TITLE, null, [
      a.input('Email Address', o.email ?? 'example@gmail.com', o.error),
      a.primary('Continue'),
      a.or(),
      a.social(false),
      a.footnote('Already have an account?', 'Log in.'),
    ])
  const passwordStep = (m, o = {}) => {
    const met = o.met ?? [true, true, false]
    return a.card(m, null, null, [
      W('Progress', { name: 'Step Progress' }, { bar: { width: m ? 139 : 180 } }),
      Row({ name: 'Step Head', width: 'fill_container', gap: 12, alignItems: 'start' }, [
        W('Button/Icon', { name: 'Back to email step' }, { icon: { icon: 'arrow-left' } }),
        Col({ name: 'Step', gap: 2 }, [Tx('Muted', 'Step 2 of 2'), Tx('H2', 'Create a password')]),
      ]),
      a.password('Password', o.password ?? '••••••••', o.passwordError),
      Col({ name: 'Rules', gap: 8, width: 'fill_container' }, [
        Tx('Body Strong', 'Password must contain at least:'),
        ...RULES.map((r, i) => a.rule(met[i], r)),
      ]),
      a.consent(o.consentError ? 'Error' : o.checked ? 'Checked' : '', LEGAL),
      ...(o.consentError
        ? [
            W(
              'Field/Error',
              { name: 'Legal Error' },
              { text: { content: 'You must accept the Terms of Use and Community Guidelines' } },
            ),
          ]
        : []),
      a.consent(o.consentError ? 'Error' : o.checked ? 'Checked' : '', AGREEMENT),
      ...(o.consentError
        ? [
            W(
              'Field/Error',
              { name: 'Agreement Error' },
              { text: { content: 'You must accept the Artist Agreement' } },
            ),
          ]
        : []),
      a.primary(o.busy ? 'Creating account...' : 'Continue', o.busy ? 'loader-circle' : null),
    ])
  }
  const toastAbove = (tone, text, node) => (m) => [a.toast(tone, text, m), node(m)]
  return publicSpec(
    frames,
    {
      title: 'Artist / Registration',
      route: '/registration',
      context:
        'Two-step sign-up. Step 1 checks the address is free before asking for a password; social sign-up stays locked until the consent is ticked. Success goes to /verify-email.',
    },
    (m) => [emailStep(m)],
    [
      ['Email filled', (m) => [emailStep(m, { email: 'mira@nightsignal.fm' })]],
      [
        'Email invalid',
        (m) => [
          emailStep(m, { email: 'mira@nightsignal', error: 'Please enter a valid email address' }),
        ],
      ],
      [
        'Email taken',
        (m) => [
          emailStep(m, {
            email: 'mira@nightsignal.fm',
            error: 'This email is already registered. Please log in instead.',
          }),
        ],
      ],
      [
        'Email check failed',
        (m) => [
          emailStep(m, {
            email: 'mira@nightsignal.fm',
            error: 'Unable to verify this email right now',
          }),
        ],
      ],
      ['Password step', (m) => [passwordStep(m)]],
      [
        'Password empty',
        (m) => [passwordStep(m, { password: 'Password', met: [false, false, false] })],
      ],
      [
        'Password too short',
        (m) => [
          passwordStep(m, {
            password: '••••••',
            met: [true, true, false],
            passwordError: 'Password must be at least 10 characters',
          }),
        ],
      ],
      [
        'Consent missing',
        (m) => [
          passwordStep(m, {
            password: '••••••••••••',
            met: [true, true, true],
            consentError: true,
          }),
        ],
      ],
      [
        'Ready',
        (m) => [
          passwordStep(m, { password: '••••••••••••', met: [true, true, true], checked: true }),
        ],
      ],
      [
        'Submitting',
        (m) => [
          passwordStep(m, {
            password: '••••••••••••',
            met: [true, true, true],
            checked: true,
            busy: true,
          }),
        ],
      ],
      [
        'Registration failed',
        toastAbove('Error', 'Registration failed', (m) =>
          passwordStep(m, { password: '••••••••••••', met: [true, true, true], checked: true }),
        ),
      ],
    ],
  )
}
