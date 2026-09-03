'use client'

import { Button, Input, Typography, toast } from '@bitrate/ui-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { apiBaseUrl } from '@shared/api'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type FormData = z.infer<typeof schema>

export const ForgotPasswordForm = () => {
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
        throw new Error(message || 'Unable to process request')
      }

      toast.success('If that email exists, a reset link was sent')
      form.reset()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed'
      toast.error(message)
    }
  }

  return (
    <form className="max-w-md mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
      <Typography as="h1" className="mb-4" size="heading4">
        Forgot password
      </Typography>

      <label className="text-base mb-2 block" htmlFor="email">
        Email
      </label>
      <Input id="email" variant="black" {...form.register('email')} />
      {form.formState.errors.email ? (
        <Typography as="p" className="text-red-500 text-sm mt-2">
          {form.formState.errors.email.message}
        </Typography>
      ) : null}

      <div className="mt-6">
        <Button className="w-full" size="lg" type="submit" variant="artistCard">
          Send reset link
        </Button>
      </div>
    </form>
  )
}
