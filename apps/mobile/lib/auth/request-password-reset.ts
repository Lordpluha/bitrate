import type { ApiSchemas } from '@bitrate/contracts'

import { api } from '@/lib/api/client'
import { ensureOk } from '@/lib/api/ensure-ok'

export type RequestPasswordResetInput = ApiSchemas['UserForgotPasswordDto']

/** `POST /auth/forgot-password`. Succeeds whether or not the email has an account. */
export async function requestPasswordReset(input: RequestPasswordResetInput): Promise<void> {
  const { response } = await api.POST('/api/v1/auth/forgot-password', { body: input })
  ensureOk(response, 'Unable to request a password reset')
}
