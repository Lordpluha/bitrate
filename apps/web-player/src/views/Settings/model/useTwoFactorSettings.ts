import { useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import { clientFetchClient } from '@/shared/api/client'
import { ensureOkResponse } from '@/shared/api/errors'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import { apiQueryKeys } from '@/shared/api/queryKeys'
import { useAuth } from '@/shared/hooks'

type TwoFactorSetup = {
  manualCode?: string
  qrCodeDataUrl?: string
}

export const useTwoFactorSettings = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [enableCode, setEnableCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null)
  const [isPending, setIsPending] = useState(false)

  const refreshMe = async () => {
    await queryClient.invalidateQueries({ queryKey: apiQueryKeys.auth.me })
  }

  const startSetup = async () => {
    setIsPending(true)
    try {
      const { data, response } = await clientFetchClient.POST(
        '/api/v1/auth/2fa/setup',
      )
      ensureOkResponse(response, 'Failed to start 2FA setup')
      setSetup(data ?? null)
    } catch (error) {
      showApiErrorToast(error, 'Failed to start 2FA setup')
    } finally {
      setIsPending(false)
    }
  }

  const enable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const code = enableCode.trim()
    if (!/^\d{6}$/.test(code)) {
      showApiErrorToast(new Error('Enter the 6-digit 2FA code.'))
      return
    }

    setIsPending(true)
    try {
      const { response } = await clientFetchClient.POST(
        '/api/v1/auth/2fa/enable',
        { body: { code } },
      )
      ensureOkResponse(response, 'Failed to enable 2FA')
      setEnableCode('')
      setSetup(null)
      await refreshMe()
      showApiSuccessToast('2FA enabled')
    } catch (error) {
      showApiErrorToast(error, 'Failed to enable 2FA')
    } finally {
      setIsPending(false)
    }
  }

  const disable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const code = disableCode.trim()
    if (!/^\d{6}$/.test(code)) {
      showApiErrorToast(new Error('Enter the 6-digit 2FA code.'))
      return
    }

    setIsPending(true)
    try {
      const { response } = await clientFetchClient.DELETE(
        '/api/v1/auth/2fa/disable',
        { body: { code } },
      )
      ensureOkResponse(response, 'Failed to disable 2FA')
      setDisableCode('')
      await refreshMe()
      showApiSuccessToast('2FA disabled')
    } catch (error) {
      showApiErrorToast(error, 'Failed to disable 2FA')
    } finally {
      setIsPending(false)
    }
  }

  return {
    disable,
    disableCode,
    enable,
    enableCode,
    isEnabled: Boolean(user?.twoFactorEnabled),
    isPending,
    setDisableCode,
    setEnableCode,
    setup,
    startSetup,
  }
}
