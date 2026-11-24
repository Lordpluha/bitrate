import type { Messages } from '../en'
import { plAuth } from './auth'
import { plCommon } from './common'
import { plListen } from './listen'
import { plPlayer } from './player'

export const pl: Messages = { ...plCommon, ...plAuth, ...plListen, ...plPlayer }
