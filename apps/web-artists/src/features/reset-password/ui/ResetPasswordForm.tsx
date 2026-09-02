'use client'

import { Button, Input, Typography, toast } from '@bitrate/ui-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { apiBaseUrl } from '@shared/api'
import { ROUTES } from '@shared/routes/routes'
import { useRouter, useSearchParams } from 'next/navigation'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm: z.string().min(1, 'Confirm password'),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

type FormData = z.infer<typeof schema>

export const ResetPasswordForm = () => {
  const router = useRouter()
  const params = useSearchParams()
  const token = params?.get('token') || ''

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!token) {
      toast.error('Missing token')
      return
    }

    try {
      const res = await fetch(
        `${apiBaseUrl}/api/v1/artists/auth/reset-password`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password: data.password }),
        },
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const message = Array.isArray(err.message)
          ? err.message[0]
          : err.message
        throw new Error(message || 'Unable to reset password')
      }

      toast.success('Password updated — please log in')
      router.push(ROUTES.auth.login)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Reset failed'
      toast.error(message)
    }
  }

  return (
    <form className="max-w-md mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
      <Typography as="h1" className="mb-4" size="heading4">
        Reset password
      </Typography>

      <label className="text-base mb-2 block" htmlFor="password">
        New password
      </label>
      <Input
        id="password"
        type="password"
        variant="black"
        {...form.register('password')}
      />
      {form.formState.errors.password ? (
        <Typography as="p" className="text-red-500 text-sm mt-2">
          {form.formState.errors.password.message}
        </Typography>
      ) : null}

      <label className="text-base mb-2 block mt-4" htmlFor="confirm">
        Confirm password
      </label>
      <Input
        id="confirm"
        type="password"
        variant="black"
        {...form.register('confirm')}
      />
      {form.formState.errors.confirm ? (
        <Typography as="p" className="text-red-500 text-sm mt-2">
          {form.formState.errors.confirm.message}
        </Typography>
      ) : null}

      <div className="mt-6">
        <Button className="w-full" size="lg" type="submit" variant="artistCard">
          Set new password
        </Button>
      </div>
    </form>
  )
}
