import type { ConfigModuleOptions } from '@nestjs/config'
import { envSchema } from '../../../env.schema'
import { appConfigs } from './index'

/** `ConfigModule.forRoot()` options shared by the API and the standalone transcode worker. */
export const appConfigModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: ['.env', '.env.local', '.env.production', '.env.development'],
  load: appConfigs,
  validate: (env) => envSchema.parse(env),
}
