import { RequestMethod } from '@nestjs/common'

/**
 * Global-prefix options that keep the public image route at `/static/<folder>/<file>`, outside
 * the `/api` prefix, exactly where the filesystem `ServeStaticModule` mount it replaces served it.
 * The route also opts out of URI versioning (`VERSION_NEUTRAL`), so clients' stored
 * `/static/...` values and the web apps' URL builders keep working unchanged.
 */
export const STATIC_ASSETS_GLOBAL_PREFIX_OPTIONS = {
  exclude: [{ path: 'static/*path', method: RequestMethod.GET }],
}
