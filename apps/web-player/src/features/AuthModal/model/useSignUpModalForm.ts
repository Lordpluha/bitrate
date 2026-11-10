'use client'

import { toast } from '@bitrate/ui-react'
import { type RegistrationFormData, registrationSchema } from '@entities/User'
import { zodResolver } from '@hookform/resolvers/zod'
import { trackFunnel } from '@shared/analytics'
import { useMutation } from '@shared/api/client'
import { showApiErrorToast } from '@shared/api/feedback'
import { ROUTES } from '@shared/routes'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'

export const useSignUpModalForm = (onSuccess?: () => void) => {
  const router = useRouter()
  const registration = useMutation('post', '/api/v1/auth/registration', {
    onSuccess: (_data, variables) => {
      trackFunnel({ step: 'signup.success', attributes: { surface: 'modal' } })
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
      acceptLegal: false,
      fullName: '',
      email: '',
      password: '',
    },
    shouldFocusError: true,
  })
  /* the form mounts when the modal opens: that is the funnel's "shown" */
  useEffect(() => {
    trackFunnel({ step: 'signup.view', attributes: { surface: 'modal' } })
  }, [])

  const onSubmit: SubmitHandler<RegistrationFormData> = (data) => {
    trackFunnel({ step: 'signup.submit', attributes: { surface: 'modal' } })
    registration.mutate({
      body: {
        acceptLegal: true,
        email: data.email,
        password: data.password,
        username: data.fullName,
      },
    })
  }

  return { form, isRegistering: registration.isPending, onSubmit }
}
