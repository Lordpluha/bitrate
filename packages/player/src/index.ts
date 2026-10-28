/**
 * Default entry — registers `<bitrate-player>` and its part elements as an import side effect.
 * Guarded for SSR and double registration; see `src/element/index.ts`.
 */
export { BITRATE_PLAYER_PART_TAG } from './contract'
export { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } from './element'
