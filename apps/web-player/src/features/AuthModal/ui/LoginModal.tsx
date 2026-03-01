'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@shared/api/client'
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
import type React from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { type LoginFormData, loginSchema } from '../../Login/validation'
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
      className="max-w-[500px] w-full"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col items-stretch justify-center gap-4 p-8 bg-contrast text-text-contrast rounded-lg">
        <div className="flex flex-col items-center">
          <LogoIcon height={64} width={64} />
          <Typography
            as="h5"
            className="mt-2 text-center text-text-contrast"
            size={'heading5'}
          >
            Sign in
          </Typography>
          <Typography
            as="p"
            className="text-center text-grey-500"
            size={'body'}
          >
            Please login to continue to your account.
          </Typography>
        </div>

        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
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
                          placeholder=""
                          type="email"
                          variant="contrast"
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
                          placeholder=""
                          variant="contrast"
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
                className="rounded"
                disabled={isLoading}
                isLoading={isLoading}
                type="submit"
                variant="primary"
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </Button>

              <SocialsAuthDivider />

              <Button type="button" variant="contrast">
                <GoogleIcon className="mr-2" />
                <Typography as="p" className="text-text-contrast" size={'body'}>
                  Continue with Google
                </Typography>
              </Button>

              <p className="text-base text-center text-text-contrast">
                Don't have an account?{' '}
                <button
                  className="font-bold text-green-500 hover:opacity-70 underline"
                  onClick={() => {
                    if (onSwitchToSignUp) {
                      onSwitchToSignUp()
                    } else {
                      onOpenChange(false)
                    }
                  }}
                  type="button"
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
