'use client'

import { clientFetchClient } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { ROUTES } from '@shared/routes'
import { Button, Input, LogoIcon, Typography, toast } from '@spotify/ui-react'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

/**
 * The API contract still requires a body token, while the real pending token is
 * supplied by the backend through the HTTP-only pending_2fa_token cookie.
 */
const HTTP_ONLY_PENDING_TOKEN_PLACEHOLDER =
  'pending-token-from-http-only-cookie'

export const TwoFactorLoginForm = () => {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextCode = code.trim()

    if (!/^\d{6}$/.test(nextCode)) {
      showApiErrorToast(new Error('Enter the 6-digit 2FA code.'))
      return
    }

    setIsSubmitting(true)
    try {
      const { response } = await clientFetchClient.POST(
        '/api/v1/auth/2fa/verify-login',
        {
          body: {
            code: nextCode,
            pendingToken: HTTP_ONLY_PENDING_TOKEN_PLACEHOLDER,
          },
        },
      )

      ensureOkResponse(response, 'Invalid or expired 2FA code')
      showApiSuccessToast('Logged in')
      router.push(ROUTES.main)
    } catch {
      toast.error('Invalid or expired 2FA code')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-stretch justify-center basis-[50%] gap-4 px-14 py-32 bg-contrast text-text-contrast overflow-hidden rounded-[10px_0_0_10px] max-xl:basis-full max-xl:rounded-[10px] max-lg:p-6 box-border">
      <div className="flex flex-col items-center">
        <LogoIcon height={64} width={64} />
        <Typography as="h5" className="mt-2 text-center" size="heading5">
          Enter your 2FA code
        </Typography>
        <Typography as="p" className="text-center text-grey-500" size="body">
          Use the 6-digit code from your authenticator app.
        </Typography>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label
          className="grid gap-2 text-sm font-semibold"
          htmlFor="two-factor-code"
        >
          Authentication code
        </label>
        <Input
          autoComplete="one-time-code"
          id="two-factor-code"
          inputMode="numeric"
          maxLength={6}
          name="two-factor-code"
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
          pattern="[0-9]{6}"
          placeholder="123456"
          required
          value={code}
          variant="contrast"
        />
        <Button
          className="rounded"
          disabled={isSubmitting}
          type="submit"
          variant="primary"
        >
          Verify
        </Button>
      </form>
    </div>
  )
}
