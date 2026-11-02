import type { Messages } from '../en'
import { auth } from './auth'
import { common } from './common'
import { settings } from './settings'
import { shell } from './shell'

export const uk = {
  ...auth,
  ...common,
  ...settings,
  ...shell,
} satisfies Messages
