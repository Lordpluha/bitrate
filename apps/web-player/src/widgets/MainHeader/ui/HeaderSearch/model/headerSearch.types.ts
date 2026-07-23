export type HeaderSuggestion = {
  href?: string
  image?: string
  query?: string
  subtitle: string
  title: string
  type: 'media' | 'query'
}

export type RecentSearch = Omit<HeaderSuggestion, 'type'>
