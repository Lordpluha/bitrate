// The other settings panels (views/SettingsView): Account (sign-in email with its verification icon,
// public handle, edit profile), Appearance (theme, density, motion; this browser only), Language (saved
// to the account), Notifications (the checkbox table per category) and the Danger zone with its dialog.
import { workspaceModal } from '../workspace/workspace-modal.mjs'

const CHANNELS = [
  ['Bitrate review', 'Submissions, approvals and requested changes', true],
  ['Delivery and release', 'Stores going live, failed deliveries and releases', false],
]

/** Settings panel builders bound to the screen helpers `ui`. */
export function settingsPanels(ui) {
  const { W, Tx, P, Row, Col, inline, Btn, Tile, Tabs, Field } = ui
  const modal = workspaceModal(ui)
  const account = (o = {}) =>
    Tile('Account', 'user-round', [
      Row({ name: 'Email', gap: 8, width: 'fill_container' }, [
        Col({ name: 'Label', gap: 2, width: 'fill_container' }, [
          P('Caption', 'Sign-in email'),
          P('Body', 'mira@nightsignal.fm'),
        ]),
        W(
          o.unverified ? 'Check/Pending' : 'Check/Done',
          { name: o.unverified ? 'Not verified' : 'Verified', width: 24 },
          { label: { enabled: false } },
        ),
      ]),
      Col({ name: 'Handle', gap: 2, width: 'fill_container' }, [
        P('Caption', 'Public handle'),
        Row({ name: 'Value', gap: 10 }, [
          Tx('Body', '@mirasol'),
          Tx('Link Underline', 'Edit profile'),
        ]),
      ]),
    ])
  const choice = (label, hint, options, active) =>
    Row({ name: label, width: 'fill_container', gap: 12, justifyContent: 'space_between' }, [
      Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
        Tx('Body Strong', label),
        P('Caption', hint),
      ]),
      Tabs(options, active),
    ])
  const appearance = () =>
    Tile('Appearance', 'palette', [
      choice('Theme', 'Colours of the workspace', ['Light', 'Dark', 'Dim'], 1),
      choice('Density', 'Compact fits more on screen', ['Comfortable', 'Compact'], 0),
      choice('Motion', 'Reduced turns animations off', ['System', 'Reduced'], 0),
      P('Caption', 'Saved in this browser only.'),
    ])
  const language = (o = {}) =>
    Tile('Language', 'globe', [
      Field('Interface language', 'English', 'Select'),
      o.failed
        ? P('Error', 'Changed on this device, but not saved to your account. Try again later.')
        : P('Caption', 'Saved to your account, so your other devices follow it.'),
    ])
  const cell = (node) => inline('Cell', [node])
  const notifications = (o = {}) =>
    Tile(
      'Notifications',
      'bell',
      o.loading
        ? [P('Muted', 'Loading notification settings…')]
        : o.error
          ? [
              P('Error', 'Could not load notification settings. Please try again.'),
              Btn('Try again', 'Compact Outline'),
            ]
          : [
              Row({ name: 'Head', width: 'fill_container', gap: 12 }, [
                Tx('Eyebrow', 'CATEGORY', { width: 'fill_container', textGrowth: 'fixed-width' }),
                ...['IN-APP', 'EMAIL', 'PUSH'].map((c) =>
                  Tx('Eyebrow', c, { width: 80, textGrowth: 'fixed-width', textAlign: 'center' }),
                ),
              ]),
              ...CHANNELS.map(([title, hint, on]) =>
                W(
                  'Row/Channels',
                  { name: `Channels / ${title}`, width: 'fill_container' },
                  {
                    title: { content: title },
                    hint: { content: hint },
                    inApp: cell(W(on ? 'Checkbox/Checked' : 'Checkbox', { name: 'In-app' })),
                    email: cell(Tx('Caption', 'Not sent yet')),
                    push: cell(Tx('Caption', 'Not sent yet')),
                  },
                ),
              ),
              o.saveError
                ? P('Error', 'Could not save notification settings. Please try again.')
                : P(
                    'Caption',
                    o.saving
                      ? 'Saving…'
                      : 'Switched-off categories leave the notification center. Anything that needs action still shows on your dashboard. Account and security emails are always sent.',
                  ),
            ],
    )
  const danger = () =>
    Tile('Danger zone', 'triangle-alert', [
      Tx('Body Strong', 'Delete account'),
      P('Muted', 'Removes your artist account from Bitrate and signs you out.'),
      Btn('Delete account', 'Danger'),
    ])
  const deleteDialog = (m, o = {}) =>
    modal(
      m,
      'Delete account',
      [
        P('Muted', 'This cannot be undone from the workspace. Type mirasol to confirm.'),
        Field('Your handle', o.typed ? 'mirasol' : ''),
      ],
      [
        Btn('Keep account', 'Ghost'),
        Btn(
          o.busy ? 'Deleting…' : 'Delete account',
          'Danger',
          null,
          o.typed ? {} : { opacity: 0.45 },
        ),
      ],
      460,
    )
  return { account, appearance, language, notifications, danger, deleteDialog }
}
