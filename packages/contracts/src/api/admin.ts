import type { components, paths } from './admin-v1'

/**
 * The operator API's contract (#458), imported as `@bitrate/contracts/admin`. Deliberately not
 * re-exported from the package root, so the player and artist apps never see operator types.
 */
export type ApiPaths = paths
export type ApiSchemas = components['schemas']
