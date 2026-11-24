import type { ApiSchemas } from '@bitrate/contracts'

import { api } from '@/lib/api/client'
import { ensureOk } from '@/lib/api/ensure-ok'

export type ResetPasswordInput = ApiSchemas['ResetPasswordDto']

/** `POST /auth/reset-password` with the token from the emailed link. */
export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const { response } = await api.POST('/api/v1/auth/reset-password', { body: input })
  ensureOk(response, 'Unable to reset the password')
}
