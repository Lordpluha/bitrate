/** The fields of a browse category (`GET /browse/categories`) a match needs. */
type MatchableCategory = { name: string; slug: string }

/**
 * The browse category a search query is about: the query contains the category name or slug,
 * or the name contains the query. Matches only real categories from the API.
 */
export const matchBrowseCategory = <C extends MatchableCategory>({
  query,
  categories,
}: {
  query: string
  categories: readonly C[]
}) => {
  const q = query.trim().toLowerCase()
  if (!q) return undefined
  return categories.find((category) => {
    const name = category.name.toLowerCase()
    const slug = category.slug.toLowerCase()
    return (
      name.includes(q) || q.includes(name) || q.includes(slug) || slug === q
    )
  })
}
