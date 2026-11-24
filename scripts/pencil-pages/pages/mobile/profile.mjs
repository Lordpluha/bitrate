// Native app: Profile — account, theme and language preferences, log out.
import { Avatar, Button, Chips, Col, MHeader, Row, Tx } from '../../ui.mjs'
import { AppScreen, Scroller } from './shell.mjs'

const THEMES = ['System', 'Dark', 'Light', 'Neutral']
const LANGUAGES = ['Device language', 'English', 'Українська', 'Polski']

const setting = (label, options, active) =>
  Col({ name: label, gap: 10, width: 'fill_container' }, [
    Tx('H4', label),
    Scroller(`${label} Options`, [Chips(options, active)]),
  ])
const profile = (theme = 0) => [
  Row({ name: 'Account', width: 'fill_container', gap: 14 }, [
    Avatar('avatar1', 64),
    Col({ gap: 2, width: 'fill_container' }, [Tx('H3', 'maya'), Tx('Muted', 'maya@example.com')]),
  ]),
  setting('Theme', THEMES, theme),
  setting('Language', LANGUAGES, 0),
  Button('Log out', 'destructive', { width: 'fill_container', icon: 'log-out' }),
  Tx('Caption', 'Version 2.0.1'),
]
const screen = (name, theme) => AppScreen(name, profile(theme), { header: MHeader('Profile') })

export const profilePage = {
  profile: {
    title: 'Mobile / Profile',
    route: 'app /profile (pushed from the Home avatar)',
    context:
      'Profile: theme (System follows the OS; Neutral = dim) and language are device-local preferences; Log out ends the session.',
    mobile: () => screen('Profile', 0),
    extra: [['Theme set to Light / Mobile', () => screen('Light chosen', 2), 'Light']],
  },
}
