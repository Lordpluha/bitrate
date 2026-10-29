import { auth } from './auth'
import { common } from './common'
import { labels } from './labels'
import { music } from './music'
import { settings } from './settings'
import { shell } from './shell'
import { workspace } from './workspace'

/** The source catalog. Each workspace area keeps its keys in its own file, merged here. */
export const en = {
  ...auth,
  ...common,
  ...labels,
  ...music,
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
