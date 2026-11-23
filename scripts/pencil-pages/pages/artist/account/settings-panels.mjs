// The other settings panels (views/SettingsView): Account (sign-in email verified or not, public
// handle, edit profile), Appearance (theme, density, motion; this browser only), Language (saved to
// the account), Notifications (channels per category) and the Danger zone with its delete dialog.
import { workspaceModal } from '../workspace/workspace-modal.mjs'

const CHANNELS = [
  ['Bitrate review', 'Submissions, approvals and requested changes'],
  ['Delivery and release', 'Stores going live, failed deliveries and releases'],
]

/** Settings panel builders bound to the screen helpers `ui`. */
export function settingsPanels(ui) {
  const { W, Tx, P, Row, Col, inline, Btn, Tile, KV, St, Tabs, Field } = ui
  const modal = workspaceModal(ui)
  const account = (o = {}) =>
    Tile('Account', 'user-round', [
      KV(
        'Sign-in email',
        St(o.unverified ? 'Warning' : 'Ready', o.unverified ? 'Not verified' : 'Verified'),
      ),
      P('Body', 'mira@nightsignal.fm'),
      KV('Public handle', '@mirasol'),
      Tx('Link', 'Edit profile'),
    ])
  const choice = (label, hint, options, active) =>
    Row({ name: label, width: 'fill_container', gap: 12, justifyContent: 'space_between' }, [
      Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
        Tx('Body Strong', label),
        P('Caption', hint),
      ]),
      Tabs(options, active),
    ])
  const appearance = (theme = 1) =>
    Tile('Appearance', 'palette', [
      choice('Theme', 'Colours of the workspace', ['Light', 'Dark', 'Dim'], theme),
      choice('Density', 'Compact fits more on screen', ['Comfortable', 'Compact'], 0),
      choice('Motion', 'Reduced turns animations off', ['System', 'Reduced'], 0),
      P('Caption', 'Saved in this browser only.'),
    ])
  const language = (o = {}) =>
    Tile('Language', 'languages', [
      Field('Interface language', 'English', 'Select'),
      o.failed
        ? P('Error', 'Changed on this device, but not saved to your account. Try again later.')
        : P('Caption', 'Saved to your account, so your other devices follow it.'),
    ])
  const toggle = (on) => W(on ? 'Toggle/On' : 'Toggle/Off', { name: on ? 'On' : 'Off' })
  const notifications = (o = {}) =>
    Tile(
      'Notifications',
      'bell',
      o.loading
        ? [
            P('Muted', 'Loading notification settings…'),
            W('Skeleton/Row', { name: 'Skeleton', width: 'fill_container' }),
          ]
        : o.error
          ? [
              P('Error', 'Could not load notification settings. Please try again.'),
              Btn('Try again', 'Compact Outline', 'refresh-cw'),
            ]
          : [
              Row({ name: 'Channels', width: 'fill_container', gap: 12 }, [
                Tx('Eyebrow', 'CATEGORY', { width: 'fill_container', textGrowth: 'fixed-width' }),
                ...['IN-APP', 'EMAIL', 'PUSH'].map((c) =>
                  Tx('Eyebrow', c, { width: 80, textGrowth: 'fixed-width', textAlign: 'center' }),
                ),
              ]),
              ...CHANNELS.map(([title, hint], i) =>
                W(
                  'Row/Channels',
                  { name: `Channels / ${title}`, width: 'fill_container' },
                  {
                    title: { content: title },
                    hint: { content: hint },
                    inApp: inline('In-app', [toggle(true)]),
                    email: inline('Email', [toggle(i === 0)]),
                    push: inline('Push', [Tx('Caption', 'Not sent yet')]),
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
      Btn('Delete account', 'Danger', 'trash-2'),
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
          o.busy ? 'loader-circle' : 'trash-2',
          o.typed ? {} : { opacity: 0.45 },
        ),
      ],
      460,
    )
  return { account, appearance, language, notifications, danger, deleteDialog }
}
