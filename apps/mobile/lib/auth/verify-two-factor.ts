import type { ApiSchemas } from '@bitrate/contracts'

import { api } from '@/lib/api/client'
import { ensureOk } from '@/lib/api/ensure-ok'

export type VerifyTwoFactorInput = ApiSchemas['TwoFactorVerifyLoginDto']

/** `POST /auth/2fa/verify-login`: trades the pending token and a TOTP code for session cookies. */
export async function verifyTwoFactor(input: VerifyTwoFactorInput): Promise<void> {
  const { response } = await api.POST('/api/v1/auth/2fa/verify-login', { body: input })
  ensureOk(response, 'Invalid or expired 2FA code')
}
