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
import type { LoginFormData } from '@entities/User'
import type { Control } from 'react-hook-form'

export const LoginModalFields = ({
  control,
}: {
  control: Control<LoginFormData>
}) => (
  <>
    <FormField
      control={control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <InputProvider>
              <div className="relative">
                <DynamicLabel htmlFor="login-email" variant="contrast">
                  Email Address
                </DynamicLabel>
                <Input
                  autoComplete="email"
                  id="login-email"
                  placeholder=""
                  type="email"
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
    <FormField
      control={control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <InputProvider>
              <div className="relative">
                <DynamicLabel htmlFor="login-password" variant="contrast">
                  Password
                </DynamicLabel>
                <PasswordInput
                  autoComplete="current-password"
                  id="login-password"
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
  </>
)
