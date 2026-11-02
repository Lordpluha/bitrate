import type { Messages } from '../en'
import { auth } from './auth'
import { common } from './common'
import { editRelease } from './editRelease'
import { labels } from './labels'
import { media } from './media'
import { music } from './music'
import { publish } from './publish'
import { release } from './release'
import { releaseErrors } from './releaseErrors'
import { settings } from './settings'
import { shell } from './shell'
import { workspace } from './workspace'

export const pl = {
  ...auth,
  ...common,
  ...editRelease,
  ...labels,
  ...media,
  ...music,
  ...publish,
  ...release,
  ...releaseErrors,
  ...settings,
  ...shell,
  ...workspace,
} satisfies Messages
