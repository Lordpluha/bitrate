'use client'

import { FormControl, FormLabel, useFormField } from '@bitrate/ui-react'
import { translateMessage, useI18n } from '@shared/i18n'
import type { ReactElement } from 'react'
import { AuthFieldError } from './AuthFieldError'

type AuthFieldProps = {
  children: ReactElement
  /** The form lists its messages elsewhere (sign-up shows them together under the fields). */
  hideError?: boolean
  label: string
}

/** A labelled form field with its validation message; use inside `FormItem`. */
export const AuthField = ({
  children,
  hideError = false,
  label,
}: AuthFieldProps) => {
  const { t } = useI18n()
  const { error, formMessageId } = useFormField()

  return (
    <div className="flex flex-col gap-1.5">
      <FormLabel className="text-sm font-medium text-foreground">
        {label}
      </FormLabel>
      <FormControl>{children}</FormControl>
      {!hideError && error?.message ? (
        <AuthFieldError id={formMessageId}>
          {translateMessage({ message: String(error.message), t })}
        </AuthFieldError>
      ) : null}
    </div>
  )
}
