import { StyleSheet, View } from 'react-native'

import { SectionHeader } from '@/components/ui/section-header'
import { spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { useSearchResultPress } from '@/hooks/use-search-result-press'
import type { SearchResponse } from '@/lib/catalog/search-query'
import { usePlayerStore } from '@/lib/player/player-store'

import { RESULT_LOOK } from './result-look'
import { ResultRow } from './result-row'
import { TopResult } from './top-result'

const TYPES = ['tracks', 'artists', 'albums', 'playlists'] as const

/** The populated search state: top result, then one section per non-empty result type. */
export function SearchResults({ response }: { response: SearchResponse }) {
  const { t } = useI18n()
  const pressFor = useSearchResultPress(response)
  const currentId = usePlayerStore((player) => player.queue[player.index]?.id ?? null)
  const top = response.topResult

  return (
    <View style={styles.root}>
      {top ? <TopResult onPress={pressFor(top)} result={top} /> : null}
      {TYPES.filter((type) => response.data[type].length > 0).map((type) => (
        <View key={type} style={styles.section}>
          <SectionHeader title={t(RESULT_LOOK[type].labelKey)} />
          {response.data[type].map((result) => (
            <ResultRow
              active={type === 'tracks' && result.id === currentId}
              key={`${type}:${result.id}`}
              onPress={pressFor(result)}
              result={result}
            />
          ))}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: spacing['6'] },
  section: { gap: spacing['1'] },
})
