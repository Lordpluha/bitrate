import { apiBaseUrl } from '@shared/api'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

const deliverySchema = z.object({
  delivery: z.enum(['email', 'development', 'unavailable']),
})
type EmailVerification = { token: string } | { email: string; code: string }

type VerificationRequest =
  | { path: 'verify-email'; body: { token: string } }
  | { path: 'verify-email/code'; body: { email: string; code: string } }
  | { path: 'verify-email/resend'; body: { email: string } }

async function sendVerificationRequest(request: VerificationRequest) {
  const unavailable =
    request.path !== 'verify-email/resend'
      ? 'Unable to verify your email right now. Please try again.'
      : 'Could not resend the verification email. Please try again.'
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
        ? 'Please wait one minute before trying again.'
        : request.path !== 'verify-email/resend' && response.status === 400
          ? request.path === 'verify-email/code'
            ? 'This code is invalid or expired. Request a new code if needed.'
            : 'This verification link is invalid or expired.'
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
