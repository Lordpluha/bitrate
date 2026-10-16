'use client'

import {
  getLoginDestination,
  type LoginFormData,
  loginSchema,
} from '@entities/User'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@shared/api/client'
import { useRouter, useSearchParams } from 'next/navigation'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { getSignInFailure } from './signInFailure'

export const useLoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mutation = useMutation('post', '/api/v1/auth/login', {
    onSuccess: (data) => {
      router.push(getLoginDestination(data))
    },
    meta: { suppressErrorToast: true },
  })
  const form = useForm<LoginFormData>({
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
    resolver: zodResolver(loginSchema),
    shouldFocusError: true,
  })

  const onSubmit: SubmitHandler<LoginFormData> = async (body) => {
    try {
      await mutation.mutateAsync({ body })
    } catch {
      /** The failure is shown in the form's alert; keep React Hook Form from seeing a rejection. */
    }
  }

  return {
    failure: getSignInFailure({
      oauthError: searchParams.get('error'),
      submitError: mutation.error,
    }),
    form,
    isSubmitting: mutation.isPending,
    onSubmit,
  }
}
