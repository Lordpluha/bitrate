import type { gsap } from 'gsap'
import type { SceneId } from '../../../../model/scenes'
import type { EngineContext } from '../../context'

/** What a scene's entrance builds on: its timeline (shared beats already added) and helpers. */
export type SceneEnterEnv = {
  tl: gsap.core.Timeline
  scene: HTMLElement
  /** `querySelectorAll` inside the scene. */
  q: (selector: string) => NodeListOf<Element>
  /** Single-column phone layout: the 3D-ish moves are skipped. */
  mob: boolean
  copy: EngineContext['copy']
  /** Keeps an endless animation running until the scene is left. */
  loop: (animation: gsap.core.Animation) => void
}

/** A scene's own entrance, added to the shared one. */
export type SceneEnter = (env: SceneEnterEnv) => void

/** Entrances per scene; scenes without one only get the shared entrance. */
export type SceneEnterRegistry = Partial<Record<SceneId, SceneEnter>>
