import { Input, PasswordInput } from '@bitrate/ui-react'
import type { ComponentProps } from 'react'
import { AuthFieldError } from './AuthFieldError'

type AuthTextInputProps = Omit<ComponentProps<'input'>, 'id'> & {
  error?: string | null
  id: string
  label: string
  secret?: boolean
}

/** A labelled input for the small recovery forms that are not React Hook Form forms. */
export const AuthTextInput = ({
  error,
  id,
  label,
  secret = false,
  ...props
}: AuthTextInputProps) => {
  const errorId = `${id}-error`
  const inputProps = {
    'aria-describedby': error ? errorId : undefined,
    'aria-invalid': Boolean(error),
    id,
    ...props,
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      {secret ? <PasswordInput {...inputProps} /> : <Input {...inputProps} />}
      {error ? <AuthFieldError id={errorId}>{error}</AuthFieldError> : null}
    </div>
  )
}
