import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Artwork } from '@/components/ui/artwork'
import { MIN_TOUCH_TARGET, spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { resolveMediaUrl } from '@/lib/api/media-url'
import type { SelfUser } from '@/lib/auth/me-query'
import type { TranslationKey } from '@/lib/i18n/messages/en'

const MORNING_FROM = 5
const AFTERNOON_FROM = 12
const EVENING_FROM = 18

function greetingKey(hour: number): TranslationKey {
  if (hour >= MORNING_FROM && hour < AFTERNOON_FROM) return 'home.greeting.morning'
  if (hour >= AFTERNOON_FROM && hour < EVENING_FROM) return 'home.greeting.afternoon'
  return 'home.greeting.evening'
}

/** "Good evening, Maya" with the avatar that opens Profile (the island has no profile tab). */
export function GreetingHeader({ user }: { user: SelfUser }) {
  const { t } = useI18n()
  const router = useRouter()

  return (
    <View style={styles.row}>
      <ThemedText accessibilityRole="header" style={styles.title} variant="title">
        {t(greetingKey(new Date().getHours()), { name: user.username })}
      </ThemedText>
      <Pressable
        accessibilityLabel={t('profile.heading')}
        accessibilityRole="button"
        onPress={() => router.push('/profile')}
        style={styles.avatar}
      >
        <Artwork fallback="user" round size={40} uri={resolveMediaUrl(user.avatar, 'users/avatars')} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing['3'] },
  title: { flex: 1 },
  avatar: { minWidth: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' },
})
