import { ASSISTANT } from './rules/assistant'
import { CHROME } from './rules/chrome'
import { CURSOR } from './rules/cursor'
import { FOOTER_LINKS } from './rules/footer'
import { GLITCH } from './rules/glitch'
import { HEALTH } from './rules/health'
import { HEALTH_STATES } from './rules/healthStates'
import { INTRO } from './rules/intro'
import { LATE } from './rules/late'
import { MOBILE } from './rules/mobile'
import { PHYSICS } from './rules/physics'
import { PRIMITIVES } from './rules/primitives'
import { SCENES } from './rules/scenes'
import { TOKENS } from './rules/tokens'
import type { LandingRule } from './rules/types'

/**
 * The landing's styles as Tailwind utilities, in cascade order: each entry adds utilities to
 * elements carrying that marker class (or `#id`). `lc()` merges the entries an element matches,
 * so later entries win exactly as later CSS rules did. Context selectors are arbitrary variants.
 * The groups are concatenated in that cascade order: moving one changes the styles.
 */
export const LANDING_RULES: readonly LandingRule[] = [
  ...TOKENS,
  ...CHROME,
  ...PRIMITIVES,
  ...SCENES,
  ...GLITCH,
  ...PHYSICS,
  ...ASSISTANT,
  ...INTRO,
  ...FOOTER_LINKS,
  ...HEALTH,
  ...MOBILE,
  ...CURSOR,
  ...HEALTH_STATES,
  ...LATE,
]
