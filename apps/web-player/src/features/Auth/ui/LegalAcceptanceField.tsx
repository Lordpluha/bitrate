import { Checkbox, FormField, FormItem, FormMessage } from '@bitrate/ui-react'
import type { RegistrationFormData } from '@entities/User'
import type { Control } from 'react-hook-form'
import { LegalConsentLabel } from './LegalConsentLabel'

type LegalAcceptanceFieldProps = {
  control: Control<RegistrationFormData>
  id: string
}

/**
 * The required "I am 16+ and accept the Terms and Privacy Policy" checkbox on every
 * sign-up form. Registration is refused by both the schema and the API without it.
 */
export const LegalAcceptanceField = ({
  control,
  id,
}: LegalAcceptanceFieldProps) => (
  <FormField
    control={control}
    name="acceptLegal"
    render={({ field, fieldState }) => (
      <FormItem className="pt-2">
        <div className="flex items-start gap-3 text-sm">
          <Checkbox
            aria-invalid={fieldState.invalid}
            checked={field.value}
            id={id}
            onBlur={field.onBlur}
            onCheckedChange={field.onChange}
          />
          <LegalConsentLabel id={id} />
        </div>
        <FormMessage />
      </FormItem>
    )}
  />
)
