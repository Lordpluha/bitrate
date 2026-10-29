import { Button, Input, LogoIcon, Typography } from '@bitrate/ui-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { RATE_LIMITED, useEmailVerification } from '../api/useEmailVerification'
import {
  type VerificationFormData,
  verificationSchema,
} from '../model/verification.schema'

interface VerifyEmailFormProps {
  token?: string
  email?: string
  next?: string
}

export function VerifyEmailForm({ token, email, next }: VerifyEmailFormProps) {
  const { verify, resend } = useEmailVerification()
  const { t, tMessage } = useI18n()
  const [cooldown, setCooldown] = useState(0)
  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { email: email ?? '', code: '' },
  })
  const busy = verify.isPending || resend.isPending
  const errors = form.formState.errors
  const { setFocus } = form

  useEffect(() => {
    if (resend.isSuccess && resend.data !== 'unavailable' && !busy)
      setFocus('code')
  }, [resend.isSuccess, resend.data, busy, setFocus])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setTimeout(
      () => setCooldown((seconds) => seconds - 1),
      1_000,
    )
    return () => window.clearTimeout(timer)
  }, [cooldown])

  const sendCode = async () => {
    if (!(await form.trigger('email'))) return
    verify.reset()
    resend.mutate(form.getValues('email').trim().toLowerCase(), {
      onSuccess: (delivery) => {
        if (delivery !== 'unavailable') {
          setCooldown(60)
          form.resetField('code')
        }
      },
      onError: (error) => {
        if (error.message === RATE_LIMITED) setCooldown(60)
      },
    })
  }

  return (
    <section
      aria-labelledby="verify-email-title"
      className="w-full max-w-120 rounded-[10px] px-14 py-20 text-white max-lg:px-0 max-lg:py-8"
    >
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <LogoIcon height={64} width={64} />
        <Typography as="h1" id="verify-email-title" size="heading2">
          {t('auth.verify.title')}
        </Typography>
        <p className="text-lg text-neutral-400">
          {verify.isSuccess
            ? t('auth.verify.ready')
            : t('auth.verify.oneMoreStep')}
        </p>
      </div>
      {verify.isSuccess ? (
        <div
          className="mb-6 rounded-lg border border-neutral-600 p-5 text-center"
          role="status"
        >
          {t('auth.verify.verified')}
        </div>
      ) : (
        <>
          <p className="mb-6 text-center text-lg">
            {t('auth.verify.instructions')}
          </p>
          {token && (
            <Button
              className="mb-6 w-full"
              disabled={busy}
              onClick={() => verify.mutate({ token })}
              size="xl"
              type="button"
              variant="secondary"
            >
              {verify.isPending ? t('common.verifying') : t('auth.verifyEmail')}
            </Button>
          )}
          <form
            className="flex flex-col gap-3"
            method="post"
            onSubmit={form.handleSubmit(({ email: address, code }) => {
              resend.reset()
              verify.mutate({ email: address.trim().toLowerCase(), code })
            })}
          >
            <label className="text-xl" htmlFor="verification-email">
              {t('auth.verify.emailLabel')}
            </label>
            <Input
              aria-describedby={
                errors.email ? 'verification-email-error' : undefined
              }
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              className="text-xl! hover:border-white focus-visible:ring-ring"
              disabled={busy}
              id="verification-email"
              type="email"
              variant="black"
              {...form.register('email', {
                onChange: () => {
                  verify.reset()
                  resend.reset()
                },
              })}
            />
            {errors.email && (
              <p
                className="text-sm text-red-500"
                id="verification-email-error"
                role="alert"
              >
                {tMessage(errors.email.message)}
              </p>
            )}
            <label className="mt-3 text-xl" htmlFor="verification-code">
              {t('auth.verify.codeLabel')}
            </label>
            <Input
              aria-describedby={
                errors.code
                  ? 'verification-code-error'
                  : 'verification-code-hint'
              }
              aria-invalid={Boolean(errors.code)}
              autoComplete="one-time-code"
              className="h-16 text-center text-3xl! tracking-widest tabular-nums hover:border-white focus-visible:ring-ring"
              disabled={busy}
              id="verification-code"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              type="text"
              variant="black"
              {...form.register('code', { onChange: () => verify.reset() })}
            />
            <p className="text-sm text-neutral-400" id="verification-code-hint">
              {t('auth.verify.codeHint')}
            </p>
            {errors.code && (
              <p
                className="text-sm text-red-500"
                id="verification-code-error"
                role="alert"
              >
                {tMessage(errors.code.message)}
              </p>
            )}
            {verify.error && (
              <p className="text-red-500" role="alert">
                {tMessage(verify.error.message)}
              </p>
            )}
            <Button
              className="mt-3"
              disabled={busy}
              size="xl"
              type="submit"
              variant="primary"
            >
              {verify.isPending
                ? t('common.verifying')
                : t('auth.verify.submit')}
            </Button>
            <Button
              disabled={busy || cooldown > 0}
              onClick={() => {
                void sendCode()
              }}
              size="xl"
              type="button"
              variant="ghost"
            >
              {resend.isPending
                ? t('common.sending')
                : cooldown > 0
                  ? t('auth.verify.resendIn', { seconds: cooldown })
                  : t('auth.verify.resend')}
            </Button>
          </form>
          {resend.error && (
            <p className="mt-4 text-red-500" role="alert">
              {tMessage(resend.error.message)}
            </p>
          )}
          {resend.isSuccess && (
            <p
              className="mt-4 text-center text-neutral-400"
              role={resend.data === 'unavailable' ? 'alert' : 'status'}
            >
              {resend.data === 'development'
                ? t('auth.verify.development')
                : resend.data === 'unavailable'
                  ? t('auth.verify.unavailable')
                  : t('auth.verify.requested')}
            </p>
          )}
        </>
      )}
      <Link
        className="mt-6 block text-center text-lg font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        search={{ next }}
        to={ROUTES.auth.login}
      >
        {t('auth.verify.backToLogin')}
      </Link>
    </section>
  )
}
