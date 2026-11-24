import type { ApiSchemas } from '@bitrate/contracts'

import { api } from '@/lib/api/client'
import { ensureOk } from '@/lib/api/ensure-ok'

export type LogInInput = ApiSchemas['UserLoginDto']

/** Either the cookies are set, or the account needs its second factor first. */
export type LogInResult = { kind: 'signed-in' } | { kind: 'two-factor'; pendingToken: string }

/** `POST /auth/login`. Throws `ApiRequestError` (401 = wrong credentials, 429 = rate limited). */
export async function logIn(input: LogInInput): Promise<LogInResult> {
  const { data, response } = await api.POST('/api/v1/auth/login', { body: input })
  ensureOk(response, 'Sign-in failed')
  if (data?.requires2fa && data.pendingToken) {
    return { kind: 'two-factor', pendingToken: data.pendingToken }
  }
  return { kind: 'signed-in' }
}
