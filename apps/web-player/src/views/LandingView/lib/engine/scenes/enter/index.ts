import { enterDevices } from './devices'
import { enterHero } from './hero'
import { enterRules } from './rules'
import { enterTeam } from './team'
import type { SceneEnterRegistry } from './types'

export type { SceneEnterEnv, SceneEnterRegistry } from './types'

/**
 * Each scene's own entrance beats, on top of the shared letters/windows entrance. Scenes that
 * show the player's real blocks get only the shared entrance: their contents are live.
 */
export const SCENE_ENTER: SceneEnterRegistry = {
  hero: enterHero,
  rules: enterRules,
  devices: enterDevices,
  team: enterTeam,
}
