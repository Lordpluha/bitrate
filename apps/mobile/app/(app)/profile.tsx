import Constants from 'expo-constants'
import { StyleSheet, View } from 'react-native'

import { PreferenceSection } from '@/components/profile/preference-section'
import { ScreenHeader } from '@/components/screen-header'
import { ThemedText } from '@/components/themed-text'
import { Artwork } from '@/components/ui/artwork'
import { Button } from '@/components/ui/button'
import { Screen } from '@/components/ui/screen'
import { spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { useLogOut } from '@/hooks/use-log-out'
import { useSession } from '@/hooks/use-session'
import { resolveMediaUrl } from '@/lib/api/media-url'
import { type Locale, SUPPORTED_LOCALES } from '@/lib/i18n/locales'
import { type LocalePreference, type ThemePreference, usePreferencesStore } from '@/lib/preferences/preferences-store'

/** Language names stay in their own language, whatever the UI language is. */
const LANGUAGE_NAMES: Record<Locale, string> = { en: 'English', uk: 'Українська', pl: 'Polski' }

/** Account summary, theme and language preferences, log out. */
export default function ProfileScreen() {
  const { t } = useI18n()
  const session = useSession()
  const logOut = useLogOut()
  const { theme, locale, setTheme, setLocale } = usePreferencesStore()

  if (session.status !== 'signed-in') return null
  const { user } = session

  const themeOptions: { value: ThemePreference; label: string }[] = [
    { value: 'system', label: t('profile.theme.system') },
    { value: 'dark', label: t('profile.theme.dark') },
    { value: 'light', label: t('profile.theme.light') },
    { value: 'dim', label: t('profile.theme.dim') },
  ]
  const localeOptions: { value: LocalePreference; label: string }[] = [
    { value: 'system', label: t('profile.language.system') },
    ...SUPPORTED_LOCALES.map((value) => ({ value, label: LANGUAGE_NAMES[value] })),
  ]

  return (
    <Screen island>
      <ScreenHeader title={t('profile.heading')} />
      <View style={styles.account}>
        <Artwork fallback="user" round size={88} uri={resolveMediaUrl(user.avatar, 'users/avatars')} />
        <ThemedText variant="title">{user.username}</ThemedText>
        <ThemedText tone="textSecondary" variant="caption">
          {user.email}
        </ThemedText>
      </View>
      <PreferenceSection onChange={setTheme} options={themeOptions} title={t('profile.theme')} value={theme} />
      <PreferenceSection onChange={setLocale} options={localeOptions} title={t('profile.language')} value={locale} />
      <Button label={t('profile.logOut')} loading={logOut.isPending} onPress={() => logOut.mutate()} variant="destructive" />
      <ThemedText style={styles.version} tone="textMuted" variant="caption">
        {t('profile.version', { version: Constants.expoConfig?.version ?? '—' })}
      </ThemedText>
    </Screen>
  )
}

const styles = StyleSheet.create({
  account: { alignItems: 'center', gap: spacing['1'], paddingVertical: spacing['4'] },
  version: { textAlign: 'center' },
})
