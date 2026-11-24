import { StyleSheet, View } from 'react-native'

import { Skeleton } from '@/components/ui/skeleton'
import { spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'

/** Placeholder rows for any track list while it loads. */
export function TrackListSkeleton({ rows = 6 }: { rows?: number }) {
  const { t } = useI18n()

  return (
    <View accessibilityLabel={t('common.loading')} accessibilityRole="progressbar" style={styles.list}>
      {Array.from({ length: rows }, (_, row) => (
        <View key={row} style={styles.row}>
          <Skeleton height={48} width={48} />
          <View style={styles.text}>
            <Skeleton height={14} width="70%" />
            <Skeleton height={12} width="40%" />
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  list: { gap: spacing['3'] },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing['3'] },
  text: { flex: 1, gap: spacing['2'] },
})
