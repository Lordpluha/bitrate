import { Button } from '@bitrate/ui-react'
import {
  CATALOGUE_PAGE_SIZE,
  type CatalogueSearch,
  useMusicCatalogue,
  useMusicCounts,
} from '@entities/music'
import {
  CreateReleaseButton,
  useWorkspaceActions,
} from '@features/workspace-actions'
import { useAuthContext } from '@shared/hooks/AuthContext'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { useNavigate } from '@tanstack/react-router'
import { Upload } from 'lucide-react'
import { useState } from 'react'
import { catalogueSortLabels } from '../model/sort'
import { usePreviewPlayer } from '../model/usePreviewPlayer'
import { CatalogueEmptyState } from './CatalogueEmptyState'
import { CatalogueFilters } from './CatalogueFilters'
import {
  type CatalogueDetails,
  CatalogueItemDialog,
} from './CatalogueItemDialog'
import { CataloguePagination } from './CataloguePagination'
import { type CatalogueItem, CatalogueTable } from './CatalogueTable'

export function MusicCatalogue({ search }: { search: CatalogueSearch }) {
  const { artist } = useAuthContext()
  const { openAction } = useWorkspaceActions()
  const navigate = useNavigate()
  const tab = search.tab ?? (search.created ? 'releases' : 'tracks')
  const catalogue = useMusicCatalogue(artist?.id, tab, search)
  const counts = useMusicCounts(artist?.id)
  const [details, setDetails] = useState<CatalogueDetails | null>(null)
  const [updatedNotice, setUpdatedNotice] = useState<string | null>(null)
  const preview = usePreviewPlayer()
  const { t, tMessage, tp } = useI18n()

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
  const pages = Math.max(
    1,
    Math.ceil((data?.total ?? 0) / (data?.limit ?? CATALOGUE_PAGE_SIZE)),
  )
  const saved = records.some(
    (item) => item.id === search.created && item.status === 'DRAFT',
  )
  const filtered = Boolean(search.q || search.status || search.type)

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="artist-music-tabs-actions flex flex-wrap items-center justify-between gap-4">
        <fieldset className="flex min-w-0 gap-3">
          <legend className="sr-only">{t('music.tabs.legend')}</legend>
          {(['tracks', 'releases'] as const).map((value) => (
            <Button
              aria-pressed={tab === value}
              className={`gap-2 ${tab === value ? 'artist-workspace-nav-selected' : ''}`}
              key={value}
              onClick={() => change({ tab: value, page: 1 })}
              variant="outline"
            >
              {t(
                value === 'tracks'
                  ? 'music.tabs.tracks'
                  : 'music.tabs.releases',
              )}{' '}
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
              {t('music.uploadTrack')}
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
          {t('music.draftUpdated', { title: updatedNotice })}
        </p>
      )}
      {saved && (
        <p
          className="rounded-lg border border-border bg-secondary p-4 text-sm"
          role="status"
        >
          {t('music.draftCreated')}
        </p>
      )}
      {counts.isError && (
        <p className="text-xs text-text-secondary" role="status">
          {t('music.countsUnavailable')}{' '}
          <button
            className="underline"
            onClick={() => {
              void counts.refetch()
            }}
            type="button"
          >
            {t('common.tryAgain')}
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
                {t(catalogueSortLabels[search.sort ?? 'updated'].label)}
              </span>
              <span>{tp({ count: data.total, key: 'common.tracks' })}</span>
            </div>
          )}
          {catalogue.isPending ? (
            <p className="px-6 py-16 text-text-secondary" role="status">
              {t(
                tab === 'tracks'
                  ? 'music.loading.tracks'
                  : 'music.loading.releases',
              )}
            </p>
          ) : catalogue.isError ? (
            <div className="space-y-4 px-6 py-12">
              <p role="alert">{tMessage(catalogue.error.message)}</p>
              <Button
                onClick={() => {
                  void catalogue.refetch()
                }}
                variant="outline"
              >
                {t('common.tryAgain')}
              </Button>
            </div>
          ) : records.length === 0 ? (
            <CatalogueEmptyState
              filtered={filtered}
              onReset={() => change({ tab, page: 1 })}
              onUploadTrack={() => openAction('upload-track')}
              tab={tab}
            />
          ) : (
            <CatalogueTable
              onActions={(item) => setDetails({ item, mode: 'actions' })}
              onDetails={(item) => setDetails({ item, mode: 'details' })}
              onPlay={preview.toggle}
              playingId={preview.playing ? preview.active?.id : undefined}
              records={records}
              tab={tab}
            />
          )}
          {data && data.total > 0 && (
            <CataloguePagination
              demo={records.some((item) => item.isDemo)}
              limit={data.limit}
              onPage={(next) => change({ ...search, tab, page: next })}
              page={page}
              pages={pages}
              shown={records.length}
              sort={search.sort}
              tab={tab}
              total={data.total}
            />
          )}
        </div>
      </div>
      {preview.active && preview.playing && (
        <p className="text-xs text-text-secondary" role="status">
          {t('music.playing', { title: preview.active.title })}
          {preview.active.isDemo ? ` · ${t('music.sampleAudio')}` : ''}
        </p>
      )}
      {preview.playError && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(preview.playError)}
        </p>
      )}
      <audio
        key={preview.active?.id}
        onEnded={preview.stop}
        onError={preview.fail}
        preload="none"
        ref={preview.audioRef}
        src={preview.active?.previewUrl ?? undefined}
      >
        <track kind="captions" />
      </audio>
      {details && (
        <CatalogueItemDialog
          artistId={artist?.id}
          details={details}
          onChange={setDetails}
          onSaved={(release) => setUpdatedNotice(release.title)}
        />
      )}
    </div>
  )
}
