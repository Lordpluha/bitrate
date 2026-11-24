import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Artwork } from '@/components/ui/artwork'
import { Tile } from '@/components/ui/tile'
import { spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { resolveMediaUrl } from '@/lib/api/media-url'
import type { SearchResult } from '@/lib/catalog/search-query'

import { RESULT_LOOK } from './result-look'

/** The best match as a panel with a large cover (the design's Top result). */
export function TopResult({ result, onPress }: { result: SearchResult; onPress?: () => void }) {
  const { t } = useI18n()
  const look = RESULT_LOOK[result.type]

  return (
    <View style={styles.section}>
      <ThemedText accessibilityRole="header" variant="heading">
        {t('search.topResult')}
      </ThemedText>
      <Tile accessibilityLabel={`${result.title}${result.subtitle ? `, ${result.subtitle}` : ''}`} onPress={onPress}>
        <Artwork fallback={look.fallback} round={look.round} size={96} uri={resolveMediaUrl(result.image, look.folder)} />
        <ThemedText numberOfLines={2} variant="title">
          {result.title}
        </ThemedText>
        {result.subtitle ? (
          <ThemedText numberOfLines={1} tone="textSecondary">
            {result.subtitle}
          </ThemedText>
        ) : null}
      </Tile>
    </View>
  )
}

const styles = StyleSheet.create({ section: { gap: spacing['3'] } })
