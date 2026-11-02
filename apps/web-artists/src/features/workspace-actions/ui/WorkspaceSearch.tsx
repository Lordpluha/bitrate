import {
  MIN_SEARCH_LENGTH,
  useWorkspaceSearch,
} from '@entities/workspace-search'
import { useDebouncedValue } from '@shared/hooks'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { Disc3, Music2, Search } from 'lucide-react'
import { type ReactNode, useId, useState } from 'react'

export interface WorkspaceDestination {
  label: string
  to: (typeof ROUTES.dashboard)[keyof typeof ROUTES.dashboard]
}

const SEARCH_DELAY_MS = 250

const resultClass =
  'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** Workspace sections plus the artist's releases and tracks matching the query. */
export function WorkspaceSearch({
  artistId,
  destinations,
  onNavigate,
}: {
  artistId: string
  destinations: readonly WorkspaceDestination[]
  onNavigate: () => void
}) {
  const inputId = useId()
  const { t, tMessage } = useI18n()
  const [query, setQuery] = useState('')
  const debounced = useDebouncedValue(query, SEARCH_DELAY_MS)
  const search = useWorkspaceSearch(artistId, debounced)
  const term = query.trim().toLowerCase()
  const sections = destinations.filter(({ label }) =>
    label.toLowerCase().includes(term),
  )
  const searching = term.length >= MIN_SEARCH_LENGTH
  const data = searching ? search.data : undefined
  const found =
    sections.length + (data ? data.releases.length + data.tracks.length : 0)

  return (
    <div className="space-y-4">
      <label className="sr-only" htmlFor={inputId}>
        {t('shell.search')}
      </label>
      <input
        className="h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-initial-focus
        id={inputId}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('music.search.placeholder')}
        type="search"
        value={query}
      />
      <nav
        aria-label={t('music.search.results')}
        className="max-h-[60vh] space-y-4 overflow-y-auto"
      >
        {sections.length > 0 && (
          <ResultGroup title={t('music.search.sections')}>
            {sections.map(({ label, to }) => (
              <Link
                className={resultClass}
                key={to}
                onClick={onNavigate}
                preload={false}
                to={to}
              >
                <Search
                  aria-hidden="true"
                  className="size-4 text-text-secondary"
                />
                {label}
              </Link>
            ))}
          </ResultGroup>
        )}
        {data && data.releases.length > 0 && (
          <ResultGroup title={t('music.tabs.releases')}>
            {data.releases.map((release) => (
              <Link
                className={resultClass}
                key={release.id}
                onClick={onNavigate}
                params={{ releaseId: release.id }}
                preload={false}
                to="/dashboard/music/$releaseId"
              >
                <Disc3 aria-hidden="true" className="size-4 text-accent" />
                <span className="min-w-0 flex-1 truncate">{release.title}</span>
              </Link>
            ))}
          </ResultGroup>
        )}
        {data && data.tracks.length > 0 && (
          <ResultGroup title={t('music.tabs.tracks')}>
            {data.tracks.map((track) =>
              track.releaseId ? (
                <Link
                  className={resultClass}
                  key={track.id}
                  onClick={onNavigate}
                  params={{ releaseId: track.releaseId }}
                  preload={false}
                  to="/dashboard/music/$releaseId"
                >
                  <Music2 aria-hidden="true" className="size-4 text-accent" />
                  <span className="min-w-0 flex-1 truncate">{track.title}</span>
                </Link>
              ) : (
                <Link
                  className={resultClass}
                  key={track.id}
                  onClick={onNavigate}
                  preload={false}
                  search={{ tab: 'tracks', q: track.title }}
                  to={ROUTES.dashboard.music}
                >
                  <Music2 aria-hidden="true" className="size-4 text-accent" />
                  <span className="min-w-0 flex-1 truncate">{track.title}</span>
                </Link>
              ),
            )}
          </ResultGroup>
        )}
      </nav>
      <p className="text-sm text-text-secondary" role="status">
        {searching && search.isError
          ? tMessage(search.error.message)
          : searching && (search.isFetching || query !== debounced)
            ? t('music.search.searching')
            : found === 0
              ? t('music.search.empty')
              : ''}
      </p>
    </div>
  )
}

function ResultGroup({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-xs uppercase tracking-wide text-text-secondary">
        {title}
      </p>
      {children}
    </div>
  )
}
