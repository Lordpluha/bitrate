import type { PlatformStats } from '../../model/platformStats'

/** Props a scene may need from the page: whether the visitor is signed in. */
export type SceneProps = { signedIn: boolean }

/** The hero also shows the platform's public totals, when the API gave them. */
export type HeroSceneProps = SceneProps & { stats: PlatformStats | null }
