import { useQuery } from '@tanstack/react-query'
import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { MIN_TOUCH_TARGET, spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { useTheme } from '@/hooks/use-theme'
import { api } from '@/lib/api/client'
import { API_BASE_URL } from '@/lib/api/config'
import { ensureOk } from '@/lib/api/ensure-ok'

/**
 * Bootstrap check (#226): one real endpoint through the typed client, rendered with the bridged
 * tokens. Replaced by the session-routed app in the next stage.
 */
export default function BootstrapScreen() {
  const { t } = useI18n()
  const { colors } = useTheme()
  const health = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { response } = await api.GET('/api/v1/health')
      ensureOk(response, 'API unavailable')
      return true
    },
  })

  const status = health.isPending ? 'common.loading' : health.isError ? 'common.error.network' : 'common.connected'

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ThemedText variant="display">bitrate</ThemedText>
      <ThemedText tone={health.isError ? 'errorText' : health.isSuccess ? 'successText' : 'textSecondary'}>
        {t(status)}
      </ThemedText>
      <ThemedText tone="textMuted" variant="caption">
        {API_BASE_URL}
      </ThemedText>
      {health.isError ? (
        <Pressable accessibilityRole="button" onPress={() => void health.refetch()} style={styles.retry}>
          <ThemedText tone="textBrand" variant="bodyStrong">
            {t('common.tryAgain')}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing['3'], padding: spacing['6'] },
  retry: { minHeight: MIN_TOUCH_TARGET, justifyContent: 'center' },
})
