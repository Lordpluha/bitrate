import { Checkbox, FormField, FormItem } from '@bitrate/ui-react'
import type { RegistrationFormData } from '@entities/User'
import type { Control } from 'react-hook-form'
import { AuthFieldError } from './AuthFieldError'
import { LegalConsentLabel } from './LegalConsentLabel'

type LegalAcceptanceFieldProps = {
  control: Control<RegistrationFormData>
  /** The form lists its messages elsewhere. */
  hideError?: boolean
  id: string
}

/**
 * The required "I am 16+ and accept the Terms and Privacy Policy" checkbox on every
 * sign-up form. Registration is refused by both the schema and the API without it.
 */
export const LegalAcceptanceField = ({
  control,
  hideError = false,
  id,
}: LegalAcceptanceFieldProps) => (
  <FormField
    control={control}
    name="acceptLegal"
    render={({ field, fieldState }) => (
      <FormItem className="space-y-1.5">
        <div className="flex items-start gap-2.5">
          <Checkbox
            aria-invalid={fieldState.invalid}
            checked={field.value}
            className="mt-0.5 size-4 rounded border-input bg-transparent"
            id={id}
            onBlur={field.onBlur}
            onCheckedChange={field.onChange}
          />
          <LegalConsentLabel id={id} />
        </div>
        {!hideError && fieldState.error?.message ? (
          <AuthFieldError>{fieldState.error.message}</AuthFieldError>
        ) : null}
      </FormItem>
    )}
  />
)
