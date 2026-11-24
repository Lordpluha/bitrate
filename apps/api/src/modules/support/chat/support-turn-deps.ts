import type { Locale } from '@bitrate/support-core'
import type { SupportBudget } from './support-budget'
import type { SupportResponder } from './support-responder'
import type { SupportTurnStore } from './support-turn-store'

export const SUPPORT_TURN_DEPS = Symbol('SUPPORT_TURN_DEPS')

/** A turn's collaborators; `support-turn-deps.provider.ts` wires them, tests pass fakes. */
export interface SupportTurnDeps {
  store: SupportTurnStore
  budget: SupportBudget
  /** Absent when no chat model, embedding key or Qdrant is configured. */
  responder: SupportResponder | undefined
  /** The fixed handoff message in the user's language. */
  handoffText(locale: Locale): Promise<string>
  /** Input plus output tokens one conversation may spend before it goes to a person. */
  conversationTokenCap: number
}
