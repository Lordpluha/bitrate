'use client'

import { Checkbox, FormField, FormItem } from '@bitrate/ui-react'
import { translateMessage, useI18n } from '@shared/i18n'
import type { Control, FieldPath } from 'react-hook-form'
import { AuthFieldError } from './AuthFieldError'
import { LegalConsentLabel } from './LegalConsentLabel'

/** Any form that asks for consent: sign-in and sign-up. */
type ConsentForm = { acceptLegal: boolean }

type LegalAcceptanceFieldProps<TForm extends ConsentForm> = {
  control: Control<TForm>
  /** The form lists its messages elsewhere. */
  hideError?: boolean
  id: string
}

/**
 * The required "I am 16+ and accept the Terms and Privacy Policy" checkbox on every form that
 * sends credentials. The schema refuses the submit without it, and the checkbox takes the
 * form's `ref` so a refused submit focuses it.
 */
export const LegalAcceptanceField = <TForm extends ConsentForm>({
  control,
  hideError = false,
  id,
}: LegalAcceptanceFieldProps<TForm>) => {
  const { t } = useI18n()
  const errorId = `${id}-error`

  return (
    <FormField
      control={control}
      name={'acceptLegal' as FieldPath<TForm>}
      render={({ field, fieldState }) => (
        <FormItem className="space-y-1.5">
          <div className="flex items-start gap-2.5">
            <Checkbox
              aria-describedby={
                !hideError && fieldState.error ? errorId : undefined
              }
              aria-invalid={fieldState.invalid}
              checked={Boolean(field.value)}
              className="mt-0.5 size-4 rounded border-input bg-transparent"
              id={id}
              onBlur={field.onBlur}
              onCheckedChange={field.onChange}
              ref={field.ref}
            />
            <LegalConsentLabel id={id} />
          </div>
          {!hideError && fieldState.error?.message ? (
            <AuthFieldError id={errorId}>
              {translateMessage({ message: fieldState.error.message, t })}
            </AuthFieldError>
          ) : null}
        </FormItem>
      )}
    />
  )
}
