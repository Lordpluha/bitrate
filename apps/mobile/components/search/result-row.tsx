import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Artwork } from '@/components/ui/artwork'
import { MIN_TOUCH_TARGET, spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { resolveMediaUrl } from '@/lib/api/media-url'
import type { SearchResult } from '@/lib/catalog/search-query'

import { RESULT_LOOK } from './result-look'

type ResultRowProps = {
  result: SearchResult
  onPress?: () => void
  active?: boolean
}

/** One search hit. Albums and playlists read "Album · Artist" like the design; artists are round. */
export function ResultRow({ result, onPress, active = false }: ResultRowProps) {
  const { t } = useI18n()
  const look = RESULT_LOOK[result.type]
  const subtitle =
    result.type === 'tracks' ? (result.subtitle ?? '') : [t(look.labelKey), result.subtitle].filter(Boolean).join(' · ')

  return (
    <Pressable
      accessibilityLabel={`${result.title}, ${subtitle}`}
      accessibilityRole={onPress ? 'button' : 'text'}
      disabled={!onPress}
      onPress={onPress}
      style={styles.row}
    >
      <Artwork fallback={look.fallback} round={look.round} size={48} uri={resolveMediaUrl(result.image, look.folder)} />
      <View style={styles.text}>
        <ThemedText numberOfLines={1} tone={active ? 'textBrand' : 'text'} variant="bodyStrong">
          {result.title}
        </ThemedText>
        <ThemedText numberOfLines={1} tone="textSecondary" variant="caption">
          {subtitle}
        </ThemedText>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: { minHeight: MIN_TOUCH_TARGET + 12, flexDirection: 'row', alignItems: 'center', gap: spacing['3'] },
  text: { flex: 1, gap: 2 },
})
