import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { AuthLayout } from '@/components/auth/auth-layout'
import { FormAlert } from '@/components/ui/form-alert'
import { LegalConsent } from '@/components/auth/legal-consent'
import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { TextLink } from '@/components/ui/text-link'
import { useI18n } from '@/hooks/use-i18n'
import { errorMessageKey } from '@/lib/api/error-message-key'
import { register } from '@/lib/auth/register'
import { validateEmail, validatePassword, validateUsername } from '@/lib/auth/validate-fields'
import type { TranslationKey } from '@/lib/i18n/messages/en'

type Field = 'email' | 'username' | 'password' | 'legal'
type FieldErrors = Record<Field, TranslationKey | null>

const NO_ERRORS: FieldErrors = { email: null, username: null, password: null, legal: null }

export default function RegisterScreen() {
  const { t } = useI18n()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>(NO_ERRORS)
  const signUp = useMutation({ mutationFn: register })

  const submit = () => {
    const next: FieldErrors = {
      email: validateEmail(email),
      username: validateUsername(username),
      password: validatePassword(password),
      legal: accepted ? null : 'auth.validation.legal',
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    signUp.mutate({ email: email.trim(), username: username.trim(), password, acceptLegal: true })
  }

  const footer = (
    <View style={styles.footer}>
      <ThemedText tone="textSecondary">{t('auth.registration.hasAccount')}</ThemedText>
      <TextLink label={t('auth.logIn')} onPress={() => router.replace('/login')} />
    </View>
  )

  if (signUp.isSuccess) {
    return (
      <AuthLayout footer={footer} title={t('auth.registration.doneTitle')}>
        <FormAlert message={t('auth.registration.done', { email: email.trim() })} tone="success" />
        <Button label={t('auth.logIn')} onPress={() => router.replace('/login')} />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout description={t('auth.registration.description')} footer={footer} title={t('auth.registration.title')}>
      <TextField
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email && t(errors.email)}
        inputMode="email"
        label={t('auth.field.email')}
        onChangeText={setEmail}
        value={email}
      />
      <TextField
        autoCapitalize="none"
        autoComplete="username-new"
        error={errors.username && t(errors.username)}
        label={t('auth.field.username')}
        onChangeText={setUsername}
        value={username}
      />
      <TextField
        autoComplete="new-password"
        error={errors.password && t(errors.password)}
        label={t('auth.field.password')}
        onChangeText={setPassword}
        secret
        textContentType="newPassword"
        value={password}
      />
      <LegalConsent checked={accepted} error={errors.legal && t(errors.legal)} onChange={setAccepted} />
      {signUp.isError ? (
        <FormAlert
          message={t(
            errorMessageKey({
              error: signUp.error,
              fallback: 'auth.registration.failed',
              byStatus: { 409: 'auth.registration.taken' },
            }),
          )}
        />
      ) : null}
      <Button
        label={signUp.isPending ? t('auth.registration.submitting') : t('auth.registration.submit')}
        loading={signUp.isPending}
        onPress={submit}
      />
    </AuthLayout>
  )
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
})
