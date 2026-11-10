'use client'

import {
  getLoginDestination,
  type LoginFormData,
  loginSchema,
} from '@entities/User'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@shared/api/client'
import { useI18n } from '@shared/i18n'
import { useRouter, useSearchParams } from 'next/navigation'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { getSignInFailure } from './signInFailure'

export const useLoginForm = () => {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const mutation = useMutation('post', '/api/v1/auth/login', {
    onSuccess: (data) => {
      router.push(getLoginDestination(data))
    },
    meta: { suppressErrorToast: true },
  })
  const form = useForm<LoginFormData>({
    defaultValues: { acceptLegal: false, email: '', password: '' },
    mode: 'onChange',
    resolver: zodResolver(loginSchema),
    shouldFocusError: true,
  })

  /** Runs only once the schema passed, consent included; the consent stays out of the body. */
  const onSubmit: SubmitHandler<LoginFormData> = async ({
    email,
    password,
  }) => {
    try {
      await mutation.mutateAsync({ body: { email, password } })
    } catch {
      /** The failure is shown in the form's alert; keep React Hook Form from seeing a rejection. */
    }
  }

  return {
    failure: getSignInFailure({
      oauthError: searchParams.get('error'),
      submitError: mutation.error,
      t,
    }),
    form,
    isSubmitting: mutation.isPending,
    onSubmit,
  }
}
