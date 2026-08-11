'use client'

import {
  AuthFormFooter,
  AuthFormHeader,
  FloatingAuthField,
  useAuthenticatedRedirect,
} from '@features/Auth'
import { ROUTES } from '@shared/routes'
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
  Input,
  PasswordInput,
} from '@spotify/ui-react'
import Link from 'next/link'
import { useLoginForm } from '../model/useLoginForm'

export const LoginForm = () => {
  useAuthenticatedRedirect()
  const { form, isSubmitting, onSubmit } = useLoginForm()

  return (
    <div className="flex flex-col items-stretch justify-center basis-[50%] gap-4 px-14 py-32 bg-contrast text-text-contrast overflow-hidden rounded-[10px_0_0_10px] max-xl:basis-full max-xl:rounded-[10px] max-lg:p-6 box-border">
      <AuthFormHeader
        description="Welcome back! Please sign in to continue."
        title="Login to your account"
      />

      <Form {...form}>
        <form
          className="flex flex-col gap-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="pt-2">
                <FloatingAuthField label="Email Address">
                  <Input placeholder="" variant="contrast" {...field} />
                </FloatingAuthField>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="pt-2">
                <FloatingAuthField label="Password">
                  <PasswordInput placeholder="" variant="contrast" {...field} />
                </FloatingAuthField>
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

          <AuthFormFooter
            alternateHref={ROUTES.auth.registration}
            alternateLink="Sign up."
            alternateText="Don't have an account?"
            isSubmitting={isSubmitting}
            submitLabel="Log in"
          />
        </form>
      </Form>
    </div>
  )
}
