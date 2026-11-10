import { Input, PasswordInput } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import type { ComponentProps } from 'react'
import { AuthFieldError } from './AuthFieldError'
import { AUTH_INPUT_CLASS } from './authStyles'

type AuthTextInputProps = Omit<ComponentProps<'input'>, 'id'> & {
  error?: string | null
  id: string
  label: string
  secret?: boolean
}

/**
 * A labelled input for the small recovery forms that are not React Hook Form forms. Its error
 * sits after the field as the form's next row, as in the design.
 */
export const AuthTextInput = ({
  error,
  id,
  label,
  secret = false,
  ...props
}: AuthTextInputProps) => {
  const { t } = useI18n()
  const errorId = `${id}-error`
  const inputProps = {
    'aria-describedby': error ? errorId : undefined,
    'aria-invalid': Boolean(error),
    id,
    ...props,
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor={id}>
          {label}
        </label>
        {secret ? (
          <PasswordInput
            className={AUTH_INPUT_CLASS}
            hideLabel={t('auth.password.hide')}
            showLabel={t('auth.password.show')}
            {...inputProps}
          />
        ) : (
          <Input className={AUTH_INPUT_CLASS} {...inputProps} />
        )}
      </div>
      {error ? <AuthFieldError id={errorId}>{error}</AuthFieldError> : null}
    </>
  )
}
