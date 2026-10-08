import { getArtistApiUrl } from '@shared/auth/artistApiUrl'
import { createServerFn } from '@tanstack/react-start'
import {
  getCookie,
  getResponseHeaders,
  setResponseHeader,
} from '@tanstack/react-start/server'
import { twoFactorFormSchema } from '../validation/TwoFactorForm.validation'

type TwoFactorLoginResult =
  | { success: true }
  | { success: false; message: string }

/** The pending token stays httpOnly; only the code and a result cross the server-function boundary. */
export const verifyTwoFactorLogin = createServerFn({ method: 'POST' })
  .validator(twoFactorFormSchema)
  .handler(async ({ data }): Promise<TwoFactorLoginResult> => {
    setResponseHeader('Cache-Control', 'private, no-store')
    const pendingToken = getCookie('pending_2fa_token')
    if (!pendingToken) {
      return {
        success: false,
        message: 'Your sign-in attempt expired. Go back and sign in again.',
      }
    }

    try {
      const response = await fetch(
        new URL('/api/v1/artists/auth/2fa/verify-login', getArtistApiUrl()),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pendingToken, code: data.code }),
          cache: 'no-store',
          redirect: 'error',
          signal: AbortSignal.timeout(8_000),
        },
      )
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          message: 'Invalid or expired code. Please try again.',
        }
      }
      if (response.ok) {
        const headers = getResponseHeaders()
        for (const cookie of response.headers.getSetCookie())
          headers.append('Set-Cookie', cookie)
        return { success: true }
      }
    } catch {
      // Keep credentials and upstream error details out of the client response.
    }
    return {
      success: false,
      message: 'Could not verify your code. Please try again.',
    }
  })
