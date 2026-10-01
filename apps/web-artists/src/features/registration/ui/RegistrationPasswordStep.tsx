'use client'

import {
  ArrowrleftIcon,
  Button,
  Checkbox,
  Label,
  PasswordInput,
  Typography,
} from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes/routes'
import { Controller, type UseFormReturn } from 'react-hook-form'
import type { PasswordRules } from '../model/useRegistrationForm'
import type { RegistrationFormData } from '../validation/RegistrationForm.validation'
import { PasswordRequirements } from './PasswordRequirements'

export type RegistrationPasswordStepProps = {
  form: UseFormReturn<RegistrationFormData>
  rules: PasswordRules
  isPending: boolean
  onBack: () => void
  onSubmit: () => void
}

/** Step two: choose a password, with live feedback on what it still needs. */
export const RegistrationPasswordStep = ({
  form,
  rules,
  isPending,
  onBack,
  onSubmit,
}: RegistrationPasswordStepProps) => (
  <form className="flex flex-col gap-3" onSubmit={onSubmit}>
    <header className="flex flex-col items-start w-full gap-4">
      <div className="h-0.5 w-full rounded-full overflow-hidden flex">
        <div className="h-full bg-primary w-1/2" />
        <div className="h-full bg-neutral-600 w-1/2" />
      </div>

      <div className="flex items-start gap-3">
        <button
          aria-label="Back to email step"
          className="mt-1 text-grey-500 hover:text-white transition-colors duration-300 [&_path]:opacity-70 hover:[&_path]:opacity-100"
          onClick={onBack}
          type="button"
        >
          <ArrowrleftIcon height={20} width={20} />
        </button>
        <div>
          <Typography as="p" className="text-grey-500" size={'body'}>
            Step 2 of 2
          </Typography>
          <Typography as="h6" className="mt-1" size={'heading6'}>
            Create a password
          </Typography>
        </div>
      </div>
    </header>

    <div className="w-full">
      <label
        className="text-xl font-normal mt-3"
        htmlFor="registration-password"
      >
        Password
      </label>
      <PasswordInput
        className="text-xl! hover:border-white py-2"
        id="registration-password"
        placeholder="Password"
        variant="black"
        {...form.register('password')}
      />
      {form.formState.errors.password ? (
        <Typography as="p" className="text-red-500 text-sm" size={'body'}>
          {form.formState.errors.password.message}
        </Typography>
      ) : null}

      <PasswordRequirements rules={rules} />

      <div className="mt-5 flex flex-col gap-3 text-sm">
        <Controller
          control={form.control}
          name="acceptLegal"
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-1">
              <div className="flex items-start gap-3">
                <Checkbox
                  aria-invalid={fieldState.invalid}
                  checked={field.value}
                  id="registration-accept-legal"
                  onBlur={field.onBlur}
                  onCheckedChange={field.onChange}
                />
                <Label
                  className="font-normal leading-snug"
                  htmlFor="registration-accept-legal"
                >
                  I am at least 16 years old, I accept the{' '}
                  <a
                    className="text-primary hover:opacity-70"
                    href={ROUTES.terms}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Terms of Use
                  </a>{' '}
                  and{' '}
                  <a
                    className="text-primary hover:opacity-70"
                    href={ROUTES.community}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Community Guidelines
                  </a>
                  , and I have read the{' '}
                  <a
                    className="text-primary hover:opacity-70"
                    href={ROUTES.privacy}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Privacy Policy
                  </a>
                  .
                </Label>
              </div>
              {fieldState.error ? (
                <Typography as="p" className="text-red-500" size={'body'}>
                  {fieldState.error.message}
                </Typography>
              ) : null}
            </div>
          )}
        />
        <Controller
          control={form.control}
          name="acceptArtistAgreement"
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-1">
              <div className="flex items-start gap-3">
                <Checkbox
                  aria-invalid={fieldState.invalid}
                  checked={field.value}
                  id="registration-accept-artist-agreement"
                  onBlur={field.onBlur}
                  onCheckedChange={field.onChange}
                />
                <Label
                  className="font-normal leading-snug"
                  htmlFor="registration-accept-artist-agreement"
                >
                  I accept the{' '}
                  <a
                    className="text-primary hover:opacity-70"
                    href={ROUTES.artistAgreement}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Artist Agreement
                  </a>
                  .
                </Label>
              </div>
              {fieldState.error ? (
                <Typography as="p" className="text-red-500" size={'body'}>
                  {fieldState.error.message}
                </Typography>
              ) : null}
            </div>
          )}
        />
      </div>

      <Button
        className="mt-5 w-full"
        disabled={isPending}
        size={'xl'}
        type="submit"
        variant="primary"
      >
        {isPending ? 'Creating account...' : 'Continue'}
      </Button>
    </div>
  </form>
)
