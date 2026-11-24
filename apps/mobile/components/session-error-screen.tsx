import { StyleSheet, View } from 'react-native'

import { Screen } from '@/components/ui/screen'
import { StateMessage } from '@/components/ui/state-message'
import { useI18n } from '@/hooks/use-i18n'

/** Shown when the app cannot even learn whether there is a session (offline, API down). */
export function SessionErrorScreen({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n()

  return (
    <Screen scroll={false}>
      <View style={styles.center}>
        <StateMessage
          action={{ label: t('common.tryAgain'), onPress: onRetry }}
          description={t('common.error.network')}
          icon="wifi-off"
          title={t('common.error.title')}
          tone="error"
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({ center: { flex: 1, justifyContent: 'center' } })
