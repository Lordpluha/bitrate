'use client'

import { clientFetchClient } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { ROUTES } from '@shared/routes'
import { Button, Input, LogoIcon, Typography, toast } from '@spotify/ui-react'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

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
            pendingToken: 'cookie',
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
        <Input
          inputMode="numeric"
          maxLength={6}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
          placeholder="123456"
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
