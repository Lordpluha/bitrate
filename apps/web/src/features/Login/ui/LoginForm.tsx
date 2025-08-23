'use client'

import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { GoggleIcon, LogoIconSm } from '@shared/ui'
import { Button, Input, PasswordInput, Typography } from '@spotify/ui'
import Link from 'next/link'
import { SocialLoginDivider } from './SocialLoginDivider'
import { useMutation } from '@shared/api'
import { loginSchema, type LoginFormData } from '@shared/validation'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@spotify/ui"

export const LoginForm = () => {
  const router = useRouter()
  const { mutate } = useMutation("post", "/auth/login", {
    onSuccess: () => {
      router.push('/main')
    },
    onError: (error) => {
      console.error('Login error:', error)
    }
  })

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: LoginFormData) => {
    console.log(data)
    mutate({
      body: {
        email: data.email,
        password: data.password,
      }
    })
  }

  return (
    <div className="flex flex-col items-stretch justify-center basis-[50%] gap-4 px-14 py-32 bg-contrast text-textForContrast overflow-hidden rounded-[10px_0_0_10px] max-lg:basis-full max-lg:rounded-[10px] max-lg:p-6 box-border">
      <div className="flex flex-col items-center">
        <LogoIconSm />
        <Typography.Heading5 className="mt-2 text-center">
          Login to your account
        </Typography.Heading5>
        <Typography.Paragraph className="text-center text-greyLight">
          Welcome back! Please sign in to continue.
        </Typography.Paragraph>
      </div>

      <Form {...(form)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-normal">Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email Address"
                    variant="forContrast"
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
                    variant="forContrast"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-right">
            <Link
              className="text-greenMain hover:opacity-70 text-sm"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>

          <div className="mt-4 flex flex-col items-stretch gap-4">
            <Button variant="primary" className="rounded" type="submit">
              Log In
            </Button>
            <SocialLoginDivider />
            <Button variant="forContrast" size="sm">
              <GoggleIcon className="mr-2" />
              <Typography.Paragraph>Continue with Google</Typography.Paragraph>
            </Button>
            <p className="text-lg text-center">
              Don't have an account?{' '}
              <Link className="font-bold" href={'registration'}>
                Sign up.
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  )
}
