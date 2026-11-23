// Building blocks of the auth pages (features/login, registration, forgot/reset-password, verify-email):
// the auth card, fields, actions, social sign-in with its consent, alerts, password rules and toasts —
// each an artist-library instance with English copy from shared/i18n/messages/en.

const CONSENT =
  'I am at least 16 years old, I accept the Terms of Use, Community Guidelines and Artist Agreement, and I have read the Privacy Policy.'

/** Auth helpers bound to the screen helpers `ui`. */
export function authKit(ui) {
  const { W, Tx, Row, fill, inline } = ui
  const full = (name) => ({ name, width: 'fill_container' })
  const card = (m, title, desc, body) =>
    W(
      'Auth/Card',
      { name: 'Auth Card', width: m ? 'fill_container' : 440 },
      {
        title: title ? { content: title } : { enabled: false },
        desc: desc ? { content: desc } : { enabled: false },
        body: fill('Body', body.flat(), { gap: 14 }),
      },
    )
  const field = (kind) => (label, value, error, hint) =>
    W(error ? `Field/${kind} Error` : `Field/${kind}`, full(`Field / ${label}`), {
      label: { content: label },
      value: { content: value },
      ...(error ? { error: { content: error } } : {}),
      /* only the code field has a hint; without one it is switched off */
      ...(kind === 'Code' && !error ? { hint: hint ? { content: hint } : { enabled: false } } : {}),
    })
  const action = (variant) => (label, icon) =>
    W(`Button/${variant}`, full(`Button / ${label}`), {
      label: { content: label },
      icon: icon ? { icon } : { enabled: false },
    })
  const consent = (state, label = CONSENT) =>
    W(state ? `Check/Box ${state}` : 'Check/Box', full('Consent'), { label: { content: label } })
  const social = (unlocked = false) => [
    consent(unlocked ? 'Checked' : ''),
    W(unlocked ? 'Button/Google' : 'Button/Google Locked', full('Google')),
    W(unlocked ? 'Button/Facebook' : 'Button/Facebook Locked', full('Facebook')),
  ]
  const alert = (tone, text, act) =>
    W(`Alert/${tone}`, full(`Alert / ${text.slice(0, 24)}`), {
      title: { content: text },
      body: { enabled: false },
      action: act ? inline('Action', [act]) : { enabled: false },
    })
  const footnote = (text, link) =>
    Row({ name: 'Footnote', width: 'fill_container', gap: 6, justifyContent: 'center' }, [
      ...(text ? [Tx('Muted', text)] : []),
      Tx('Link', link),
    ])
  const rule = (met, label) =>
    W(
      met ? 'Rule/Met' : 'Rule/Unmet',
      { name: `Rule / ${label.slice(0, 20)}` },
      { label: { content: label } },
    )
  /* on a phone the toast spans the screen */
  const toast = (tone, text, m = false) =>
    W(
      `Toast/${tone}`,
      { name: `Toast / ${tone}`, ...(m ? { width: 'fill_container' } : {}) },
      { text: { content: text } },
    )
  return {
    card,
    input: field('Input'),
    password: field('Password'),
    code: field('Code'),
    primary: action('Large Primary'),
    ghost: action('Ghost'),
    secondary: action('Secondary'),
    or: () => W('Auth/Or', full('Or')),
    consent,
    social,
    alert,
    footnote,
    rule,
    toast,
  }
}
