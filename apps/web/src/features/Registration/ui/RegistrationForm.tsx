'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@shared/api'
import { ROUTES } from '@shared/routes'
import { SocialsAuthDivider } from '@shared/ui'
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  PasswordInput,
  Typography,
  toast,
  LogoIcon,
  GoogleIcon,
} from '@spotify/ui-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

import { type RegistrationFormData, registrationSchema } from '../validation'

export const RegistrationForm = () => {
  const router = useRouter()
  const { mutate } = useMutation('post', '/api/v1/auth/registration', {
    onSuccess: () => {
      router.push(ROUTES.auth.login)
    },
    onError: (error) => {
      toast.error(`Registration error:, ${JSON.stringify(error)}`)
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
    <div className='flex flex-col items-stretch justify-center gap-4 px-14 py-32 bg-contrast text-text-contrast rounded-[10px_0_0_10px] basis-[50%] max-xl:rounded-[10px] max-lg:p-6 box-border max-xl:w-full'>
      <div className='flex flex-col items-center'>
        <LogoIcon width={64} height={64} />
        <Typography as="h5" className='mt-2 text-center' size={'heading5'}>
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
              <FormItem>
                <FormLabel className="text-xl font-normal">Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Full name"
                    variant="contrast"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-normal">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email Address"
                    variant="contrast"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-normal">Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Password"
                    variant="contrast"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-normal">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Confirm Password"
                    variant="contrast"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-4 flex flex-col items-stretch gap-4">
            <Button className="rounded" type="submit" variant="primary">
              Register
            </Button>
            <SocialsAuthDivider />
            <Button variant="contrast">
              <GoogleIcon className="mr-2" width={20} height={20} />
              <Typography as="p" size={'body'}>
                Continue with Google
              </Typography>
            </Button>
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
