'use client'

import { type RegistrationFormData, registrationSchema } from '@entities/User'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@shared/api/client'
import { showApiErrorToast } from '@shared/api/feedback'
import { ROUTES } from '@shared/routes'
import { toast } from '@spotify/ui-react'
import { useRouter } from 'next/navigation'
import { type SubmitHandler, useForm } from 'react-hook-form'

export const useSignUpModalForm = (onSuccess?: () => void) => {
  const router = useRouter()
  const registration = useMutation('post', '/api/v1/auth/registration', {
    onSuccess: (_data, variables) => {
      toast.success('Registration successful! Check your email to continue.')
      router.push(ROUTES.auth.verifyEmail(variables.body.email))
      onSuccess?.()
    },
    onError: (error) => {
      showApiErrorToast(error, 'Unable to create account. Please try again.')
    },
    meta: { suppressErrorToast: true },
  })
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    shouldFocusError: true,
  })
  const onSubmit: SubmitHandler<RegistrationFormData> = (data) => {
    registration.mutate({
      body: {
        email: data.email,
        password: data.password,
        username: data.fullName,
      },
    })
  }

  return { form, isRegistering: registration.isPending, onSubmit }
}
