'use client'

import {
  FloatingAuthField,
  OAuthButtons,
  useAuthenticatedRedirect,
} from '@features/Auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@shared/api/client'
import { showApiErrorToast } from '@shared/api/feedback'
import { ROUTES } from '@shared/routes'
import { SocialsAuthDivider } from '@shared/ui'
import {
  Button,
  Form,
  FormField,
  FormItem,
  FormMessage,
  Input,
  LogoIcon,
  PasswordInput,
  Typography,
} from '@spotify/ui-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

import { type RegistrationFormData, registrationSchema } from '../validation'

export const RegistrationForm = () => {
  useAuthenticatedRedirect()
  const router = useRouter()
  const { mutate } = useMutation('post', '/api/v1/auth/registration', {
    onSuccess: () => {
      router.push(ROUTES.auth.login)
    },
    onError: (error) => {
      showApiErrorToast(error, 'Unable to create account. Please try again.')
    },
    meta: {
      suppressErrorToast: true,
    },
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

  const onSubmit = async (data: RegistrationFormData) => {
    await mutate({
      body: {
        email: data.email,
        password: data.password,
        username: data.fullName,
      },
    })
  }

  return (
    <div className="flex flex-col items-stretch justify-center gap-4 px-14 py-32 bg-contrast text-text-contrast rounded-[10px_0_0_10px] basis-[50%] max-xl:basis-full max-xl:rounded-[10px] max-lg:p-6 box-border">
      <div className="flex flex-col items-center">
        <LogoIcon height={64} width={64} />
        <Typography as="h5" className="mt-2 text-center" size={'heading5'}>
          Create your account for free and start listening
        </Typography>
        <Typography as="p" className="text-center text-grey-500" size={'body'}>
          By clicking on sign-up, you agree to the <br />
          <Link className="text-green-500 hover:opacity-70" href={ROUTES.terms}>
            Spotify Terms and Conditions
          </Link>{' '}
          and{' '}
          <Link
            className="text-green-500 hover:opacity-70"
            href={ROUTES.privacy}
          >
            Privacy Policy
          </Link>
          .
        </Typography>
      </div>

      <Form {...form}>
        <form
          className="flex flex-col gap-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="pt-2">
                <FloatingAuthField label="Full Name">
                  <Input placeholder="" variant="contrast" {...field} />
                </FloatingAuthField>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="pt-2">
                <FloatingAuthField label="Email Address">
                  <Input placeholder="" variant="contrast" {...field} />
                </FloatingAuthField>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="pt-2">
                <FloatingAuthField label="Password">
                  <PasswordInput placeholder="" variant="contrast" {...field} />
                </FloatingAuthField>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="pt-2">
                <FloatingAuthField label="Confirm Password">
                  <PasswordInput placeholder="" variant="contrast" {...field} />
                </FloatingAuthField>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-4 flex flex-col items-stretch gap-4">
            <Button className="rounded" type="submit" variant="primary">
              Register
            </Button>
            <SocialsAuthDivider />
            <OAuthButtons />
            <p className="text-lg text-center">
              Already have an account?{' '}
              <Link className="font-bold" href={ROUTES.auth.login}>
                Log in.
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  )
}
