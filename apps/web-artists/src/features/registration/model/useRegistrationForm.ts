'use client'

import { toast } from '@bitrate/ui-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ROUTES } from '@shared/routes/routes'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import {
  checkArtistEmailAvailability,
  useRegistration,
} from '../api/useRegistration'
import {
  type RegistrationFormData,
  registrationSchema,
} from '../validation/RegistrationForm.validation'

/** Which half of the two-step sign-up the form is showing. */
export type RegistrationStep = 'email' | 'password'

/** Which password requirements the current value already satisfies. */
export type PasswordRules = {
  hasLetter: boolean
  hasNumberOrSpecial: boolean
  hasMinLength: boolean
}

/** Shortest password the API will accept. */
const MIN_PASSWORD_LENGTH = 10

const EMAIL_TAKEN_MESSAGE =
  'This email is already registered. Please log in instead.'

/** Returns the first unmet password requirement, or `null` when all are met. */
const firstPasswordProblem = (password: string): string | null => {
  if (!password) return 'Please enter a password'
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  }
  if (!/[A-Za-z]/.test(password))
    return 'Password must contain at least one letter'
  if (!/[0-9]|[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain a number or special character'
  }
  return null
}

/**
 * Drives the two-step artist sign-up form.
 *
 * The email step checks availability before advancing, so a taken address is
 * reported before the visitor has chosen a password.
 */
export const useRegistrationForm = () => {
  const router = useRouter()
  const [step, setStep] = useState<RegistrationStep>('email')

  const { mutate: registerUser, isPending } = useRegistration({
    onSuccess: () => {
      toast.success('Registration completed successfully')
      router.push(ROUTES.landing)
    },
    onError: (error) => {
      if (error.message.toLowerCase().includes('already exists')) {
        form.setError('email', { type: 'server', message: EMAIL_TAKEN_MESSAGE })
        form.setValue('password', '')
        setStep('email')
        return
      }

      toast.error(error.message || 'Registration failed')
    },
  })

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  })

  const passwordValue = form.watch('password')

  const passwordRules = useMemo<PasswordRules>(
    () => ({
      hasLetter: /[A-Za-z]/.test(passwordValue),
      hasNumberOrSpecial: /[0-9]|[^A-Za-z0-9]/.test(passwordValue),
      hasMinLength: passwordValue.length >= MIN_PASSWORD_LENGTH,
    }),
    [passwordValue],
  )

  const submitEmail: SubmitHandler<RegistrationFormData> = async (data) => {
    const email = data.email.trim().toLowerCase()
    form.clearErrors('email')

    try {
      if (!(await checkArtistEmailAvailability(email))) {
        form.setError('email', { type: 'server', message: EMAIL_TAKEN_MESSAGE })
        toast.error(EMAIL_TAKEN_MESSAGE)
        return
      }

      form.setValue('email', email, { shouldValidate: true, shouldDirty: true })
      setStep('password')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to verify email'
      form.setError('email', { type: 'server', message })
      toast.error(message)
    }
  }

  const submitPassword: SubmitHandler<RegistrationFormData> = async (data) => {
    const problem = firstPasswordProblem(data.password)
    if (problem) {
      toast.error(problem)
      return
    }

    registerUser({ ...data, email: data.email.trim().toLowerCase() })
  }

  const backToEmailStep = () => {
    form.clearErrors('email')
    form.clearErrors('password')
    setStep('email')
  }

  return {
    backToEmailStep,
    form,
    isPending,
    passwordRules,
    step,
    submitEmail,
    submitPassword,
  }
}
