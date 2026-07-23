import { browseCategories } from '@/features/Search/model/search.constants'

export const getSearchCategoryMatch = (query: string) => {
  const normalizedQuery = query.toLowerCase()

  return browseCategories.find((category) => {
    const normalizedTitle = category.title.toLowerCase()

    return (
      normalizedTitle.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedTitle.replace(' music', ''))
    )
  })
}
