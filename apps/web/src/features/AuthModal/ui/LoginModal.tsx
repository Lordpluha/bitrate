'use client'

import React, { useState } from 'react'

import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import {SocialsAuthDivider } from '@shared/ui'
import {
  Button,
  Input,
  InputProvider,
  PasswordInput,
  DynamicLabel,
  toast,
  Typography,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  LogoIcon
} from '@spotify/ui-react'
import { Modal } from './Modal'
import Link from 'next/link'
import { useMutation } from '@shared/api'
import { LoginFormData, loginSchema } from '../../Login/validation'
import { ROUTES } from '@shared/routes'

interface LoginModalProps {
  open: boolean
  onSuccess: (open: boolean) => void
  onSwitchToSignUp?: () => void
}

export const LoginModal: React.FC<LoginModalProps> = ({ open, onSuccess, onSwitchToSignUp }) => {
  const router = useRouter()
  const { mutate, isPending } = useMutation('post', '/auth/login', {
    onSuccess: () => {
      onSuccess(false)
      // Небольшая задержка для установки cookies, затем редирект
      setTimeout(() => {
        router.push('/main')
        // Принудительное обновление страницы для обновления состояния авторизации
        window.location.reload()
      }, 100)
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

  const onSubmit: SubmitHandler<LoginFormData> = body => {
    mutate({
      body
    })
  }

  return (
    <Modal open={open} onOpenChange={onSuccess} className="max-w-[500px] w-full">
      <div className='flex flex-col items-stretch justify-center gap-4 p-8 bg-contrast text-text-contrast rounded-lg'>
        <div className='flex flex-col items-center'>
          <LogoIcon width={48} height={48} />
          <Typography as="h5" size={'heading5'} className='mt-2 text-center text-text-contrast'>
            Sign in
          </Typography>
          <Typography as="p" size={'body'} className='text-center text-grey-500'>
            Please login to continue to your account.
          </Typography>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputProvider>
                      <div className="relative">
                        <DynamicLabel htmlFor="login-email" variant="contrast">
                          Email Address
                        </DynamicLabel>
                        <Input
                          id="login-email"
                          variant="contrast"
                          type="email"
                          placeholder=""
                          {...field}
                        />
                      </div>
                    </InputProvider>
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
                  <FormControl>
                    <InputProvider>
                      <div className="relative">
                        <DynamicLabel htmlFor="login-password" variant="contrast">
                          Password
                        </DynamicLabel>
                        <PasswordInput
                          id="login-password"
                          variant="contrast"
                          placeholder=""
                          {...field}
                        />
                      </div>
                    </InputProvider>
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

            <div className='mt-2 flex flex-col items-stretch gap-4'>
              <Button
                variant='primary'
                className='rounded'
                type='submit'
                disabled={isPending}
              >
                {isPending ? 'Logging in...' : 'Log in'}
              </Button>

              <SocialsAuthDivider />

              <Button
                variant='contrast'
                type='button'
              >
                {/* <GoggleIcon className='mr-2' /> */}
                <Typography as="p" size={'body'} className="text-text-contrast">
                  Continue with Google
                </Typography>
              </Button>

              <p className='text-base text-center text-text-contrast'>
                Don't have an account?{' '}
                <button
                  type="button"
                  className='font-bold text-green-500 hover:opacity-70 underline'
                  onClick={() => {
                    if (onSwitchToSignUp) {
                      onSwitchToSignUp()
                    } else {
                      onSuccess(false)
                    }
                  }}
                >
                  Sign up.
                </button>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  )
}
