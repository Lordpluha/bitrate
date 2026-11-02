import type { Messages } from '../en'
import { account } from './account'
import { analytics } from './analytics'
import { auth } from './auth'
import { common } from './common'
import { dashboard } from './dashboard'
import { delivery } from './delivery'
import { editRelease } from './editRelease'
import { labels } from './labels'
import { landing } from './landing'
import { media } from './media'
import { music } from './music'
import { notifications } from './notifications'
import { profile } from './profile'
import { publish } from './publish'
import { release } from './release'
import { releaseErrors } from './releaseErrors'
import { settings } from './settings'
import { shell } from './shell'
import { workspace } from './workspace'

export const pl = {
  ...account,
  ...analytics,
  ...auth,
  ...common,
  ...dashboard,
  ...delivery,
  ...editRelease,
  ...labels,
  ...landing,
  ...media,
  ...music,
  ...notifications,
  ...profile,
  ...publish,
  ...release,
  ...releaseErrors,
  ...settings,
  ...shell,
  ...workspace,
} satisfies Messages
