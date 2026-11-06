/**
 * Tracks public API. Subdomains: catalog/ (listing, likes), ingest/ (masters, release tracks),
 * processing/ (conversion; also loaded by the worker), playback/ (sessions, CMAF delivery),
 * shared/ (audio storage helpers). The worker must import `@modules/tracks/processing`, never
 * this barrel, because it pulls in the HTTP controllers.
 */
export * from './catalog'
export * from './dtos'
export * from './entities'
export * from './ingest'
export * from './playback'
export * from './tracks.module'
export * from './tracks-core.module'
