import { useMutation } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'

import { AuthLayout } from '@/components/auth/auth-layout'
import { FormAlert } from '@/components/ui/form-alert'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { TextLink } from '@/components/ui/text-link'
import { useI18n } from '@/hooks/use-i18n'
import { errorMessageKey } from '@/lib/api/error-message-key'
import { resetPassword } from '@/lib/auth/reset-password'
import { validatePassword } from '@/lib/auth/validate-fields'
import type { TranslationKey } from '@/lib/i18n/messages/en'

/** Opened from the emailed link as `bitrate://reset-password?token=…`. */
export default function ResetPasswordScreen() {
  const { t } = useI18n()
  const router = useRouter()
  const { token } = useLocalSearchParams<{ token?: string }>()
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<TranslationKey | null>(null)
  const reset = useMutation({ mutationFn: resetPassword })
  const backToLogin = <TextLink label={t('auth.backToLogin')} onPress={() => router.replace('/login')} />

  if (!token) {
    return (
      <AuthLayout footer={backToLogin} title={t('auth.reset.incompleteTitle')}>
        <FormAlert message={t('auth.reset.incomplete')} />
        <Button label={t('auth.reset.requestAnother')} onPress={() => router.replace('/forgot-password')} />
      </AuthLayout>
    )
  }

  if (reset.isSuccess) {
    return (
      <AuthLayout title={t('auth.reset.title')}>
        <FormAlert message={t('auth.reset.success')} tone="success" />
        <Button label={t('auth.logIn')} onPress={() => router.replace('/login')} />
      </AuthLayout>
    )
  }

  const submit = () => {
    const error = validatePassword(password)
    setPasswordError(error)
    if (!error) reset.mutate({ token, password })
  }

  return (
    <AuthLayout description={t('auth.reset.description')} footer={backToLogin} title={t('auth.reset.title')}>
      <TextField
        autoComplete="new-password"
        error={passwordError && t(passwordError)}
        label={t('auth.reset.newPassword')}
        onChangeText={setPassword}
        onSubmitEditing={submit}
        secret
        textContentType="newPassword"
        value={password}
      />
      {reset.isError ? (
        <FormAlert message={t(errorMessageKey({ error: reset.error, fallback: 'auth.reset.failed' }))} />
      ) : null}
      <Button
        label={reset.isPending ? t('auth.reset.submitting') : t('auth.reset.submit')}
        loading={reset.isPending}
        onPress={submit}
      />
    </AuthLayout>
  )
}
