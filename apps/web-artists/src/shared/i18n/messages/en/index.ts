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

/** The source catalog. Each workspace area keeps its keys in its own file, merged here. */
export const en = {
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
} as const

export type TranslationKey = keyof typeof en

/** A key with plural forms: every `<base>.other` entry in the English catalog. */
export type PluralBase = {
  [Key in TranslationKey]: Key extends `${infer Base}.other` ? Base : never
}[TranslationKey]

type PluralKey = `${PluralBase}.${Intl.LDMLPluralRule}`

/**
 * A locale catalog: every English key, plus the extra plural forms (`.few`, `.many`)
 * a language needs beyond English's `.one` and `.other`.
 */
export type Messages = Record<TranslationKey, string> &
  Partial<Record<PluralKey, string>>
