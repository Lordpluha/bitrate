'use client'

import {
  Button,
  FacebookArtistIcon,
  GoogleIcon,
  Input,
  LogoIcon,
  PasswordInput,
  Typography,
} from '@bitrate/ui-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { apiBaseUrl } from '@shared/api'
import { getLoginDestination } from '@shared/routes/authRedirect'
import { ROUTES } from '@shared/routes/routes'
import { Link, useRouter, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useLogin } from '../api/useLogin'
import { type LoginFormData, loginSchema } from '../validation'
import { TwoFactorLoginForm } from './TwoFactorLoginForm'

const buttonStyles =
  'border bg-black-800 text-white border-neutral-600 relative w-full inline-flex items-center justify-center'

const iconStyles = 'absolute left-4 top-1/2 -translate-y-1/2'

export const LoginForm = () => {
  const router = useRouter()
  const search = useSearch({ from: '/login' })
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const completeLogin = async () => {
    await router.navigate({
      href: getLoginDestination(search.next),
      replace: true,
    })
    await router.invalidate()
  }
  const { mutate: login, isPending } = useLogin({
    onSuccess: async (data) => {
      if (data?.requires2fa) {
        form.resetField('password')
        setRequiresTwoFactor(true)
        return
      }
      await completeLogin()
    },
    onError: (error) => {
      const needsVerification =
        error.message === 'Email address is not verified'
      form.setError('root', {
        type: needsVerification ? 'emailVerification' : 'server',
        message: needsVerification
          ? 'Verify your email before signing in.'
          : 'Invalid email or password. Please try again.',
      })
    },
  })
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<LoginFormData> = (data) => {
    login(data)
  }

  if (requiresTwoFactor) {
    return (
      <TwoFactorLoginForm
        onBack={() => setRequiresTwoFactor(false)}
        onVerified={completeLogin}
      />
    )
  }

  return (
    <div className="w-full max-w-120 flex flex-col items-stretch justify-center gap-4 px-14 py-20 bg-inherit text-white overflow-hidden rounded-[10px] max-lg:p-6 box-border">
      <div className="flex flex-col items-center">
        <LogoIcon height={64} width={64} />
        <Typography as="h1" className="mt-2 text-center" size={'heading2'}>
          Welcome back!
        </Typography>
      </div>

      <form
        className="flex flex-col gap-2"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <label className="text-xl font-normal " htmlFor="email">
          Email Address
        </label>
        <Input
          autoComplete="email"
          className="text-xl! hover:border-white py-2 focus-visible:ring-ring"
          id="email"
          placeholder="example@gmail.com"
          type="email"
          variant="black"
          {...form.register('email')}
        />
        {form.formState.errors.email ? (
          <Typography as="p" className="text-red-500 text-sm" size={'body'}>
            {form.formState.errors.email.message}
          </Typography>
        ) : null}

        <label className="text-xl font-normal mt-3" htmlFor="password">
          Password
        </label>
        <PasswordInput
          autoComplete="current-password"
          className="text-xl! hover:border-white py-2 focus-visible:ring-ring"
          id="password"
          placeholder="Password"
          variant="black"
          {...form.register('password')}
        />
        {form.formState.errors.password ? (
          <Typography as="p" className="text-red-500 text-sm" size={'body'}>
            {form.formState.errors.password.message}
          </Typography>
        ) : null}

        <div className="mt-4 flex flex-col items-stretch gap-4">
          {form.formState.errors.root && (
            <div role="alert">
              <p>{form.formState.errors.root.message}</p>
              {form.formState.errors.root.type === 'emailVerification' && (
                <Link
                  className="font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  search={{ email: form.getValues('email'), next: search.next }}
                  to={ROUTES.auth.verifyEmail}
                >
                  Verify email
                </Link>
              )}
            </div>
          )}
          <Button
            disabled={isPending}
            size={'xl'}
            type="submit"
            variant="primary"
          >
            {isPending ? 'Logging in...' : 'Continue'}
          </Button>

          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">or</span>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              asChild
              className={`${buttonStyles}`}
              size="xl"
              variant="artistCard"
            >
              <a href={`${apiBaseUrl}/api/v1/artists/auth/oauth/google`}>
                <span className={`${iconStyles}`}>
                  <GoogleIcon className="block" height={24} width={24} />
                </span>

                <span className="w-full text-center">
                  <Typography as="p" className="leading-none" size="heading6">
                    Continue with Google
                  </Typography>
                </span>
              </a>
            </Button>

            <Button
              asChild
              className={`${buttonStyles}`}
              size="xl"
              variant="artistCard"
            >
              <a href={`${apiBaseUrl}/api/v1/artists/auth/oauth/facebook`}>
                <span className={`${iconStyles}`}>
                  <FacebookArtistIcon
                    className="block"
                    height={24}
                    width={24}
                  />
                </span>

                <span className="w-full text-center">
                  <Typography as="p" className="leading-none" size="heading6">
                    Continue with Facebook
                  </Typography>
                </span>
              </a>
            </Button>
          </div>

          <p className="text-lg text-center">
            Don't have an account?{' '}
            <Link className="font-bold" to={ROUTES.auth.registration}>
              <br />
              Sign up.
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
