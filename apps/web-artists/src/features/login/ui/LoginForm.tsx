'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  GoogleIcon,
  FacebookArtistIcon,
  Input,
  LogoIcon,
  Typography,
  toast,
} from '@spotify/ui-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, type SubmitHandler } from 'react-hook-form'

import { loginSchema, type LoginFormData } from '../validation'

const ROUTES = {
  main: '/',
  auth: {
    forgotPassword: '/forgot-password',
    registration: '/registration',
  },
}

const buttonStyles = "border bg-black-800 text-white border-neutral-600 relative w-full inline-flex items-center justify-center";

const iconStyles = 'absolute left-4 top-1/2 -translate-y-1/2'

export const LoginForm = () => {
  const router = useRouter()
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  })

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    toast.success('Logged in successfully')
    router.push(ROUTES.main)
  }

  return (
    <div className="w-full max-w-120 flex flex-col items-stretch justify-center gap-4 px-14 py-20 bg-inherit text-white overflow-hidden rounded-[10px] max-lg:p-6 box-border">
      <div className="flex flex-col items-center">
        <LogoIcon primaryColor="#FFF" height={64} width={64} />
        <Typography as="h5" className="mt-2 text-center" size={'heading2'}>
          Welcome back!
        </Typography>
      </div>

      <form className="flex flex-col gap-2" onSubmit={form.handleSubmit(onSubmit)}>
        <label className="text-xl font-normal " htmlFor="email">
          Email Address
        </label>
        <Input
          id="email"
          placeholder="example@gmail.com"
          variant="black"
          className='text-xl! hover:border-white py-2'
          {...form.register('email')}
        />
        {form.formState.errors.email ? (
          <Typography as="p" className="text-red-500 text-sm" size={'body'}>
            {form.formState.errors.email.message}
          </Typography>
        ) : null}

        <div className="mt-4 flex flex-col items-stretch gap-4">
          <Button type="submit" className='bg-green-400' variant="artistCard" size={'xl'}>
            Continue
          </Button>

          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">or</span>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="artistCard"
              className={`${buttonStyles}`}
              size="xl"
            >
              <span className={`${iconStyles}`}>
                <GoogleIcon className="block" height={24} width={24} />
              </span>

              <span className="w-full text-center">
                <Typography as="p" size="heading6" className="leading-none">
                  Continue with Google
                </Typography>
              </span>
            </Button>

            <Button
              variant="artistCard"
              className={`${buttonStyles}`}
              size="xl"
            >
              <span className={`${iconStyles}`}>
                <FacebookArtistIcon className="block" height={24} width={24} />
              </span>

              <span className="w-full text-center">
                <Typography as="p" size="heading6" className="leading-none">
                  Continue with Facebook
                </Typography>
              </span>
            </Button>

          </div>

          <p className="text-lg text-center">
            Don't have an account?{' '}
            <Link className="font-bold" href={ROUTES.auth.registration}>
            <br />
              Sign up.
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
