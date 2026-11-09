'use client'

import {
  getLoginDestination,
  type LoginFormData,
  loginSchema,
} from '@entities/User'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@shared/api/client'
import { showApiErrorToast } from '@shared/api/feedback'
import { useRouter } from 'next/navigation'
import { type SubmitHandler, useForm } from 'react-hook-form'

export const useLoginModalForm = (onSuccess: () => void) => {
  const router = useRouter()
  const login = useMutation('post', '/api/v1/auth/login', {
    onSuccess: (data) => {
      onSuccess()
      router.push(getLoginDestination(data))
    },
    onError: (error) => {
      showApiErrorToast(error, 'Unable to log in. Please try again.')
    },
    meta: { suppressErrorToast: true },
  })
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { acceptLegal: false, email: '', password: '' },
    shouldFocusError: true,
  })
  /** Runs only once the schema passed, consent included; the consent stays out of the body. */
  const onSubmit: SubmitHandler<LoginFormData> = ({ email, password }) => {
    login.mutate({ body: { email, password } })
  }

  return { form, isLoading: login.isPending, onSubmit }
}
