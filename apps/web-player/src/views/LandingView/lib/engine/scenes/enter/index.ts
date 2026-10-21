import { enterDevices } from './devices'
import { enterDiscover } from './discover'
import { enterHero } from './hero'
import { enterLibrary } from './library'
import { enterLoop } from './loop'
import { enterRules } from './rules'
import { enterSocial } from './social'
import { enterTeam } from './team'
import type { SceneEnterRegistry } from './types'
import { enterWorkshop } from './workshop'

export type { SceneEnterEnv, SceneEnterRegistry } from './types'
export { mountWorkshopShuffle } from './workshop'

/** Each scene's own entrance beats, on top of the shared letters/windows entrance. */
export const SCENE_ENTER: SceneEnterRegistry = {
  hero: enterHero,
  loop: enterLoop,
  workshop: enterWorkshop,
  rules: enterRules,
  library: enterLibrary,
  discover: enterDiscover,
  devices: enterDevices,
  team: enterTeam,
  social: enterSocial,
}
