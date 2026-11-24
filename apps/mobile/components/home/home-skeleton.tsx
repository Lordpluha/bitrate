import { StyleSheet, View } from 'react-native'

import { Skeleton } from '@/components/ui/skeleton'
import { radius, spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'

const CARD_SIZE = 148
const ROWS = 2

/** Home while the feed loads: resume tile, quick grid and two card rows as placeholders. */
export function HomeSkeleton() {
  const { t } = useI18n()

  return (
    <View accessibilityLabel={t('common.loading')} accessibilityRole="progressbar" style={styles.root}>
      <Skeleton height={96} radius={radius['2xl']} />
      <View style={styles.row}>
        <View style={styles.flex}>
          <Skeleton height={64} radius={radius['2xl']} />
        </View>
        <View style={styles.flex}>
          <Skeleton height={64} radius={radius['2xl']} />
        </View>
      </View>
      {Array.from({ length: ROWS }, (_, row) => (
        <View key={row} style={styles.section}>
          <Skeleton height={20} width="45%" />
          <View style={styles.row}>
            <Skeleton height={CARD_SIZE} width={CARD_SIZE} />
            <Skeleton height={CARD_SIZE} width={CARD_SIZE} />
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: spacing['5'] },
  row: { flexDirection: 'row', gap: spacing['3'] },
  flex: { flex: 1 },
  section: { gap: spacing['3'] },
})
