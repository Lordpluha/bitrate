'use client'

import { Button, Input, Typography, toast } from '@bitrate/ui-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { apiBaseUrl } from '@shared/api'
import { clientLocale, messageKey, useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z
  .object({
    password: z.string().min(6, messageKey('auth.reset.passwordTooShort')),
    confirm: z.string().min(1, messageKey('auth.reset.confirm')),
  })
  .refine((v) => v.password === v.confirm, {
    message: messageKey('auth.reset.mismatch'),
    path: ['confirm'],
  })

type FormData = z.infer<typeof schema>

type ResetPasswordSearch = { token?: string }

export const ResetPasswordForm = () => {
  const navigate = useNavigate()
  const { t, tMessage } = useI18n()
  const search = useSearch({ strict: false }) as ResetPasswordSearch
  const token = search.token || ''

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!token) {
      toast.error(t('auth.reset.missingToken'))
      return
    }

    try {
      const res = await fetch(
        `${apiBaseUrl}/api/v1/artists/auth/reset-password`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Accept-Language': clientLocale(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, password: data.password }),
        },
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const message = Array.isArray(err.message)
          ? err.message[0]
          : err.message
        throw new Error(message || messageKey('auth.reset.failed'))
      }

      toast.success(t('auth.reset.done'))
      void navigate({ to: ROUTES.auth.login })
    } catch (error) {
      toast.error(
        tMessage(
          error instanceof Error
            ? error.message
            : messageKey('auth.reset.failed'),
        ),
      )
    }
  }

  return (
    <form className="max-w-md mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
      <Typography as="h1" className="mb-4" size="heading4">
        {t('auth.reset.title')}
      </Typography>

      <label className="text-base mb-2 block" htmlFor="password">
        {t('auth.reset.newPassword')}
      </label>
      <Input
        id="password"
        type="password"
        variant="black"
        {...form.register('password')}
      />
      {form.formState.errors.password ? (
        <Typography as="p" className="text-red-500 text-sm mt-2">
          {tMessage(form.formState.errors.password.message)}
        </Typography>
      ) : null}

      <label className="text-base mb-2 block mt-4" htmlFor="confirm">
        {t('auth.reset.confirm')}
      </label>
      <Input
        id="confirm"
        type="password"
        variant="black"
        {...form.register('confirm')}
      />
      {form.formState.errors.confirm ? (
        <Typography as="p" className="text-red-500 text-sm mt-2">
          {tMessage(form.formState.errors.confirm.message)}
        </Typography>
      ) : null}

      <div className="mt-6">
        <Button className="w-full" size="lg" type="submit" variant="artistCard">
          {t('auth.reset.submit')}
        </Button>
      </div>
    </form>
  )
}
