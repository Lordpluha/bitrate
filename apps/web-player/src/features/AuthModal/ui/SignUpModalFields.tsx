import {
  DynamicLabel,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  InputProvider,
  PasswordInput,
} from '@bitrate/ui-react'
import type { RegistrationFormData } from '@entities/User'
import type { Control } from 'react-hook-form'

type SignUpModalFieldsProps = {
  control: Control<RegistrationFormData>
}

const fields = [
  { name: 'fullName', label: 'Full Name', autoComplete: 'name' },
  { name: 'email', label: 'Email Address', autoComplete: 'email' },
] as const

export const SignUpModalFields = ({ control }: SignUpModalFieldsProps) => (
  <>
    {fields.map(({ autoComplete, label, name }) => (
      <FormField
        control={control}
        key={name}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <InputProvider>
                <div className="relative">
                  <DynamicLabel htmlFor={`signup-${name}`} variant="contrast">
                    {label}
                  </DynamicLabel>
                  <Input
                    autoComplete={autoComplete}
                    id={`signup-${name}`}
                    placeholder=""
                    type={name === 'email' ? 'email' : 'text'}
                    variant="contrast"
                    {...field}
                  />
                </div>
              </InputProvider>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ))}

    {(['password', 'confirmPassword'] as const).map((name) => (
      <FormField
        control={control}
        key={name}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <InputProvider>
                <div className="relative">
                  <DynamicLabel htmlFor={`signup-${name}`} variant="contrast">
                    {name === 'password' ? 'Password' : 'Confirm Password'}
                  </DynamicLabel>
                  <PasswordInput
                    autoComplete="new-password"
                    id={`signup-${name}`}
                    placeholder=""
                    variant="contrast"
                    {...field}
                  />
                </div>
              </InputProvider>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ))}
  </>
)
