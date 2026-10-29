'use client'

import { Button, Input, Typography, toast } from '@bitrate/ui-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { apiBaseUrl } from '@shared/api'
import { messageKey, useI18n } from '@shared/i18n'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(messageKey('auth.validation.emailInvalid')),
})

type FormData = z.infer<typeof schema>

export const ForgotPasswordForm = () => {
  const { t, tMessage } = useI18n()
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
    mode: 'onChange',
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/v1/artists/auth/forgot-password`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email.trim().toLowerCase() }),
        },
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const message = Array.isArray(err.message)
          ? err.message[0]
          : err.message
        throw new Error(message || messageKey('auth.forgot.failed'))
      }

      toast.success(t('auth.forgot.sent'))
      form.reset()
    } catch (error) {
      toast.error(
        tMessage(
          error instanceof Error
            ? error.message
            : messageKey('auth.forgot.failed'),
        ),
      )
    }
  }

  return (
    <form className="max-w-md mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
      <Typography as="h1" className="mb-4" size="heading4">
        {t('auth.forgot.title')}
      </Typography>

      <label className="text-base mb-2 block" htmlFor="email">
        {t('auth.forgot.email')}
      </label>
      <Input id="email" variant="black" {...form.register('email')} />
      {form.formState.errors.email ? (
        <Typography as="p" className="text-red-500 text-sm mt-2">
          {tMessage(form.formState.errors.email.message)}
        </Typography>
      ) : null}

      <div className="mt-6">
        <Button className="w-full" size="lg" type="submit" variant="artistCard">
          {t('auth.forgot.submit')}
        </Button>
      </div>
    </form>
  )
}
