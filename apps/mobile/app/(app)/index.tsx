import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { Screen } from '@/components/ui/screen'
import { spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { useLogOut } from '@/hooks/use-log-out'
import { useSession } from '@/hooks/use-session'

/** Where a session lands until Home arrives (#228): who is signed in, and a way out. */
export default function SignedInScreen() {
  const { t } = useI18n()
  const session = useSession()
  const logOut = useLogOut()

  if (session.status !== 'signed-in') return null

  return (
    <Screen scroll={false}>
      <View style={styles.center}>
        <ThemedText accessibilityRole="header" variant="title">
          {session.user.username}
        </ThemedText>
        <ThemedText tone="textSecondary">{session.user.email}</ThemedText>
      </View>
      <Button label={t('profile.logOut')} loading={logOut.isPending} onPress={() => logOut.mutate()} variant="secondary" />
    </Screen>
  )
}

const styles = StyleSheet.create({ center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing['2'] } })
