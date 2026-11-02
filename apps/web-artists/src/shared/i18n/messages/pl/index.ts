import type { Messages } from '../en'
import { auth } from './auth'
import { common } from './common'
import { labels } from './labels'
import { music } from './music'
import { release } from './release'
import { settings } from './settings'
import { shell } from './shell'
import { workspace } from './workspace'

export const pl = {
  ...auth,
  ...common,
  ...labels,
  ...music,
  ...release,
  ...settings,
  ...shell,
  ...workspace,
} satisfies Messages
