import type { ApiSchemas } from '@bitrate/contracts'

import { api } from '@/lib/api/client'
import { ensureOk } from '@/lib/api/ensure-ok'

export type RegisterInput = ApiSchemas['RegistrationDto']

/** `POST /auth/registration`. The account must confirm its email before it can sign in. */
export async function register(input: RegisterInput): Promise<void> {
  const { response } = await api.POST('/api/v1/auth/registration', { body: input })
  ensureOk(response, 'Unable to create account')
}
