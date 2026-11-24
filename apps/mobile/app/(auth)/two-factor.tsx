import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'

import { AuthLayout } from '@/components/auth/auth-layout'
import { FormAlert } from '@/components/ui/form-alert'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { TextLink } from '@/components/ui/text-link'
import { useI18n } from '@/hooks/use-i18n'
import { errorMessageKey } from '@/lib/api/error-message-key'
import { ME_QUERY_KEY } from '@/lib/auth/me-query'
import { validateCode } from '@/lib/auth/validate-fields'
import { verifyTwoFactor } from '@/lib/auth/verify-two-factor'
import type { TranslationKey } from '@/lib/i18n/messages/en'

export default function TwoFactorScreen() {
  const { t } = useI18n()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { pendingToken } = useLocalSearchParams<{ pendingToken?: string }>()
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<TranslationKey | null>(null)

  const verify = useMutation({
    mutationFn: verifyTwoFactor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY }),
  })

  const submit = () => {
    const error = validateCode(code)
    setCodeError(error)
    if (error || !pendingToken) return
    verify.mutate({ pendingToken, code: code.trim() })
  }

  return (
    <AuthLayout
      description={t('auth.twoFactor.description')}
      footer={<TextLink label={t('auth.backToLogin')} onPress={() => router.replace('/login')} />}
      title={t('auth.twoFactor.title')}
    >
      <TextField
        autoComplete="one-time-code"
        autoFocus
        error={codeError && t(codeError)}
        inputMode="numeric"
        label={t('auth.twoFactor.code')}
        maxLength={6}
        onChangeText={(value) => setCode(value.replace(/\D/g, ''))}
        onSubmitEditing={submit}
        textContentType="oneTimeCode"
        value={code}
      />
      {verify.isError || !pendingToken ? (
        <FormAlert
          message={t(
            verify.isError
              ? errorMessageKey({
                  error: verify.error,
                  fallback: 'auth.twoFactor.invalid',
                  byStatus: { 400: 'auth.twoFactor.invalid', 401: 'auth.twoFactor.invalid' },
                })
              : 'auth.twoFactor.invalid',
          )}
        />
      ) : null}
      <Button
        disabled={!pendingToken}
        label={t('auth.twoFactor.submit')}
        loading={verify.isPending}
        onPress={submit}
      />
    </AuthLayout>
  )
}
