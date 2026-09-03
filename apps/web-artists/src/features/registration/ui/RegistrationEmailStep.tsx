'use client'

import { Button, Input, Typography } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes/routes'
import Link from 'next/link'
import type { UseFormReturn } from 'react-hook-form'
import type { RegistrationFormData } from '../validation/RegistrationForm.validation'
import { SocialAuthButtons } from './SocialAuthButtons'

export type RegistrationEmailStepProps = {
  form: UseFormReturn<RegistrationFormData>
  onSubmit: () => void
}

/** Step one: collect an email address and check that it is still free. */
export const RegistrationEmailStep = ({
  form,
  onSubmit,
}: RegistrationEmailStepProps) => (
  <form className="flex flex-col gap-2" onSubmit={onSubmit}>
    <label className="text-xl font-normal" htmlFor="registration-email">
      Email Address
    </label>
    <Input
      className="text-xl! hover:border-white py-2"
      id="registration-email"
      placeholder="example@gmail.com"
      variant="black"
      {...form.register('email')}
    />
    {form.formState.errors.email ? (
      <Typography as="p" className="text-red-500 text-sm" size={'body'}>
        {form.formState.errors.email.message}
      </Typography>
    ) : null}

    <div className="mt-4 flex flex-col items-stretch gap-4">
      <Button
        className="bg-green-400"
        size={'xl'}
        type="submit"
        variant="artistCard"
      >
        Continue
      </Button>

      <div className="flex items-center justify-center gap-2">
        <span className="text-2xl">or</span>
      </div>

      <SocialAuthButtons />

      <p className="text-lg text-center">
        Already have an account?{' '}
        <Link className="font-bold" href={ROUTES.auth.login}>
          <br />
          Log in.
        </Link>
      </p>
    </div>
  </form>
)
