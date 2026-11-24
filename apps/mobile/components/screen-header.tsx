import { useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { IconButton } from '@/components/ui/icon-button'
import { spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'

/** The design's Mobile/Header: back chevron and a centred title. */
export function ScreenHeader({ title }: { title: string }) {
  const { t } = useI18n()
  const router = useRouter()

  return (
    <View style={styles.row}>
      <IconButton
        icon="chevron-left"
        label={t('common.back')}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      />
      <ThemedText accessibilityRole="header" numberOfLines={1} style={styles.title} variant="heading">
        {title}
      </ThemedText>
      <View style={styles.spacer} />
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  title: { flex: 1, textAlign: 'center' },
  spacer: { width: 44 },
})
