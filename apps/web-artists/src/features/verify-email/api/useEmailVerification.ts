import { apiBaseUrl } from '@shared/api'
import { messageKey } from '@shared/i18n'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

const deliverySchema = z.object({
  delivery: z.enum(['email', 'development', 'unavailable']),
})
/** The error a rate-limited request throws; the form starts its resend cooldown on it. */
export const RATE_LIMITED = messageKey('auth.verify.rateLimited')

type EmailVerification = { token: string } | { email: string; code: string }

type VerificationRequest =
  | { path: 'verify-email'; body: { token: string } }
  | { path: 'verify-email/code'; body: { email: string; code: string } }
  | { path: 'verify-email/resend'; body: { email: string } }

async function sendVerificationRequest(request: VerificationRequest) {
  const unavailable =
    request.path !== 'verify-email/resend'
      ? messageKey('auth.verify.verifyFailed')
      : messageKey('auth.verify.resendFailed')
  let response: Response
  try {
    response = await fetch(
      `${apiBaseUrl}/api/v1/artists/auth/${request.path}`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body),
        signal: AbortSignal.timeout(8_000),
      },
    )
  } catch {
    throw new Error(unavailable)
  }
  if (!response.ok) {
    throw new Error(
      response.status === 429
        ? RATE_LIMITED
        : request.path !== 'verify-email/resend' && response.status === 400
          ? request.path === 'verify-email/code'
            ? messageKey('auth.verify.codeInvalid')
            : messageKey('auth.verify.linkInvalid')
          : unavailable,
    )
  }
  if (request.path === 'verify-email/resend') {
    const result = deliverySchema.safeParse(
      await response.json().catch(() => undefined),
    )
    if (!result.success) throw new Error(unavailable)
    return result.data.delivery
  }
}

export function useEmailVerification() {
  const verify = useMutation({
    mutationFn: (body: EmailVerification) =>
      sendVerificationRequest(
        'token' in body
          ? { path: 'verify-email', body }
          : { path: 'verify-email/code', body },
      ),
  })
  const resend = useMutation({
    mutationFn: (email: string) =>
      sendVerificationRequest({ path: 'verify-email/resend', body: { email } }),
  })
  return { verify, resend }
}
