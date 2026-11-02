import type { Messages } from '../en'
import { analytics } from './analytics'
import { auth } from './auth'
import { common } from './common'
import { dashboard } from './dashboard'
import { delivery } from './delivery'
import { editRelease } from './editRelease'
import { labels } from './labels'
import { media } from './media'
import { music } from './music'
import { notifications } from './notifications'
import { publish } from './publish'
import { release } from './release'
import { releaseErrors } from './releaseErrors'
import { settings } from './settings'
import { shell } from './shell'
import { workspace } from './workspace'

export const uk = {
  ...analytics,
  ...auth,
  ...common,
  ...dashboard,
  ...delivery,
  ...editRelease,
  ...labels,
  ...media,
  ...music,
  ...notifications,
  ...publish,
  ...release,
  ...releaseErrors,
  ...settings,
  ...shell,
  ...workspace,
} satisfies Messages
