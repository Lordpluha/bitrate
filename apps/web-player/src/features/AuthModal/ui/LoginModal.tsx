'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@shared/api'
import { ROUTES } from '@shared/routes'
import { SocialsAuthDivider } from '@shared/ui'
import {
  Button,
  DynamicLabel,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  GoogleIcon,
  Input,
  InputProvider,
  LogoIcon,
  PasswordInput,
  Typography,
  toast,
} from '@spotify/ui-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { LoginFormData, loginSchema } from '../../Login/validation'
import { Modal } from './Modal'

interface LoginModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToSignUp?: () => void
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onOpenChange,
  onSwitchToSignUp,
}) => {
  const router = useRouter()
  const { mutate, isPending: isLoading } = useMutation(
    'post',
    '/api/v1/auth/login',
    {
      onSuccess: () => {
        onOpenChange(false)
        void router.push('/main')
      },
      onError: (error) => {
        toast.error(`Login error: ${JSON.stringify(error)}`)
      },
    },
  )

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
    shouldFocusError: true,
  })

  const onSubmit: SubmitHandler<LoginFormData> = (body) => {
    mutate({
      body,
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="max-w-[500px] w-full"
    >
      <div className="flex flex-col items-stretch justify-center gap-4 p-8 bg-contrast text-text-contrast rounded-lg">
        <div className="flex flex-col items-center">
          <LogoIcon width={64} height={64} />
          <Typography
            as="h5"
            size={'heading5'}
            className="mt-2 text-center text-text-contrast"
          >
            Sign in
          </Typography>
          <Typography
            as="p"
            size={'body'}
            className="text-center text-grey-500"
          >
            Please login to continue to your account.
          </Typography>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputProvider>
                      <div className="relative">
                        <DynamicLabel
                          htmlFor="login-password"
                          variant="contrast"
                        >
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
              className="text-right text-green-500 hover:opacity-70 text-sm"
              href={ROUTES.auth.forgotPassword}
            >
              Forgot password?
            </Link>

            <div className="mt-2 flex flex-col items-stretch gap-4">
              <Button
                variant="primary"
                className="rounded"
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </Button>

              <SocialsAuthDivider />

              <Button variant="contrast" type="button">
                <GoogleIcon className="mr-2" />
                <Typography as="p" size={'body'} className="text-text-contrast">
                  Continue with Google
                </Typography>
              </Button>

              <p className="text-base text-center text-text-contrast">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="font-bold text-green-500 hover:opacity-70 underline"
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
