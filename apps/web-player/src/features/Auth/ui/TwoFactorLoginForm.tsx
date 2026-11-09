'use client'

import { Button } from '@bitrate/ui-react'
import { clientFetchClient } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { type TranslationKey, useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { AuthHeading } from './AuthHeading'
import { AUTH_BUTTON_CLASS } from './authStyles'
import { OTP_LENGTH, OtpCodeField } from './OtpCodeField'

/**
 * The API contract still requires a body token, while the real pending token is
 * supplied by the backend through the HTTP-only pending_2fa_token cookie.
 */
const HTTP_ONLY_PENDING_TOKEN_PLACEHOLDER =
  'pending-token-from-http-only-cookie'

type VerifyStatus = 'idle' | 'verifying' | 'error' | 'success'

const HINTS = {
  error: 'auth.twoFactor.invalid',
  success: 'auth.twoFactor.success',
} as const satisfies Record<'error' | 'success', TranslationKey>

export const TwoFactorLoginForm = () => {
  const { t } = useI18n()
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
      ensureOkResponse(response, t(HINTS.error))
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
        description={t('auth.twoFactor.description')}
        title={t('auth.twoFactor.title')}
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
              ? t(HINTS[status])
              : undefined
          }
          id="two-factor-code"
          label={t('auth.twoFactor.code')}
          onChange={(next) => {
            setCode(next)
            if (status === 'error') setStatus('idle')
          }}
          status={status === 'error' || status === 'success' ? status : 'idle'}
          value={code}
        />
        <Button
          className={AUTH_BUTTON_CLASS}
          disabled={isBusy}
          type="submit"
          variant="primary"
        >
          {isBusy ? t('auth.verifying') : t('auth.twoFactor.submit')}
        </Button>
      </form>
    </>
  )
}
