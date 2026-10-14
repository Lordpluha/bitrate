'use client'

import { Button } from '@bitrate/ui-react'
import { clientFetchClient } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { ROUTES } from '@shared/routes'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { AuthHeading } from './AuthHeading'
import { OTP_LENGTH, OtpCodeField } from './OtpCodeField'

/**
 * The API contract still requires a body token, while the real pending token is
 * supplied by the backend through the HTTP-only pending_2fa_token cookie.
 */
const HTTP_ONLY_PENDING_TOKEN_PLACEHOLDER =
  'pending-token-from-http-only-cookie'

type VerifyStatus = 'idle' | 'verifying' | 'error' | 'success'

const HINTS = {
  error: 'Invalid or expired 2FA code',
  success: 'Code verified — signing you in…',
} as const

export const TwoFactorLoginForm = () => {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<VerifyStatus>('idle')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (code.length !== OTP_LENGTH) {
      setStatus('error')
      return
    }

    setStatus('verifying')
    try {
      const { response } = await clientFetchClient.POST(
        '/api/v1/auth/2fa/verify-login',
        {
          body: {
            code,
            pendingToken: HTTP_ONLY_PENDING_TOKEN_PLACEHOLDER,
          },
        },
      )
      ensureOkResponse(response, HINTS.error)
      setStatus('success')
      router.push(ROUTES.main)
    } catch {
      setStatus('error')
    }
  }

  const isBusy = status === 'verifying' || status === 'success'

  return (
    <>
      <AuthHeading
        description="Use the 6-digit code from your authenticator app."
        title="Enter your 2FA code"
      />
      <form
        aria-busy={isBusy}
        className="flex flex-col gap-5.5"
        noValidate
        onSubmit={handleSubmit}
      >
        <OtpCodeField
          hint={
            status === 'error' || status === 'success'
              ? HINTS[status]
              : undefined
          }
          id="two-factor-code"
          label="Authentication code"
          onChange={(next) => {
            setCode(next)
            if (status === 'error') setStatus('idle')
          }}
          status={status === 'error' || status === 'success' ? status : 'idle'}
          value={code}
        />
        <Button
          className="w-full font-medium"
          disabled={isBusy}
          type="submit"
          variant="primary"
        >
          {isBusy ? 'Verifying...' : 'Verify'}
        </Button>
      </form>
    </>
  )
}
