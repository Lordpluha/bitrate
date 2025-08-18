'use client'

import React, { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { GoggleIcon, LogoIconSm, PasswordCheckIcon, PasswordNoCheckIcon } from '@shared/ui'
import { Button, Input, Typography } from '@spotify/ui'
import Link from 'next/link'
import { SocialLoginDivider } from './SocialLoginDivider'
import { useMutation } from '@shared/api'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@spotify/ui"

const schema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Too short')
      .max(30, 'Max length is 30 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Only letters and spaces allowed'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine((val) => /[a-z]/.test(val), {
        message: 'Password must include at least one lowercase letter',
      })
      .refine((val) => /[A-Z]/.test(val), {
        message: 'Password must include at least one uppercase letter',
      })
      .refine((val) => /\d/.test(val), {
        message: 'Password must include at least one number',
      })
      .refine((val) => /[@$!%*?&]/.test(val), {
        message: 'Password must include at least one special character',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export const RegistrationForm = () => {
  const { mutate } = useMutation("post", "/auth/registration")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
    mutate({
      body: {
        email: data.email,
        password: data.password,
        username: data.fullName,
      }
    })
  }

  return (
    <div className="flex flex-col items-stretch justify-center basis-[50%] gap-4 px-14 py-32 bg-contrast text-textForContrast overflow-hidden rounded-[10px_0_0_10px] max-lg:basis-full max-lg:rounded-[10px] max-lg:p-6 box-border">
      <div className="flex flex-col items-center">
        <LogoIconSm />
        <Typography.Heading5 className="mt-2 text-center">
          Create your account for free and start listening
        </Typography.Heading5>
        <Typography.Paragraph className="text-center text-greyLight">
          By clicking on sign-up, you agree to the <br />
          <Link className="text-greenMain hover:opacity-70" href={'#'}>
            Spotify Terms and Conditions
          </Link>{' '}
          and{' '}
          <Link className="text-greenMain hover:opacity-70" href={'#'}>
            Privacy Policy
          </Link>
          .
        </Typography.Paragraph>
      </div>

      <Form {...(form)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-normal">Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Full name"
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
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      variant="forContrast"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-greyLight hover:text-textForContrast"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <PasswordNoCheckIcon />
                      ) : (
                        <PasswordCheckIcon />
                      )}
                    </button>
                  </div>
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
                <FormLabel className="text-xl font-normal">Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      variant="forContrast"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-greyLight hover:text-textForContrast"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <PasswordNoCheckIcon />
                      ) : (
                        <PasswordCheckIcon />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-4 flex flex-col items-stretch gap-4">
            <Button variant="primary" className="rounded" type="submit">
              Register
            </Button>
            <SocialLoginDivider />
            <Button variant="forContrast" size="sm">
              <GoggleIcon className="mr-2" />
              <Typography.Paragraph>Continue with Google</Typography.Paragraph>
            </Button>
            <p className="text-lg text-center">
              Already have an account?{' '}
              <Link className="font-bold" href={'login'}>
                Log in.
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  )
}
