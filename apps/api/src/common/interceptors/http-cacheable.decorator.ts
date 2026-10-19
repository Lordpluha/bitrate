import { SetMetadata } from '@nestjs/common'

/** Metadata key `HttpCacheInterceptor` reads to decide whether to add conditional caching. */
export const HTTP_CACHEABLE_KEY = 'http:cacheable'

/**
 * Opts a GET route into `HttpCacheInterceptor`'s ETag and short `Cache-Control`. Use it only on
 * a public catalogue read whose body does not depend on the caller — never on a `/me` route.
 */
export const HttpCacheable = () => SetMetadata(HTTP_CACHEABLE_KEY, true)
