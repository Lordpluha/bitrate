import { Button } from '@bitrate/ui-react'
import {
  releaseStatusLabels,
  releaseTypeLabels,
  useReleases,
} from '@entities/release'
import { CreateReleaseButton } from '@features/workspace-actions'
import { useAuthContext } from '@shared/hooks/AuthContext'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { Music2 } from 'lucide-react'

interface ReleaseListProps {
  page: number
  createdId?: string
}

const dateFormat = new Intl.DateTimeFormat('en', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

export function ReleaseList({ page, createdId }: ReleaseListProps) {
  const { artist } = useAuthContext()
  const releases = useReleases(artist?.id, page)
  const data = releases.data
  const savedDraft = data?.data.some(
    (release) => release.id === createdId && release.status === 'DRAFT',
  )

  if (releases.isPending)
    return (
      <p className="py-8 text-text-secondary" role="status">
        Loading your releases…
      </p>
    )
  if (releases.isError)
    return (
      <div className="artist-release-panel space-y-4 rounded-xl border border-border p-6">
        <p role="alert">{releases.error.message}</p>
        <Button
          onClick={() => {
            void releases.refetch()
          }}
          variant="outline"
        >
          Try again
        </Button>
      </div>
    )
  if (!data) return null

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit))
  return (
    <div aria-busy={releases.isFetching} className="space-y-6">
      {savedDraft && (
        <p
          className="rounded-lg border border-border bg-secondary p-4 text-sm"
          role="status"
        >
          Draft created. Your release is saved in Music.
        </p>
      )}
      {data.data.length === 0 ? (
        <div className="artist-release-panel space-y-4 rounded-xl border border-border px-6 py-10">
          <Music2 aria-hidden="true" className="size-8 text-accent" />
          <h2 className="text-xl">
            {data.total === 0
              ? 'Your first release starts here'
              : 'No releases on this page'}
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-text-secondary">
            {data.total === 0
              ? 'Create a draft with a title and release type. Your music stays unpublished while you prepare it.'
              : 'Choose another page to see your releases.'}
          </p>
          {data.total === 0 && (
            <CreateReleaseButton className="hidden lg:inline-flex" />
          )}
        </div>
      ) : (
        <ul aria-label="Your releases" className="space-y-3">
          {data.data.map((release) => (
            <li
              className="artist-release-panel flex gap-4 rounded-xl border border-border p-5"
              key={release.id}
            >
              <Music2
                aria-hidden="true"
                className="mt-1 size-6 shrink-0 text-accent"
              />
              <div className="min-w-0 flex-1 space-y-3">
                <h2 className="break-words text-lg font-medium">
                  {release.title}
                </h2>
                <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary">
                  <div>
                    <dt className="sr-only">Release type</dt>
                    <dd>{releaseTypeLabels[release.type]}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Workspace status</dt>
                    <dd>{releaseStatusLabels[release.status]}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Created</dt>
                    <dd>
                      <time dateTime={release.createdAt}>
                        {dateFormat.format(new Date(release.createdAt))}
                      </time>
                    </dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ul>
      )}
      {data.total > 0 && (
        <nav
          aria-label="Release pages"
          className="flex flex-wrap items-center gap-3 text-sm"
        >
          {page > 1 ? (
            <Button asChild variant="outline">
              <Link search={{ page: page - 1 }} to={ROUTES.dashboard.music}>
                Previous
              </Link>
            </Button>
          ) : (
            <Button disabled variant="outline">
              Previous
            </Button>
          )}
          <p>
            Page {page} of {totalPages} · {data.total} releases
          </p>
          {page < totalPages ? (
            <Button asChild variant="outline">
              <Link search={{ page: page + 1 }} to={ROUTES.dashboard.music}>
                Next
              </Link>
            </Button>
          ) : (
            <Button disabled variant="outline">
              Next
            </Button>
          )}
        </nav>
      )}
      <p className="text-sm text-text-secondary">
        Track uploads, artwork and release detail editing are coming soon.
      </p>
    </div>
  )
}
