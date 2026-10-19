import { useBrowseCategories } from '@/entities/Discovery'
import { useSearch } from '@/features/Search'
import { useI18n } from '@/shared/i18n'
import { buildHeaderSuggestions } from '@/widgets/MainHeader/ui/HeaderSearch/model/buildHeaderSuggestions'
import { headerSearchTypes } from '@/widgets/MainHeader/ui/HeaderSearch/model/headerSearch.constants'

type UseSearchSuggestionsInput = {
  query: string
  debouncedQuery: string
  /** Past searches, newest first, from the same source as the recent searches list. */
  history: readonly string[]
}

/** Dropdown suggestions for the header search, from real search, history and categories only. */
export const useSearchSuggestions = ({
  query,
  debouncedQuery,
  history,
}: UseSearchSuggestionsInput) => {
  const { t } = useI18n()
  const { data } = useSearch({
    limit: 4,
    query: debouncedQuery,
    types: headerSearchTypes,
  })
  const { data: categories } = useBrowseCategories()
  return buildHeaderSuggestions({
    query,
    history,
    categories: categories?.data ?? [],
    /* results belong to the settled query only, never to a stale one */
    results: debouncedQuery === query && data ? data : undefined,
    labels: {
      album: t('common.album'),
      genre: t('search.genre'),
      playlist: t('common.playlist'),
      search: t('common.search'),
      song: t('common.song'),
      unknown: t('common.unknown'),
    },
  })
}
