'use client'

import { Button, Input, Typography } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { SocialAuthButtons } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import type { UseFormReturn } from 'react-hook-form'
import type { RegistrationFormData } from '../validation/RegistrationForm.validation'

export type RegistrationEmailStepProps = {
  form: UseFormReturn<RegistrationFormData>
  onSubmit: () => void
}

/** Step one: collect an email address and check that it is still free. */
export const RegistrationEmailStep = ({
  form,
  onSubmit,
}: RegistrationEmailStepProps) => {
  const { t, tMessage } = useI18n()
  return (
    <form className="flex flex-col gap-2" onSubmit={onSubmit}>
      <label className="text-xl font-normal" htmlFor="registration-email">
        {t('auth.emailAddress')}
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
          {tMessage(form.formState.errors.email.message)}
        </Typography>
      ) : null}

      <div className="mt-4 flex flex-col items-stretch gap-4">
        <Button size={'xl'} type="submit" variant="primary">
          {t('common.continue')}
        </Button>

        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">{t('common.or')}</span>
        </div>

        <SocialAuthButtons />

        <p className="text-lg text-center">
          {t('auth.registration.haveAccount')}{' '}
          <Link className="font-bold" to={ROUTES.auth.login}>
            <br />
            {t('auth.registration.logIn')}
          </Link>
        </p>
      </div>
    </form>
  )
}
