/*
 * Policy of the support chat, sized for the $10/month budget agreed in #567: one Haiku 5.5
 * turn costs about $0.0008, so the budget covers roughly 12,000 answers a month.
 */

/** Longest user message; longer text is rejected before any model call. */
export const MAX_SUPPORT_MESSAGE_CHARS = 2_000

/** Earlier messages sent to the model with each turn. */
export const SUPPORT_HISTORY_MESSAGES = 20

/** Model tokens one conversation may use (about 30 turns) before it goes to a person. */
export const SUPPORT_CONVERSATION_TOKEN_CAP = 150_000

/** A turn holds its conversation's lock at most this long, even if the process dies. */
export const SUPPORT_TURN_LOCK_SECONDS = 120

/** Per-IP request limits; the per-conversation allowance and the budget sit behind them. */
export const SUPPORT_CREATE_THROTTLE = { default: { ttl: 60_000, limit: 10 } }
export const SUPPORT_MESSAGE_THROTTLE = { default: { ttl: 60_000, limit: 20 } }

/** Messages one messenger contact may send a minute; the next one gets a notice, later ones are dropped. */
export const SUPPORT_CONTACT_MESSAGES_PER_MINUTE = 20
