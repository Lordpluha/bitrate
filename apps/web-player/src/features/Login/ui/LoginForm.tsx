'use client'

import { Button, Form, FormField, FormItem, Input } from '@bitrate/ui-react'
import {
  AUTH_BUTTON_CLASS,
  AUTH_INPUT_CLASS,
  AuthAlert,
  AuthField,
  AuthFooterLink,
  AuthHeading,
  AuthOrDivider,
  LegalAcceptanceField,
  OAuthButtons,
  useAuthenticatedRedirect,
} from '@features/Auth'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import { useLoginForm } from '../model/useLoginForm'

export const LoginForm = () => {
  const { t } = useI18n()
  useAuthenticatedRedirect()
  const { failure, form, isSubmitting, onSubmit } = useLoginForm()

  return (
    <>
      <AuthHeading
        description={t('auth.login.description')}
        title={t('auth.login.title')}
      />

      {failure ? (
        <AuthAlert title={failure.title}>{failure.message}</AuthAlert>
      ) : null}

      <Form {...form}>
        <form
          aria-busy={isSubmitting}
          className="flex flex-col gap-5.5"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-3.5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <AuthField label={t('auth.field.email')}>
                    <Input
                      autoComplete="email"
                      className={AUTH_INPUT_CLASS}
                      placeholder="you@example.com"
                      type="email"
                      {...field}
                    />
                  </AuthField>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <AuthField label={t('auth.field.password')}>
                    <Input
                      autoComplete="current-password"
                      className={AUTH_INPUT_CLASS}
                      placeholder="••••••••"
                      type="password"
                      {...field}
                    />
                  </AuthField>
                </FormItem>
              )}
            />
            <Link
              className="self-end text-[13px] leading-[1.25] font-semibold text-primary hover:opacity-80"
              href={ROUTES.auth.forgotPassword}
            >
              {t('auth.login.forgotPassword')}
            </Link>
          </div>

          <LegalAcceptanceField control={form.control} id="accept-legal" />

          <Button
            className={AUTH_BUTTON_CLASS}
            disabled={isSubmitting}
            type="submit"
            variant="primary"
          >
            {isSubmitting ? t('auth.login.submitting') : t('auth.logIn')}
          </Button>
        </form>
      </Form>

      <AuthOrDivider />
      <OAuthButtons accepted={form.watch('acceptLegal')} />
      <AuthFooterLink
        href={ROUTES.auth.registration}
        lead={t('auth.login.noAccount')}
        link={t('auth.signUp')}
      />
    </>
  )
}
