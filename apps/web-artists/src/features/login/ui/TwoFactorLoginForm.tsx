import { Button, Input, LogoIcon, Typography } from '@bitrate/ui-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { verifyTwoFactorLogin } from '../api/verifyTwoFactorLogin'
import {
  type TwoFactorFormData,
  twoFactorFormSchema,
} from '../validation/TwoFactorForm.validation'

interface TwoFactorLoginFormProps {
  onVerified: () => Promise<void>
  onBack: () => void
}

export function TwoFactorLoginForm({
  onVerified,
  onBack,
}: TwoFactorLoginFormProps) {
  const form = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorFormSchema),
    defaultValues: { code: '' },
  })
  const { setFocus } = form
  useEffect(() => setFocus('code'), [setFocus])

  const verification = useMutation({
    mutationFn: (data: TwoFactorFormData) => verifyTwoFactorLogin({ data }),
    onSuccess: async (result) => {
      if (result.success) {
        await onVerified()
      } else {
        form.setError('root', { message: result.message })
      }
    },
    onError: () => {
      form.setError('root', {
        message: 'Could not verify your code. Please try again.',
      })
    },
  })

  return (
    <div className="w-full max-w-120 rounded-[10px] bg-inherit px-14 py-20 text-white max-lg:p-6">
      <div className="mb-6 flex flex-col items-center gap-2">
        <LogoIcon height={64} width={64} />
        <Typography as="h1" className="text-center" size="heading2">
          Verify your sign-in
        </Typography>
        <p className="text-center">
          Enter the code from your authenticator app.
        </p>
      </div>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((data) => verification.mutate(data))}
      >
        <label htmlFor="two-factor-code">Authentication code</label>
        <Input
          aria-describedby={
            form.formState.errors.code ? 'two-factor-code-error' : undefined
          }
          aria-invalid={Boolean(form.formState.errors.code)}
          autoComplete="one-time-code"
          className="h-16 text-center text-3xl! tracking-widest tabular-nums hover:border-white focus-visible:ring-ring"
          id="two-factor-code"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          variant="black"
          {...form.register('code')}
        />
        {form.formState.errors.code && (
          <p id="two-factor-code-error" role="alert">
            {form.formState.errors.code.message}
          </p>
        )}
        {form.formState.errors.root && (
          <p role="alert">{form.formState.errors.root.message}</p>
        )}
        <Button
          disabled={verification.isPending}
          size="xl"
          type="submit"
          variant="primary"
        >
          {verification.isPending ? 'Verifying…' : 'Verify and sign in'}
        </Button>
        <Button
          disabled={verification.isPending}
          onClick={onBack}
          type="button"
          variant="ghost"
        >
          Back to sign-in
        </Button>
      </form>
    </div>
  )
}
