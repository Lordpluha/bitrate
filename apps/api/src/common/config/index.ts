import type { ConfigType } from '@nestjs/config'
import type { envType } from '../../../env.schema'
import { connectionsConfig } from './connections'
import { cookieConfig } from './cookie.config'
import { mailConfig } from './mail.config'
import { s3Config } from './s3.config'
import { webConfig } from './web.config'

export { API_RATE_LIMITS, AUTH_ROUTE_THROTTLE, SESSION_ROUTE_THROTTLE } from './rate-limit.config'

/** The app configs value. */
export const appConfigs = [cookieConfig, connectionsConfig, mailConfig, s3Config, webConfig]

/** Defines the app config. */
export type AppConfig = envType & {
  [cookieConfig.KEY]: ConfigType<typeof cookieConfig>
  [connectionsConfig.KEY]: ConfigType<typeof connectionsConfig>
  [mailConfig.KEY]: ConfigType<typeof mailConfig>
  [s3Config.KEY]: ConfigType<typeof s3Config>
  [webConfig.KEY]: ConfigType<typeof webConfig>
}
