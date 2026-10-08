import type { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useId, useState } from 'react'

export interface WorkspaceDestination {
  label: string
  to: (typeof ROUTES.dashboard)[keyof typeof ROUTES.dashboard]
}

export function WorkspaceSearch({
  destinations,
  onNavigate,
}: {
  destinations: readonly WorkspaceDestination[]
  onNavigate: () => void
}) {
  const inputId = useId()
  const [query, setQuery] = useState('')
  const results = destinations.filter(({ label }) =>
    label.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <label className="sr-only" htmlFor={inputId}>
        Search workspace
      </label>
      <input
        className="h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-initial-focus
        id={inputId}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Find a workspace section…"
        type="search"
        value={query}
      />
      <nav aria-label="Search results" className="space-y-1">
        {results.map(({ label, to }) => (
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            key={to}
            onClick={onNavigate}
            preload={false}
            to={to}
          >
            <Search aria-hidden="true" className="size-4 text-text-secondary" />
            {label}
          </Link>
        ))}
      </nav>
      {results.length === 0 && (
        <p className="text-sm text-text-secondary" role="status">
          No matching workspace sections.
        </p>
      )}
    </div>
  )
}
