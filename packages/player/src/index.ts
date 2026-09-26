/**
 * Default entry — registers `<bitrate-player>` as an import side effect. Guarded for SSR and
 * double registration; see `src/element/index.ts`.
 */
export { BITRATE_PLAYER_TAG_NAME, defineBitratePlayer } from './element'
