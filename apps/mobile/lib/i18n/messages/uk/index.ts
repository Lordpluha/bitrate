import type { Messages } from '../en'
import { ukAuth } from './auth'
import { ukCommon } from './common'
import { ukListen } from './listen'
import { ukPlayer } from './player'

export const uk: Messages = { ...ukCommon, ...ukAuth, ...ukListen, ...ukPlayer }
