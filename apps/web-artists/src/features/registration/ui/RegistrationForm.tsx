'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ROUTES } from '@shared/routes/routes'
import {
  ArrowrleftIcon,
  Button,
  CircleCheck,
  CircleIcon,
  FacebookArtistIcon,
  GoogleIcon,
  Input,
  LogoIcon,
  PasswordInput,
  Typography,
  toast,
} from '@spotify/ui-react'
import Link from 'next/link'
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

const socialButtonStyles =
  'border bg-black-800 text-white border-neutral-600 relative w-full inline-flex items-center justify-center'

const socialIconStyles = 'absolute left-4 top-1/2 -translate-y-1/2'

type RegistrationStep = 'email' | 'password'

export const RegistrationForm = () => {
  const router = useRouter()
  const [step, setStep] = useState<RegistrationStep>('email')
  const { mutate: registerUser, isPending } = useRegistration({
    onSuccess: () => {
      toast.success('Registration completed successfully')
      router.push(ROUTES.landing)
    },
    onError: (error) => {
      if (error.message.toLowerCase().includes('already exists')) {
        form.setError('email', {
          type: 'server',
          message: 'This email is already registered. Please log in instead.',
        })
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
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const passwordValue = form.watch('password')

  const passwordRules = useMemo(() => {
    return {
      hasLetter: /[A-Za-z]/.test(passwordValue),
      hasNumberOrSpecial: /[0-9]|[^A-Za-z0-9]/.test(passwordValue),
      hasMinLength: passwordValue.length >= 10,
    }
  }, [passwordValue])

  const onSubmitEmail: SubmitHandler<RegistrationFormData> = async (data) => {
    const email = data.email.trim().toLowerCase()

    form.clearErrors('email')

    try {
      const isAvailable = await checkArtistEmailAvailability(email)

      if (!isAvailable) {
        form.setError('email', {
          type: 'server',
          message: 'This email is already registered. Please log in instead.',
        })
        toast.error('This email is already registered. Please log in instead.')
        return
      }

      form.setValue('email', email, { shouldValidate: true, shouldDirty: true })
      setStep('password')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to verify email'
      form.setError('email', {
        type: 'server',
        message,
      })
      toast.error(message)
    }
  }

  const onSubmitPassword: SubmitHandler<RegistrationFormData> = async (
    data,
  ) => {
    if (!data.password) {
      toast.error('Please enter a password')
      return
    }
    if (data.password.length < 10) {
      toast.error('Password must be at least 10 characters')
      return
    }
    if (!/[A-Za-z]/.test(data.password)) {
      toast.error('Password must contain at least one letter')
      return
    }
    if (!/[0-9]|[^A-Za-z0-9]/.test(data.password)) {
      toast.error('Password must contain a number or special character')
      return
    }

    registerUser({
      ...data,
      email: data.email.trim().toLowerCase(),
    })
  }

  const onBackToEmailStep = () => {
    form.clearErrors('email')
    form.clearErrors('password')
    setStep('email')
  }

  return (
    <div className="w-full max-w-120 flex flex-col items-stretch justify-center gap-4 px-14 py-20 bg-inherit text-white overflow-hidden rounded-[10px] max-lg:p-6 box-border">
      <div className="flex flex-col items-center mb-6">
        <LogoIcon height={64} primaryColor="#FFF" width={64} />
        {step === 'email' ? (
          <Typography as="h5" className="mt-2 text-center" size={'heading2'}>
            Sign up and immerse yourself in music
          </Typography>
        ) : null}
      </div>

      {step === 'email' ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={form.handleSubmit(onSubmitEmail)}
        >
          <label className="text-xl font-normal" htmlFor="registration-email">
            Email Address
          </label>
          <Input
            className="text-xl! hover:border-white py-2"
            id="registration-email"
            placeholder="example@gmail.com"
            variant="black"
            {...form.register('email')}
          />
          {form.formState.errors.email ? (
            <Typography as="p" className="text-red-500 text-sm" size={'body'}>
              {form.formState.errors.email.message}
            </Typography>
          ) : null}

          <div className="mt-4 flex flex-col items-stretch gap-4">
            <Button
              className="bg-green-400"
              size={'xl'}
              type="submit"
              variant="artistCard"
            >
              Continue
            </Button>

            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">or</span>
            </div>

            <Button
              className={socialButtonStyles}
              size="xl"
              type="button"
              variant="artistCard"
            >
              <span className={socialIconStyles}>
                <GoogleIcon className="block" height={24} width={24} />
              </span>
              <span className="w-full text-center">
                <Typography as="p" className="leading-none" size="heading6">
                  Continue with Google
                </Typography>
              </span>
            </Button>

            <Button
              className={`${socialButtonStyles}`}
              size="xl"
              type="button"
              variant="artistCard"
            >
              <span className={`${socialIconStyles}`}>
                <FacebookArtistIcon className="block" height={24} width={24} />
              </span>

              <span className="w-full text-center">
                <Typography as="p" className="leading-none" size="heading6">
                  Continue with Facebook
                </Typography>
              </span>
            </Button>

            <p className="text-lg text-center">
              Already have an account?{' '}
              <Link className="font-bold" href={ROUTES.auth.login}>
                <br />
                Log in.
              </Link>
            </p>
          </div>
        </form>
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={form.handleSubmit(onSubmitPassword)}
        >
          <header className="flex flex-col items-start w-full gap-4">
            <div className="h-0.5 w-full rounded-full overflow-hidden flex">
              <div className="h-full bg-green-400 w-1/2" />
              <div className="h-full bg-neutral-600 w-1/2" />
            </div>

            <div className="flex items-start gap-3">
              <button
                aria-label="Back to email step"
                className="mt-1 text-grey-500 hover:text-white transition-colors duration-300 [&_path]:opacity-70 hover:[&_path]:opacity-100"
                onClick={onBackToEmailStep}
                type="button"
              >
                <ArrowrleftIcon height={20} width={20} />
              </button>
              <div>
                <Typography as="p" className="text-grey-500" size={'body'}>
                  Step 2 of 2
                </Typography>
                <Typography as="h6" className="mt-1" size={'heading6'}>
                  Create a password
                </Typography>
              </div>
            </div>
          </header>

          <div className="w-full">
            <label
              className="text-xl font-normal mt-3"
              htmlFor="registration-password"
            >
              Password
            </label>
            <PasswordInput
              className="text-xl! hover:border-white py-2"
              id="registration-password"
              placeholder="Password"
              variant="black"
              {...form.register('password')}
            />
            {form.formState.errors.password ? (
              <Typography as="p" className="text-red-500 text-sm" size={'body'}>
                {form.formState.errors.password.message}
              </Typography>
            ) : null}

            <div className="mt-3">
              <Typography as="p" className="font-bold" size={'body'}>
                Password must contain at least:
              </Typography>
              <ul className="mt-2 flex flex-col gap-2">
                <li
                  className={
                    passwordRules.hasLetter ? 'text-white' : 'text-grey-500'
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    {passwordRules.hasLetter ? (
                      <CircleCheck
                        height={14}
                        primaryColor="#4ADE80"
                        width={14}
                      />
                    ) : (
                      <CircleIcon
                        height={14}
                        primaryColor="#000000"
                        width={14}
                      />
                    )}
                    1 letter
                  </span>
                </li>
                <li
                  className={
                    passwordRules.hasNumberOrSpecial
                      ? 'text-white'
                      : 'text-grey-500'
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    {passwordRules.hasNumberOrSpecial ? (
                      <CircleCheck
                        height={14}
                        primaryColor="#4ADE80"
                        width={14}
                      />
                    ) : (
                      <CircleIcon
                        height={14}
                        primaryColor="#000000"
                        width={14}
                      />
                    )}
                    1 number or special symbol (for example, # ? ! &)
                  </span>
                </li>
                <li
                  className={
                    passwordRules.hasMinLength ? 'text-white' : 'text-grey-500'
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    {passwordRules.hasMinLength ? (
                      <CircleCheck
                        height={14}
                        primaryColor="#4ADE80"
                        width={14}
                      />
                    ) : (
                      <CircleIcon
                        height={14}
                        primaryColor="#000000"
                        width={14}
                      />
                    )}
                    10 characters
                  </span>
                </li>
              </ul>
            </div>

            <Button
              className="mt-5 bg-green-400 w-full"
              disabled={isPending}
              size={'xl'}
              type="submit"
              variant="artistCard"
            >
              {isPending ? 'Creating account...' : 'Continue'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
