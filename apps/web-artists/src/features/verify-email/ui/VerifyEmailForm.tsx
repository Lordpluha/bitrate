import { Button, Input, LogoIcon, Typography } from '@bitrate/ui-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useEmailVerification } from '../api/useEmailVerification'

const verificationSchema = z.object({
  email: z.email('Please enter a valid email address'),
  code: z.string().regex(/^\d{6}$/, 'Enter the six-digit code'),
})
type VerificationFormData = z.infer<typeof verificationSchema>

interface VerifyEmailFormProps {
  token?: string
  email?: string
  next?: string
}

export function VerifyEmailForm({ token, email, next }: VerifyEmailFormProps) {
  const { verify, resend } = useEmailVerification()
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
        if (error.message.startsWith('Please wait')) setCooldown(60)
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
          Verify your email
        </Typography>
        <p className="text-lg text-neutral-400">
          {verify.isSuccess
            ? 'You’re ready to make some noise.'
            : 'One more step to your artist workspace.'}
        </p>
      </div>
      {verify.isSuccess ? (
        <div
          className="mb-6 rounded-lg border border-neutral-600 p-5 text-center"
          role="status"
        >
          Your email has been verified. You can now sign in.
        </div>
      ) : (
        <>
          <p className="mb-6 text-center text-lg">
            Enter the six-digit code from your verification email. The code is
            valid for 10 minutes.
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
              {verify.isPending ? 'Verifying…' : 'Verify email'}
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
              Email address
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
                {errors.email.message}
              </p>
            )}
            <label className="mt-3 text-xl" htmlFor="verification-code">
              Verification code
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
              Six digits. You can paste the entire code.
            </p>
            {errors.code && (
              <p
                className="text-sm text-red-500"
                id="verification-code-error"
                role="alert"
              >
                {errors.code.message}
              </p>
            )}
            {verify.error && (
              <p className="text-red-500" role="alert">
                {verify.error.message}
              </p>
            )}
            <Button
              className="mt-3"
              disabled={busy}
              size="xl"
              type="submit"
              variant="primary"
            >
              {verify.isPending ? 'Verifying…' : 'Verify and continue'}
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
                ? 'Sending…'
                : cooldown > 0
                  ? `Send again in ${cooldown}s`
                  : 'Resend verification email'}
            </Button>
          </form>
          {resend.error && (
            <p className="mt-4 text-red-500" role="alert">
              {resend.error.message}
            </p>
          )}
          {resend.isSuccess && (
            <p
              className="mt-4 text-center text-neutral-400"
              role={resend.data === 'unavailable' ? 'alert' : 'status'}
            >
              {resend.data === 'development'
                ? 'Local email delivery is disabled. Use the verification code in the API terminal.'
                : resend.data === 'unavailable'
                  ? 'The verification email could not be sent. Please try again later or contact support.'
                  : 'If the account needs verification, a new code has been requested. Check your inbox and spam folder.'}
            </p>
          )}
        </>
      )}
      <Link
        className="mt-6 block text-center text-lg font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        search={{ next }}
        to={ROUTES.auth.login}
      >
        Back to login
      </Link>
    </section>
  )
}
