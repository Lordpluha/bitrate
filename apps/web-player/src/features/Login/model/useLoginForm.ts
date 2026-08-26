'use client'

import { type LoginFormData, loginSchema } from '@entities/User'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@shared/api/client'
import { showApiErrorToast } from '@shared/api/feedback'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { getLoginDestination } from '@/features/Auth/model/getLoginDestination'

export const useLoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mutation = useMutation('post', '/api/v1/auth/login', {
    onSuccess: (data) => {
      router.push(getLoginDestination(data))
    },
    onError: (error) =>
      showApiErrorToast(error, 'Unable to log in. Please try again.'),
    meta: { suppressErrorToast: true },
  })
  const form = useForm<LoginFormData>({
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
    resolver: zodResolver(loginSchema),
    shouldFocusError: true,
  })

  useEffect(() => {
    const error = searchParams.get('error')
    if (!error) return
    const message =
      error === 'oauth_state_mismatch'
        ? 'OAuth session expired. Please try again.'
        : 'OAuth login failed. Please try again.'
    showApiErrorToast(new Error(message))
  }, [searchParams])

  const onSubmit: SubmitHandler<LoginFormData> = (body) =>
    mutation.mutateAsync({ body })

  return { form, isSubmitting: mutation.isPending, onSubmit }
}
