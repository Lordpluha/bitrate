import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { SearchInput } from '@/components/search/search-input'
import { SearchResults } from '@/components/search/search-results'
import { ThemedText } from '@/components/themed-text'
import { Chips } from '@/components/ui/chips'
import { Screen } from '@/components/ui/screen'
import { Skeleton } from '@/components/ui/skeleton'
import { StateMessage } from '@/components/ui/state-message'
import { spacing } from '@/constants/theme'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useI18n } from '@/hooks/use-i18n'
import { SEARCH_FILTERS, type SearchFilter } from '@/lib/catalog/search-filter'
import { searchQuery } from '@/lib/catalog/search-query'

const DEBOUNCE_MS = 300
const SKELETON_ROWS = 6

/** Search-as-you-type over `GET /search` with type filters and every result state. */
export default function SearchScreen() {
  const { t } = useI18n()
  const [text, setText] = useState('')
  const [filter, setFilter] = useState<SearchFilter>('all')
  const query = useDebouncedValue(text.trim(), DEBOUNCE_MS)
  const search = useQuery({ ...searchQuery(query, filter), placeholderData: keepPreviousData })
  const options = SEARCH_FILTERS.map((value) => ({ value, label: t(`search.filter.${value}`) }))

  const body = () => {
    if (!query) {
      return <StateMessage description={t('search.prompt.description')} icon="search" title={t('search.prompt.title')} />
    }
    if (search.isPending) {
      return (
        <View accessibilityLabel={t('common.loading')} accessibilityRole="progressbar" style={styles.skeleton}>
          {Array.from({ length: SKELETON_ROWS }, (_, row) => (
            <Skeleton height={48} key={row} />
          ))}
        </View>
      )
    }
    if (search.isError) {
      return (
        <StateMessage
          action={{ label: t('common.tryAgain'), onPress: () => void search.refetch() }}
          icon="cloud-off"
          title={t('search.failed')}
          tone="error"
        />
      )
    }
    if (search.data.total === 0) {
      return (
        <StateMessage
          description={t('search.noResults.description')}
          icon="frown"
          title={t('search.noResults.title', { query })}
        />
      )
    }
    return <SearchResults response={search.data} />
  }

  return (
    <Screen island>
      <ThemedText accessibilityRole="header" variant="title">
        {t('nav.search')}
      </ThemedText>
      <SearchInput onChange={setText} value={text} />
      <Chips accessibilityLabel={t('nav.search')} onChange={setFilter} options={options} value={filter} />
      {body()}
    </Screen>
  )
}

const styles = StyleSheet.create({ skeleton: { gap: spacing['3'] } })
