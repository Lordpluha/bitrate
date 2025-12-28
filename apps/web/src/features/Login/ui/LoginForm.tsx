'use client'


import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@shared/api'
import { ROUTES } from '@shared/routes'
import { GoggleIcon, LogoIconSm, SocialsAuthDivider } from '@shared/ui'
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
  toast
} from '@spotify/ui'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import { LoginFormData, loginSchema } from '../validation'

export const LoginForm = () => {
  const router = useRouter()
  const { mutate } = useMutation('post', '/auth/login', {
    onSuccess: () => {
      router.push(ROUTES.main)
    },
    onError: error => {
      toast.error(`Login error: ${JSON.stringify(error)}`)
    }
  })

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    },
    shouldFocusError: true
  })

  const onSubmit: SubmitHandler<LoginFormData> = async (body) => {
    await mutate({
      body
    })
  }

  return (
    <div className='flex flex-col items-stretch justify-center basis-[50%] gap-4 px-14 py-32 bg-contrast text-textContrast overflow-hidden rounded-[10px_0_0_10px] max-lg:basis-full max-lg:rounded-[10px] max-lg:p-6 box-border'>
      <div className='flex flex-col items-center'>
        <LogoIconSm />
        <Typography.Heading5 className='mt-2 text-center'>
          Login to your account
        </Typography.Heading5>
        <Typography.Paragraph className='text-center text-grey-500'>
          Welcome back! Please sign in to continue.
        </Typography.Paragraph>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col gap-2'
        >
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xl font-normal'>
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='Email Address'
                    variant='contrast'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xl font-normal'>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder='Password'
                    variant='contrast'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Link
            className='text-right text-green-500 hover:opacity-70 text-sm'
            href={ROUTES.auth.forgotPassword}
          >
            Forgot password?
          </Link>

          <div className='mt-4 flex flex-col items-stretch gap-4'>
            <Button
              variant='primary'
              className='rounded'
              type='submit'
            >
              Log in
            </Button>
            <SocialsAuthDivider />
            <Button variant='contrast'>
              <GoggleIcon className='mr-2' />
              <Typography.Paragraph>Continue with Google</Typography.Paragraph>
            </Button>
            <p className='text-lg text-center'>
              Don't have an account?{' '}
              <Link
                className='font-bold'
                href={ROUTES.auth.registration}
              >
                Sign up.
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  )
}
