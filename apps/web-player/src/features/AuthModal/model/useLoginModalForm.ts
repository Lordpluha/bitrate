'use client'

import { type LoginFormData, loginSchema } from '@entities/User'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@shared/api/client'
import { showApiErrorToast } from '@shared/api/feedback'
import { ROUTES } from '@shared/routes'
import { useRouter } from 'next/navigation'
import { type SubmitHandler, useForm } from 'react-hook-form'

export const useLoginModalForm = (onSuccess: () => void) => {
  const router = useRouter()
  const login = useMutation('post', '/api/v1/auth/login', {
    onSuccess: () => {
      onSuccess()
      void router.push(ROUTES.main)
    },
    onError: (error) => {
      showApiErrorToast(error, 'Unable to log in. Please try again.')
    },
    meta: { suppressErrorToast: true },
  })
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
    shouldFocusError: true,
  })
  const onSubmit: SubmitHandler<LoginFormData> = (body) => {
    login.mutate({ body })
  }

  return { form, isLoading: login.isPending, onSubmit }
}
