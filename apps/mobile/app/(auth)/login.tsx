import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { AuthLayout } from '@/components/auth/auth-layout'
import { FormAlert } from '@/components/ui/form-alert'
import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { TextLink } from '@/components/ui/text-link'
import { useI18n } from '@/hooks/use-i18n'
import { errorMessageKey } from '@/lib/api/error-message-key'
import { logIn } from '@/lib/auth/log-in'
import { ME_QUERY_KEY } from '@/lib/auth/me-query'
import { validateEmail, validatePassword } from '@/lib/auth/validate-fields'
import type { TranslationKey } from '@/lib/i18n/messages/en'

type FieldErrors = { email: TranslationKey | null; password: TranslationKey | null }

export default function LoginScreen() {
  const { t } = useI18n()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({ email: null, password: null })

  const login = useMutation({
    mutationFn: logIn,
    onSuccess: async (result) => {
      if (result.kind === 'two-factor') {
        router.push({ pathname: '/two-factor', params: { pendingToken: result.pendingToken } })
        return
      }
      await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY })
    },
  })

  const submit = () => {
    const next = { email: validateEmail(email), password: validatePassword(password) }
    setErrors(next)
    if (next.email || next.password) return
    login.mutate({ email: email.trim(), password })
  }

  return (
    <AuthLayout
      description={t('auth.login.description')}
      footer={
        <View style={styles.footer}>
          <ThemedText tone="textSecondary">{t('auth.login.noAccount')}</ThemedText>
          <TextLink label={t('auth.signUp')} onPress={() => router.push('/register')} />
        </View>
      }
      title={t('auth.login.title')}
    >
      <TextField
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email && t(errors.email)}
        inputMode="email"
        label={t('auth.field.email')}
        onChangeText={setEmail}
        textContentType="emailAddress"
        value={email}
      />
      <TextField
        autoComplete="current-password"
        error={errors.password && t(errors.password)}
        label={t('auth.field.password')}
        onChangeText={setPassword}
        onSubmitEditing={submit}
        returnKeyType="go"
        secret
        textContentType="password"
        value={password}
      />
      <View style={styles.forgot}>
        <TextLink label={t('auth.login.forgotPassword')} onPress={() => router.push('/forgot-password')} />
      </View>
      {login.isError ? (
        <FormAlert
          message={t(
            errorMessageKey({
              error: login.error,
              fallback: 'auth.login.failed',
              byStatus: { 400: 'auth.login.failed.credentials', 401: 'auth.login.failed.credentials' },
            }),
          )}
          title={t('auth.login.failed')}
        />
      ) : null}
      <Button
        label={login.isPending ? t('auth.login.submitting') : t('auth.logIn')}
        loading={login.isPending}
        onPress={submit}
      />
    </AuthLayout>
  )
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  forgot: { alignItems: 'flex-end' },
})
