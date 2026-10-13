import type { LandingKey } from './messages/en'

/** The landing's scenes in order: their DOM id (also the URL hash) and the label key for dots. */
export const LANDING_SCENES = [
  { id: 'hero', label: 'scene.hero' },
  { id: 'loop', label: 'scene.loop' },
  { id: 'workshop', label: 'scene.workshop' },
  { id: 'rules', label: 'scene.rules' },
  { id: 'library', label: 'scene.library' },
  { id: 'discover', label: 'scene.discover' },
  { id: 'devices', label: 'scene.devices' },
  { id: 'social', label: 'scene.social' },
  { id: 'partners', label: 'scene.partners' },
  { id: 'team', label: 'scene.team' },
  { id: 'cta', label: 'scene.cta' },
] as const satisfies readonly { id: string; label: LandingKey }[]
