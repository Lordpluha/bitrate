'use client'

import React, { useState } from 'react'
import { zodResolver, SubmitHandler, useForm } from '@spotify/ui'
import { useRouter } from 'next/navigation'
import { GoggleIcon, LogoIconSm, SocialsAuthDivider } from '@shared/ui'
import {
  Button,
  Input,
  PasswordInput,
  DynamicLabel,
  toast,
  Typography,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@spotify/ui'
import { Modal } from './Modal'
import Link from 'next/link'
import { useMutation } from '@shared/api'
import { LoginFormData, loginSchema } from '../../Login/validation'
import { ROUTES } from '@shared/routes'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToSignUp?: () => void
}

export const LoginModal: React.FC<LoginModalProps> = ({ open, onOpenChange, onSwitchToSignUp }) => {
  const router = useRouter()
  const { mutate, isPending } = useMutation('post', '/auth/login', {
    onSuccess: () => {
      onOpenChange(false)
      router.push('/main')
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
    <Modal open={open} onOpenChange={onOpenChange} className="max-w-[500px] w-full">
      <div className='flex flex-col items-stretch justify-center gap-4 p-8 bg-contrast text-textContrast rounded-lg'>
        <div className='flex flex-col items-center'>
          <LogoIconSm />
          <Typography.Heading5 className='mt-2 text-center text-textContrast'>
            Sign in
          </Typography.Heading5>
          <Typography.Paragraph className='text-center text-grey-500'>
            Please login to continue to your account.
          </Typography.Paragraph>
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
                <GoggleIcon className='mr-2' />
                <Typography.Paragraph className="text-textContrast">
                  Continue with Google
                </Typography.Paragraph>
              </Button>

              <p className='text-base text-center text-textContrast'>
                Don't have an account?{' '}
                <button
                  type="button"
                  className='font-bold text-green-500 hover:opacity-70 underline'
                  onClick={() => {
                    if (onSwitchToSignUp) {
                      onSwitchToSignUp()
                    } else {
                      onOpenChange(false)
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
