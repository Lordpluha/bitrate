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
import { useRegistrationForm } from '../model/useRegistrationForm'

export const RegistrationForm = () => {
  useAuthenticatedRedirect()
  const { form, isSubmitting, onSubmit } = useRegistrationForm()

  return (
    <div className="flex flex-col items-stretch justify-center gap-4 px-14 py-32 bg-contrast text-text-contrast rounded-[10px_0_0_10px] basis-[50%] max-xl:basis-full max-xl:rounded-[10px] max-lg:p-6 box-border">
      <AuthFormHeader
        description={
          <>
            By clicking on sign-up, you agree to the <br />
            <Link className="text-primary hover:opacity-70" href={ROUTES.terms}>
              Spotify Terms and Conditions
            </Link>{' '}
            and{' '}
            <Link
              className="text-primary hover:opacity-70"
              href={ROUTES.privacy}
            >
              Privacy Policy
            </Link>
            .
          </>
        }
        title="Create your account for free and start listening"
      />

      <Form {...form}>
        <form
          className="flex flex-col gap-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="pt-2">
                <FloatingAuthField label="Full Name">
                  <Input placeholder="" variant="contrast" {...field} />
                </FloatingAuthField>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="pt-2">
                <FloatingAuthField label="Confirm Password">
                  <PasswordInput placeholder="" variant="contrast" {...field} />
                </FloatingAuthField>
                <FormMessage />
              </FormItem>
            )}
          />

          <AuthFormFooter
            alternateHref={ROUTES.auth.login}
            alternateLink="Log in."
            alternateText="Already have an account?"
            isSubmitting={isSubmitting}
            submitLabel="Register"
          />
        </form>
      </Form>
    </div>
  )
}
