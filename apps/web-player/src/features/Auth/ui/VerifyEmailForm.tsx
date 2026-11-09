'use client'

import { Button } from '@bitrate/ui-react'
import { useSearchParams } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { useMutation } from '@/shared/api/client'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'
import { AuthHeading } from './AuthHeading'
import { AuthTextInput } from './AuthTextInput'
import { AuthTextLink } from './AuthTextLink'
import { AUTH_BUTTON_CLASS } from './authStyles'

export const VerifyEmailForm = () => {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const [email, setEmail] = useState(searchParams.get('email')?.trim() ?? '')
  const verifyEmail = useMutation('post', '/api/v1/auth/verify-email', {
    meta: { suppressErrorToast: true },
  })
  const resendVerification = useMutation(
    'post',
    '/api/v1/auth/verify-email/resend',
    { meta: { suppressErrorToast: true } },
  )

  const handleVerify = async () => {
    if (!token) return

    try {
      await verifyEmail.mutateAsync({ body: { token } })
      showApiSuccessToast(t('auth.verify.success'))
    } catch (error) {
      showApiErrorToast(error, t('auth.verify.failed'))
    }
  }

  const handleResend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await resendVerification.mutateAsync({ body: { email: email.trim() } })
      showApiSuccessToast(t('auth.verify.resent'))
    } catch (error) {
      showApiErrorToast(error, t('auth.verify.resendFailed'))
    }
  }

  return (
    <>
      <AuthHeading
        description={
          token
            ? t('auth.verify.descriptionToken')
            : t('auth.verify.description')
        }
        title={t('auth.verify.title')}
      />

      {token ? (
        <Button
          className={AUTH_BUTTON_CLASS}
          disabled={verifyEmail.isPending}
          onClick={() => void handleVerify()}
          type="button"
          variant="primary"
        >
          {verifyEmail.isPending
            ? t('auth.verifying')
            : t('auth.verify.submit')}
        </Button>
      ) : null}

      <form className="flex flex-col gap-5" onSubmit={handleResend}>
        <AuthTextInput
          autoComplete="email"
          id="verification-email"
          label={t('auth.forgot.email')}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
        <Button
          className={AUTH_BUTTON_CLASS}
          disabled={resendVerification.isPending}
          type="submit"
          variant="secondary"
        >
          {t('auth.verify.resend')}
        </Button>
      </form>

      <AuthTextLink href={ROUTES.auth.login}>
        {t('auth.backToLogin')}
      </AuthTextLink>
    </>
  )
}
