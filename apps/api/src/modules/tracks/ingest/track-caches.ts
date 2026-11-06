import { NS } from '@infra/cache/cache.constants'
import type { CacheService } from '@infra/cache/cache.service'

/** Drops the caches that any created, edited, published or hidden track invalidates. */
export async function invalidateTrackCaches(cache: CacheService): Promise<void> {
  await Promise.all([cache.invalidate(NS.TRACKS), cache.invalidate(NS.SEARCH)])
}
