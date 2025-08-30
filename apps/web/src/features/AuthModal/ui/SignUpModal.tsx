'use client'

import React from 'react'
import { zodResolver, useForm } from '@spotify/ui'
import { useRouter } from 'next/navigation'
import { GoggleIcon, LogoIconSm, SocialsAuthDivider } from '@shared/ui'
import Link from 'next/link'
import { useMutation } from '@shared/api'
import {
  Button,
  Input,
  PasswordInput,
  toast,
  Typography,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Label
} from '@spotify/ui'
import { Modal } from './Modal'
import { RegistrationFormData, registrationSchema } from '../../Registration/validation'
import { ROUTES } from '@shared/routes'

interface SignUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToLogin?: () => void
}

export const SignUpModal: React.FC<SignUpModalProps> = ({ open, onOpenChange, onSwitchToLogin }) => {
  const router = useRouter()
  const { mutate, isPending } = useMutation('post', '/auth/registration', {
    onSuccess: () => {
      onOpenChange(false)
      router.push('/login')
    },
    onError: error => {
      toast.error(`Registration error: ${JSON.stringify(error)}`)
    }
  })

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    shouldFocusError: true
  })

  const onSubmit = (data: RegistrationFormData) => {
    mutate({
      body: {
        email: data.email,
        password: data.password,
        username: data.fullName
      }
    })
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} className="max-w-[500px]">
      <div className='flex flex-col items-stretch justify-center gap-4 p-8 bg-contrast text-textContrast rounded-lg'>
        <div className='flex flex-col items-center'>
          <LogoIconSm />
          <Typography.Heading5 className='mt-2 text-center text-textContrast'>
            Sign Up
          </Typography.Heading5>
          <Typography.Paragraph className='text-center text-grey-500'>
            Sign up to enjoy the feature of Revolutie
          </Typography.Paragraph>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <Label
                      className='text-textContrast'
                      htmlFor="signup-fullName"
                    >
                      Full Name
                    </Label>
                    <FormControl>
                      <Input
                        id="signup-fullName"
                        placeholder='Full name'
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <Label
                      className='text-textContrast'
                      htmlFor="signup-email"
                    >
                      Email Address
                    </Label>
                    <FormControl>
                      <Input
                        id="signup-email"
                        placeholder='Email Address'

                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <Label
                      className='text-textContrast'
                      htmlFor="signup-password"
                    >
                      Password
                    </Label>
                    <FormControl>
                      <PasswordInput
                        id="signup-password"
                        placeholder='Password'

                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <Label
                      className='text-textContrast'
                      htmlFor="signup-confirmPassword"
                    >
                      Confirm Password
                    </Label>
                    <FormControl>
                      <PasswordInput
                        id="signup-confirmPassword"
                        placeholder='Confirm Password'
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='mt-2 flex flex-col items-stretch gap-4'>
              <Button
                variant='primary'
                className='rounded'
                type='submit'
                disabled={isPending}
              >
                {isPending ? 'Registering...' : 'Register'}
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
                Already have an account?{' '}
                <button
                  type="button"
                  className='font-bold text-green-500 hover:opacity-70 underline'
                  onClick={() => {
                    if (onSwitchToLogin) {
                      onSwitchToLogin()
                    } else {
                      onOpenChange(false)
                    }
                  }}
                >
                  Log in.
                </button>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  )
}
