import type { LandingKey } from './messages/en'

/**
 * The landing's scenes in order: their DOM id (also the URL hash) and the label key for dots.
 * The order argues for signing up: the listening loop and "any device" first, then the library
 * and friends, settings, who builds it, and the questions answered right before the last ask.
 */
export const LANDING_SCENES = [
  { id: 'hero', label: 'scene.hero' },
  { id: 'loop', label: 'scene.loop' },
  { id: 'devices', label: 'scene.devices' },
  { id: 'library', label: 'scene.library' },
  { id: 'social', label: 'scene.social' },
  { id: 'rules', label: 'scene.rules' },
  { id: 'team', label: 'scene.team' },
  { id: 'partners', label: 'scene.partners' },
  { id: 'faq', label: 'scene.faq' },
  { id: 'cta', label: 'scene.cta' },
] as const satisfies readonly { id: string; label: LandingKey }[]

/** A scene's DOM id. */
export type SceneId = (typeof LANDING_SCENES)[number]['id']

/** Narrows a DOM id to a known scene. */
export const isSceneId = (id: string): id is SceneId =>
  LANDING_SCENES.some((scene) => scene.id === id)
