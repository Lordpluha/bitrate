import type { Messages } from '../en'
import { auth } from './auth'
import { common } from './common'
import { labels } from './labels'
import { music } from './music'
import { settings } from './settings'
import { shell } from './shell'
import { workspace } from './workspace'

export const uk = {
  ...auth,
  ...common,
  ...labels,
  ...music,
  ...settings,
  ...shell,
  ...workspace,
} satisfies Messages
