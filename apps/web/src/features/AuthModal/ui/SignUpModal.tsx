'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { SocialsAuthDivider } from '@shared/ui'
import Link from 'next/link'
import { useMutation } from '@shared/api'
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
} from '@spotify/ui-react'
import { Modal } from './Modal'
import {
  RegistrationFormData,
  registrationSchema
} from '../../Registration/validation'
import { ROUTES } from '@shared/routes'

interface SignUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToLogin?: () => void
}

export const SignUpModal: React.FC<SignUpModalProps> = ({
  open,
  onOpenChange,
  onSwitchToLogin
}) => {
  const router = useRouter()

  const { mutate: registerMutate, isPending: isRegistering } = useMutation(
    'post',
    '/auth/registration',
    {
      onSuccess: async (_, variables) => {
        try {
          const loginResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: variables.body.email,
                password: variables.body.password
              })
            }
          )

          if (loginResponse.ok) {
            onOpenChange(false)

            setTimeout(() => {
              router.push('/main')

              window.location.reload()
            }, 100)
          } else {
            toast.success('Registration successful! Please log in.')
            onOpenChange(false)
            router.push('/auth/login')
          }
        } catch (error) {
          console.error('Auto-login failed:', error)
          toast.success('Registration successful! Please log in.')
          onOpenChange(false)
          router.push('/auth/login')
        }
      },
      onError: error => {
        toast.error(`Registration error: ${JSON.stringify(error)}`)
      }
    }
  )

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
    registerMutate({
      body: {
        email: data.email,
        password: data.password,
        username: data.fullName
      }
    })
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      className='max-w-[500px]  w-full'
    >
      <div className='flex flex-col items-stretch justify-center gap-4 p-8 bg-contrast text-text-contrast rounded-lg'>
        <div className='flex flex-col items-center'>
          {/* <LogoIconSm /><PlusIcon /> */}
          <Typography as='h5' size='heading5' className='mt-2 text-center text-text-contrast'>
            Sign Up
          </Typography>
          <Typography as='p' size='body' className='text-center text-grey-500'>
            Sign up to enjoy the feature of Revolutie
          </Typography>
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
                  <FormControl>
                    <div className='relative'>
                      <DynamicLabel
                        htmlFor='signup-fullname'
                        variant='contrast'
                      >
                        Full Name
                      </DynamicLabel>
                      <Input
                        id='signup-fullname'
                        variant='contrast'
                        placeholder=''
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
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className='relative'>
                      <DynamicLabel
                        htmlFor='signup-email'
                        variant='contrast'
                      >
                        Email Address
                      </DynamicLabel>
                      <Input
                        id='signup-email'
                        variant='contrast'
                        type='email'
                        placeholder=''
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
                    <div className='relative'>
                      <DynamicLabel
                        htmlFor='signup-password'
                        variant='contrast'
                      >
                        Password
                      </DynamicLabel>
                      <PasswordInput
                        id='signup-password'
                        variant='contrast'
                        placeholder=''
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
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className='relative'>
                      <DynamicLabel
                        htmlFor='signup-confirm-password'
                        variant='contrast'
                      >
                        Confirm Password
                      </DynamicLabel>
                      <PasswordInput
                        id='signup-confirm-password'
                        variant='contrast'
                        placeholder=''
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='mt-2 flex flex-col items-stretch gap-4'>
              <Button
                variant='primary'
                className='rounded'
                type='submit'
                disabled={isRegistering}
              >
                {isRegistering ? 'Registering...' : 'Register'}
              </Button>

              <SocialsAuthDivider />

              <Button
                variant='contrast'
                type='button'
              >
                {/* <GoggleIcon className='mr-2' /> */}
                <Typography as='p' size='body' className='text-text-contrast'>
                  Continue with Google
                </Typography>
              </Button>

              <p className='text-base text-center text-text-contrast'>
                Already have an account?{' '}
                <button
                  type='button'
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
