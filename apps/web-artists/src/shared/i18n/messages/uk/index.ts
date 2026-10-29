import type { Messages } from '../en'
import { common } from './common'
import { settings } from './settings'

export const uk = {
  ...common,
  ...settings,
} satisfies Messages
