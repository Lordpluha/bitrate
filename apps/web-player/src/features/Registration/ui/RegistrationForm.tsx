'use client'

import {
  Button,
  Form,
  FormField,
  FormItem,
  Input,
  PasswordInput,
} from '@bitrate/ui-react'
import type { RegistrationFormData } from '@entities/User'
import {
  AuthField,
  AuthFooterLink,
  AuthHeading,
  AuthOrDivider,
  LegalAcceptanceField,
  OAuthButtons,
  useAuthenticatedRedirect,
} from '@features/Auth'
import { ROUTES } from '@shared/routes'
import { useRegistrationForm } from '../model/useRegistrationForm'

type TextFieldName = Exclude<keyof RegistrationFormData, 'acceptLegal'>

const FIELDS: {
  autoComplete: string
  label: string
  name: TextFieldName
  placeholder: string
  secret?: boolean
}[] = [
  {
    autoComplete: 'name',
    label: 'Full Name',
    name: 'fullName',
    placeholder: 'Maya Rivers',
  },
  {
    autoComplete: 'email',
    label: 'Email Address',
    name: 'email',
    placeholder: 'you@example.com',
  },
  {
    autoComplete: 'new-password',
    label: 'Password',
    name: 'password',
    placeholder: '••••••••',
    secret: true,
  },
  {
    autoComplete: 'new-password',
    label: 'Confirm Password',
    name: 'confirmPassword',
    placeholder: '••••••••',
    secret: true,
  },
]

export const RegistrationForm = () => {
  useAuthenticatedRedirect()
  const { form, isSubmitting, onSubmit } = useRegistrationForm()

  return (
    <>
      <AuthHeading
        description="Sign up with your email or continue with a social account."
        title="Create your account for free and start listening"
      />

      <Form {...form}>
        <form
          aria-busy={isSubmitting}
          className="flex flex-col gap-5.5"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-3">
            {FIELDS.map(
              ({ autoComplete, label, name, placeholder, secret }) => (
                <FormField
                  control={form.control}
                  key={name}
                  name={name}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <AuthField label={label}>
                        {secret ? (
                          <PasswordInput
                            autoComplete={autoComplete}
                            placeholder={placeholder}
                            {...field}
                          />
                        ) : (
                          <Input
                            autoComplete={autoComplete}
                            placeholder={placeholder}
                            type={name === 'email' ? 'email' : 'text'}
                            {...field}
                          />
                        )}
                      </AuthField>
                    </FormItem>
                  )}
                />
              ),
            )}
          </div>

          <LegalAcceptanceField control={form.control} id="accept-legal" />

          <Button
            className="w-full font-medium"
            disabled={isSubmitting}
            type="submit"
            variant="primary"
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </Form>

      <AuthOrDivider />
      <OAuthButtons accepted={form.watch('acceptLegal')} />
      <AuthFooterLink
        href={ROUTES.auth.login}
        lead="Already have an account?"
        link="Log in"
      />
    </>
  )
}
