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
import type { ComponentProps } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import {
  type RegistrationFormData,
  registrationSchema,
} from '../../Registration/validation'
import { Modal } from './Modal'

interface SignUpModalProps extends ComponentProps<typeof Modal> {
  onSwitchToLogin?: () => void
}

export const SignUpModal: React.FC<SignUpModalProps> = ({
  onSwitchToLogin,
  ...modalProps
}) => {
  const router = useRouter()

  const { mutate: registerMutate, isPending: isRegistering } = useMutation(
    'post',
    '/api/v1/auth/registration',
    {
      onSuccess: () => {
        toast.success('Registration successful! Please log in.')
        if (onSwitchToLogin) {
          onSwitchToLogin()
        } else {
          router.push(ROUTES.auth.login)
        }
      },
      onError: (error) => {
        toast.error(`Registration error: ${JSON.stringify(error)}`)
      },
    },
  )

  const defaultValues: RegistrationFormData = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  }

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues,
    shouldFocusError: true,
  })

  const onSubmit: SubmitHandler<RegistrationFormData> = (data) => {
    registerMutate({
      body: {
        email: data.email,
        password: data.password,
        username: data.fullName,
      },
    })
  }

  return (
    <Modal {...modalProps} className="max-w-125  w-full">
      <div className="flex flex-col items-stretch justify-center gap-4 p-8 bg-contrast text-text-contrast rounded-lg">
        <div className="flex flex-col items-center">
          <LogoIcon height={64} width={64} />
          <Typography
            as="h5"
            className="mt-2 text-center text-text-contrast"
            size="heading5"
          >
            Sign Up
          </Typography>
          <Typography as="p" className="text-center text-grey-500" size="body">
            Sign up to enjoy the feature of Revolutie
          </Typography>
        </div>

        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputProvider>
                      <div className="relative">
                        <DynamicLabel
                          htmlFor="signup-fullname"
                          variant="contrast"
                        >
                          Full Name
                        </DynamicLabel>
                        <Input
                          id="signup-fullname"
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

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputProvider>
                      <div className="relative">
                        <DynamicLabel htmlFor="signup-email" variant="contrast">
                          Email Address
                        </DynamicLabel>
                        <Input
                          id="signup-email"
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
                          htmlFor="signup-password"
                          variant="contrast"
                        >
                          Password
                        </DynamicLabel>
                        <PasswordInput
                          id="signup-password"
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputProvider>
                      <div className="relative">
                        <DynamicLabel
                          htmlFor="signup-confirm-password"
                          variant="contrast"
                        >
                          Confirm Password
                        </DynamicLabel>
                        <PasswordInput
                          id="signup-confirm-password"
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

            <div className="mt-2 flex flex-col items-stretch gap-4">
              <Button
                aria-busy={isRegistering}
                className="rounded"
                disabled={isRegistering}
                isLoading={isRegistering}
                type="submit"
                variant="primary"
              >
                Register
              </Button>

              <SocialsAuthDivider />

              <Button type="button" variant="contrast">
                <GoogleIcon className="mr-2" />
                <Typography as="p" className="text-text-contrast" size="body">
                  Continue with Google
                </Typography>
              </Button>

              <p className="text-base text-center text-text-contrast">
                Already have an account?{' '}
                {onSwitchToLogin ? (
                  <button
                    className="font-bold text-green-500 hover:opacity-70 underline"
                    onClick={onSwitchToLogin}
                    type="button"
                  >
                    Log in.
                  </button>
                ) : (
                  <Link
                    className="font-bold text-green-500 hover:opacity-70 underline"
                    href={ROUTES.auth.login}
                  >
                    Log in.
                  </Link>
                )}
              </p>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  )
}
