import { messageKey, type TranslationKey } from '@shared/i18n'
import { z } from 'zod'

const errorBodySchema = z.object({ code: z.string() })

/** Server codes the promotion catalog translates; anything else falls back to the caller's key. */
const isPromotionCode = (code: string) =>
  code.startsWith('errors.promotion.') ||
  code.startsWith('validation.promotion.')

/**
 * Turns a promotion API response into its data or a thrown catalog key. The server's own
 * message key wins when it is a promotion one (quota used, no date, step changed …).
 */
export function readPromotion<T>(
  result: { response: Response; data?: unknown; error?: unknown },
  schema: z.ZodType<T>,
  fallback: TranslationKey,
): T {
  if (!result.response.ok) {
    const body = errorBodySchema.safeParse(result.error)
    if (body.success && isPromotionCode(body.data.code))
      throw new Error(body.data.code)
    if (result.response.status === 403)
      throw new Error(messageKey('promotion.error.disabled'))
    throw new Error(messageKey(fallback))
  }
  const parsed = schema.safeParse(result.data)
  if (!parsed.success) throw new Error(messageKey(fallback))
  return parsed.data
}

/** A release without a plan answers 404 with this code; any other 404 is a real error. */
export const isPlanNotFound = (error: unknown) => {
  const body = errorBodySchema.safeParse(error)
  return body.success && body.data.code === 'errors.promotion.plan_not_found'
}
