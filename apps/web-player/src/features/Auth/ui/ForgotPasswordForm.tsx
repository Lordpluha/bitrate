'use client'

import { Button } from '@bitrate/ui-react'
import { useMutation } from '@shared/api/client'
import { showApiErrorToast } from '@shared/api/feedback'
import { type TranslationKey, useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import { type FormEvent, useState } from 'react'
import { z } from 'zod'
import { AuthAlert } from './AuthAlert'
import { AuthHeading } from './AuthHeading'
import { AuthTextInput } from './AuthTextInput'
import { AuthTextLink } from './AuthTextLink'
import { AUTH_BUTTON_CLASS } from './authStyles'

const emailSchema = z.email()

export const ForgotPasswordForm = () => {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<TranslationKey | null>(null)
  const [isSent, setIsSent] = useState(false)
  const forgotPassword = useMutation('post', '/api/v1/auth/forgot-password', {
    meta: { suppressErrorToast: true },
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextEmail = email.trim()
    if (!emailSchema.safeParse(nextEmail).success) {
      setEmailError('validation.email.required')
      return
    }

    try {
      await forgotPassword.mutateAsync({ body: { email: nextEmail } })
      setIsSent(true)
    } catch (error) {
      showApiErrorToast(error, t('auth.forgot.failed'))
    }
  }

  return (
    <>
      <AuthHeading
        description={emailError ? undefined : t('auth.forgot.description')}
        title={t('auth.forgot.title')}
      />
      {isSent ? (
        <>
          <AuthAlert title={t('auth.forgot.sentTitle')}>
            {t('auth.forgot.sent')}
          </AuthAlert>
          <Button asChild className={AUTH_BUTTON_CLASS} variant="outline">
            <Link href={ROUTES.auth.login}>{t('auth.backToLogin')}</Link>
          </Button>
        </>
      ) : (
        <>
          <form
            aria-busy={forgotPassword.isPending}
            className="flex flex-col gap-5"
            noValidate
            onSubmit={handleSubmit}
          >
            <AuthTextInput
              autoComplete="email"
              error={emailError && t(emailError)}
              id="recovery-email"
              label={t('auth.forgot.email')}
              onChange={(event) => {
                setEmail(event.target.value)
                setEmailError(null)
              }}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
            <Button
              className={AUTH_BUTTON_CLASS}
              disabled={forgotPassword.isPending}
              type="submit"
              variant="primary"
            >
              {forgotPassword.isPending
                ? t('auth.forgot.submitting')
                : t('auth.forgot.submit')}
            </Button>
          </form>
          {emailError ? null : (
            <AuthTextLink href={ROUTES.auth.login}>
              {t('auth.backToLogin')}
            </AuthTextLink>
          )}
        </>
      )}
    </>
  )
}
