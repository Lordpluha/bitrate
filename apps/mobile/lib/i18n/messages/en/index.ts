import { enAuth } from './auth'
import { enCommon } from './common'
import { enListen } from './listen'
import { enPlayer } from './player'

/** The source catalog: every other locale must provide the same keys. */
export const en = { ...enCommon, ...enAuth, ...enListen, ...enPlayer }

export type TranslationKey = keyof typeof en
export type Messages = Record<TranslationKey, string>
