import { Button } from '@bitrate/ui-react'
import {
  type CatalogueSearch,
  type MusicTrack,
  trackVersionLabels,
  useMusicCatalogue,
  useMusicCounts,
} from '@entities/music'
import { releaseTypeLabels } from '@entities/release'
import { EditReleaseDialog } from '@features/edit-release'
import {
  CreateReleaseButton,
  useWorkspaceActions,
} from '@features/workspace-actions'
import { useAuthContext } from '@shared/hooks/AuthContext'
import { ROUTES } from '@shared/routes/routes'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { CatalogueFilters } from './CatalogueFilters'
import {
  type CatalogueItem,
  CatalogueStatus,
  CatalogueTable,
  trackDuration,
} from './CatalogueTable'

export function MusicCatalogue({ search }: { search: CatalogueSearch }) {
  const { artist } = useAuthContext()
  const { openAction } = useWorkspaceActions()
  const navigate = useNavigate()
  const tab = search.tab ?? (search.created ? 'releases' : 'tracks')
  const catalogue = useMusicCatalogue(artist?.id, tab, search)
  const counts = useMusicCounts(artist?.id)
  const [details, setDetails] = useState<{
    item: CatalogueItem
    mode: 'details' | 'actions' | 'edit'
  } | null>(null)
  const [updatedNotice, setUpdatedNotice] = useState<string | null>(null)
  const [active, setActive] = useState<MusicTrack | null>(null)
  const [playing, setPlaying] = useState(false)
  const [playError, setPlayError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    let current = true
    if (playing && active?.previewUrl) {
      void audio.play().catch(() => {
        if (!current) return
        setPlaying(false)
        setPlayError('Preview could not be played. Please try again.')
      })
    } else audio.pause()
    return () => {
      current = false
      audio.pause()
    }
  }, [playing, active])

  const change = (next: CatalogueSearch) => {
    void navigate({
      to: ROUTES.dashboard.music,
      search: next,
      replace: true,
      resetScroll: false,
    })
  }
  const data = catalogue.data
  const records: readonly CatalogueItem[] = data?.data ?? []
  const page = search.page ?? 1
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.limit ?? 6)))
  const saved = records.some(
    (item) => item.id === search.created && item.status === 'DRAFT',
  )
  const filtered = Boolean(search.q || search.status || search.type)

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="artist-music-tabs-actions flex flex-wrap items-center justify-between gap-4">
        <fieldset className="flex min-w-0 gap-3">
          <legend className="sr-only">Music views</legend>
          {(['tracks', 'releases'] as const).map((value) => (
            <Button
              aria-pressed={tab === value}
              className={`gap-2 ${tab === value ? 'artist-workspace-nav-selected' : ''}`}
              key={value}
              onClick={() => change({ tab: value, page: 1 })}
              variant="outline"
            >
              {value === 'tracks' ? 'Tracks' : 'Releases'}{' '}
              <span>{counts.data?.[value] ?? '…'}</span>
            </Button>
          ))}
        </fieldset>
        <div className="artist-music-create">
          {tab === 'tracks' ? (
            <Button
              className="artist-workspace-primary h-11 w-full gap-2 rounded-full"
              onClick={() => openAction('upload-track')}
              variant="primary"
            >
              <Upload aria-hidden="true" className="size-4" />
              Upload track
            </Button>
          ) : (
            <CreateReleaseButton className="w-full" />
          )}
        </div>
      </div>
      <CatalogueFilters onChange={change} search={search} tab={tab} />
      {updatedNotice && (
        <p
          className="rounded-lg border border-border bg-secondary p-4 text-sm"
          role="status"
        >
          Draft updated: {updatedNotice}
        </p>
      )}
      {saved && (
        <p
          className="rounded-lg border border-border bg-secondary p-4 text-sm"
          role="status"
        >
          Draft created. Your release is saved in Music.
        </p>
      )}
      {counts.isError && (
        <p className="text-xs text-text-secondary" role="status">
          Counts unavailable.{' '}
          <button
            className="underline"
            onClick={() => {
              void counts.refetch()
            }}
            type="button"
          >
            Try again
          </button>
        </p>
      )}
      <div
        aria-busy={catalogue.isFetching}
        className="artist-music-surface relative overflow-hidden rounded-xl border border-border"
        data-tab={tab}
      >
        <img
          alt=""
          aria-hidden="true"
          className="artist-music-surface-art"
          src={`/artwork/music/${tab === 'tracks' ? 'tracks-reel-transport-v1.png' : 'releases-lacquer-stack-v1.png'}`}
        />
        <div className="artist-music-surface-veil" />
        <div className="relative">
          {data && tab === 'tracks' && (
            <div className="artist-music-mobile-table-heading">
              <span>
                {search.sort === 'title'
                  ? 'Title A–Z'
                  : search.sort === 'oldest'
                    ? 'Oldest updated'
                    : 'Recently updated'}
              </span>
              <span>{data.total} tracks</span>
            </div>
          )}
          {catalogue.isPending ? (
            <p className="px-6 py-16 text-text-secondary" role="status">
              Loading your {tab}…
            </p>
          ) : catalogue.isError ? (
            <div className="space-y-4 px-6 py-12">
              <p role="alert">{catalogue.error.message}</p>
              <Button
                onClick={() => {
                  void catalogue.refetch()
                }}
                variant="outline"
              >
                Try again
              </Button>
            </div>
          ) : records.length === 0 ? (
            <div className="space-y-4 px-6 py-14">
              <h2 className="text-lg">
                {filtered
                  ? `No matching ${tab}`
                  : tab === 'tracks'
                    ? 'Your first track starts here'
                    : 'Your first release starts here'}
              </h2>
              <p className="text-sm text-text-secondary">
                {filtered
                  ? 'Try another search or reset your filters.'
                  : tab === 'tracks'
                    ? 'Your recordings and their preparation stages will appear here.'
                    : 'Create a draft with a title and release type. Your music stays unpublished while you prepare it.'}
              </p>
              {filtered ? (
                <Button
                  onClick={() => change({ tab, page: 1 })}
                  variant="outline"
                >
                  Reset filters
                </Button>
              ) : tab === 'releases' ? (
                <CreateReleaseButton />
              ) : (
                <Button
                  onClick={() => openAction('upload-track')}
                  variant="outline"
                >
                  Upload track
                </Button>
              )}
            </div>
          ) : (
            <CatalogueTable
              onActions={(item) => setDetails({ item, mode: 'actions' })}
              onDetails={(item) => setDetails({ item, mode: 'details' })}
              onPlay={(track) => {
                setPlayError(null)
                setActive(track)
                setPlaying(active?.id === track.id ? !playing : true)
              }}
              playingId={playing ? active?.id : undefined}
              records={records}
              tab={tab}
            />
          )}
          {data && data.total > 0 && (
            <footer
              className="artist-music-footer"
              data-single-page={pages === 1}
            >
              <p>
                {records.length ? (page - 1) * data.limit + 1 : 0}–
                {Math.min(page * data.limit, data.total)} of {data.total}
                {records.some((item) => item.isDemo) ? ' · Demo data' : ''}
              </p>
              <nav
                aria-label={`${tab === 'tracks' ? 'Track' : 'Release'} pages`}
                className="flex items-center justify-center gap-2"
              >
                <Button
                  aria-label="Previous"
                  disabled={page <= 1}
                  onClick={() => change({ ...search, tab, page: page - 1 })}
                  size="icon"
                  variant="outline"
                >
                  <ChevronLeft aria-hidden="true" className="size-4" />
                </Button>
                <span className="artist-workspace-nav-selected rounded-lg border px-3 py-2 text-[0.625rem]">
                  Page {page} of {pages}
                </span>
                <Button
                  aria-label="Next"
                  disabled={page >= pages}
                  onClick={() => change({ ...search, tab, page: page + 1 })}
                  size="icon"
                  variant="outline"
                >
                  <ChevronRight aria-hidden="true" className="size-4" />
                </Button>
              </nav>
              <p className="artist-music-sort-note">
                {search.sort === 'title'
                  ? 'Sorted by title'
                  : search.sort === 'oldest'
                    ? 'Sorted by oldest updated'
                    : 'Sorted by recently updated'}
              </p>
            </footer>
          )}
        </div>
      </div>
      {active && playing && (
        <p className="text-xs text-text-secondary" role="status">
          Playing {active.title}
          {active.isDemo ? ' · Illustrative sample audio' : ''}
        </p>
      )}
      {playError && (
        <p className="text-sm text-destructive" role="alert">
          {playError}
        </p>
      )}
      <audio
        key={active?.id}
        onEnded={() => setPlaying(false)}
        onError={() => {
          setPlaying(false)
          setPlayError('Preview is unavailable.')
        }}
        preload="none"
        ref={audioRef}
        src={active?.previewUrl ?? undefined}
      >
        <track kind="captions" />
      </audio>
      {details?.mode === 'edit' && artist ? (
        <EditReleaseDialog
          artistId={artist.id}
          onClose={() => setDetails(null)}
          onSaved={(release) => {
            setDetails(null)
            setUpdatedNotice(release.title)
          }}
          releaseId={details.item.id}
        />
      ) : (
        details && (
          <WorkspaceModal
            onClose={() => setDetails(null)}
            title={
              details.mode === 'actions'
                ? `Actions for ${details.item.title}`
                : details.item.title
            }
          >
            <div className="space-y-5">
              <CatalogueStatus item={details.item} />
              <p className="text-sm text-text-secondary">
                {details.item.artistName} ·{' '}
                {'version' in details.item
                  ? `${trackVersionLabels[details.item.version]} · ${trackDuration(details.item.duration)}`
                  : `${releaseTypeLabels[details.item.type]} · ${details.item.trackCount} tracks`}
              </p>
              {details.item.isDemo && (
                <p className="text-sm text-text-secondary">
                  Illustrative demo record. This does not represent an actual
                  publication or delivery.
                </p>
              )}
              {!('version' in details.item) && (
                <Button asChild variant="outline">
                  <Link
                    onClick={() => setDetails(null)}
                    params={{ releaseId: details.item.id }}
                    to="/dashboard/music/$releaseId"
                  >
                    Open workspace
                  </Link>
                </Button>
              )}
              {!('version' in details.item) &&
                details.item.status === 'DRAFT' &&
                artist && (
                  <Button
                    className="artist-workspace-primary"
                    onClick={() => setDetails({ ...details, mode: 'edit' })}
                    variant="primary"
                  >
                    Edit draft
                  </Button>
                )}
              {details.mode === 'actions' ? (
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setDetails({ ...details, mode: 'details' })}
                    variant="outline"
                  >
                    View details
                  </Button>
                  <Button
                    onClick={() => {
                      setDetails(null)
                      openAction('create-release')
                    }}
                    variant="outline"
                  >
                    Create release
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-text-secondary">
                  Artwork changes and track uploads are coming soon.
                </p>
              )}
            </div>
          </WorkspaceModal>
        )
      )}
    </div>
  )
}
