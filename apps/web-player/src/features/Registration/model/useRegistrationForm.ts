'use client'

import { type RegistrationFormData, registrationSchema } from '@entities/User'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@shared/api/client'
import { showApiErrorToast } from '@shared/api/feedback'
import { ROUTES } from '@shared/routes'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

export const useRegistrationForm = () => {
  const router = useRouter()
  const mutation = useMutation('post', '/api/v1/auth/registration', {
    onError: (error) =>
      showApiErrorToast(error, 'Unable to create account. Please try again.'),
    meta: { suppressErrorToast: true },
  })
  const form = useForm<RegistrationFormData>({
    defaultValues: {
      confirmPassword: '',
      email: '',
      fullName: '',
      password: '',
    },
    mode: 'onChange',
    resolver: zodResolver(registrationSchema),
    shouldFocusError: true,
  })

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      await mutation.mutateAsync({
        body: {
          email: data.email,
          password: data.password,
          username: data.fullName,
        },
      })
      router.push(ROUTES.auth.verifyEmail(data.email))
    } catch {
      // The mutation-level handler owns user feedback. Contain mutateAsync's
      // rejection so React Hook Form does not surface an unhandled promise.
    }
  }

  return { form, isSubmitting: mutation.isPending, onSubmit }
}
