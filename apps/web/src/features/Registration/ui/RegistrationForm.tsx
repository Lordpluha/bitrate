'use client'

import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { GoggleIcon, LogoIconSm } from '@shared/ui'
import { Button, Input, PasswordInput, Typography } from '@spotify/ui'
import Link from 'next/link'
import { SocialLoginDivider } from './SocialLoginDivider'
import { useMutation } from '@shared/api'
import { registrationSchema, type RegistrationFormData } from '@shared/validation'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@spotify/ui"

export const RegistrationForm = () => {
  const router = useRouter()
  const { mutate } = useMutation("post", "/auth/registration", {
    onSuccess: () => {
      router.push('/login')
    },
    onError: (error) => {
      console.error('Registration error:', error)
    }
  })

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (data: RegistrationFormData) => {
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-normal">Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Confirm Password"
                    variant="forContrast"
                    {...field}
                  />
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
