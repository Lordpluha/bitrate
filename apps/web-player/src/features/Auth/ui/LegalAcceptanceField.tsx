import {
  Checkbox,
  FormField,
  FormItem,
  FormMessage,
  Label,
} from '@bitrate/ui-react'
import type { RegistrationFormData } from '@entities/User'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import type { Control } from 'react-hook-form'

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
          <Label className="font-normal leading-snug" htmlFor={id}>
            I am at least 16 years old and accept the{' '}
            <Link className="text-primary hover:opacity-70" href={ROUTES.terms}>
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link
              className="text-primary hover:opacity-70"
              href={ROUTES.privacy}
            >
              Privacy Policy
            </Link>
            .
          </Label>
        </div>
        <FormMessage />
      </FormItem>
    )}
  />
)
