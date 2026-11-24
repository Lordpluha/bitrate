import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState } from 'react'

import { AuthLayout } from '@/components/auth/auth-layout'
import { FormAlert } from '@/components/ui/form-alert'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { TextLink } from '@/components/ui/text-link'
import { useI18n } from '@/hooks/use-i18n'
import { errorMessageKey } from '@/lib/api/error-message-key'
import { requestPasswordReset } from '@/lib/auth/request-password-reset'
import { validateEmail } from '@/lib/auth/validate-fields'
import type { TranslationKey } from '@/lib/i18n/messages/en'

export default function ForgotPasswordScreen() {
  const { t } = useI18n()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<TranslationKey | null>(null)
  const request = useMutation({ mutationFn: requestPasswordReset })

  const submit = () => {
    const error = validateEmail(email)
    setEmailError(error)
    if (!error) request.mutate({ email: email.trim() })
  }

  return (
    <AuthLayout
      description={t('auth.forgot.description')}
      footer={<TextLink label={t('auth.backToLogin')} onPress={() => router.replace('/login')} />}
      title={t('auth.forgot.title')}
    >
      {request.isSuccess ? (
        <FormAlert message={t('auth.forgot.sent')} title={t('auth.forgot.sentTitle')} tone="success" />
      ) : (
        <>
          <TextField
            autoCapitalize="none"
            autoComplete="email"
            error={emailError && t(emailError)}
            inputMode="email"
            label={t('auth.field.email')}
            onChangeText={setEmail}
            onSubmitEditing={submit}
            value={email}
          />
          {request.isError ? (
            <FormAlert message={t(errorMessageKey({ error: request.error, fallback: 'auth.forgot.failed' }))} />
          ) : null}
          <Button
            label={request.isPending ? t('auth.forgot.submitting') : t('auth.forgot.submit')}
            loading={request.isPending}
            onPress={submit}
          />
        </>
      )}
    </AuthLayout>
  )
}
