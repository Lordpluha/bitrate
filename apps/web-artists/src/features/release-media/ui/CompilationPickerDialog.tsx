import { Button, Input } from '@bitrate/ui-react'
import {
  type ReleaseWorkspace,
  useAddCompilationTracks,
  useCompilationCatalogue,
} from '@entities/release'
import { useI18n } from '@shared/i18n'
import { formatDuration } from '@shared/lib/format'
import { PageSkeleton, Pagination } from '@shared/ui'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { useId, useState } from 'react'

export function CompilationPickerDialog({
  artistId,
  release,
  onClose,
  onSaved,
}: {
  artistId: string
  release: ReleaseWorkspace
  onClose: () => void
  onSaved: () => void
}) {
  const { t, tMessage } = useI18n()
  const id = useId()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const catalogue = useCompilationCatalogue(artistId, release.id, page, search)
  const add = useAddCompilationTracks(artistId)
  const remaining = Math.max(0, 50 - release.trackCount)
  const pending = add.isPending
  const pages = Math.max(1, Math.ceil((catalogue.data?.total ?? 0) / 20))
  return (
    <WorkspaceModal
      canClose={!pending}
      onClose={onClose}
      title={t('compilation.title')}
    >
      <div className="space-y-5">
        <p className="text-sm text-text-secondary">{t('compilation.intro')}</p>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            setSearch(searchInput.trim())
            setPage(1)
          }}
        >
          <div className="min-w-0 flex-1 space-y-1">
            <label className="text-sm" htmlFor={`${id}-search`}>
              {t('compilation.search')}
            </label>
            <Input
              data-initial-focus
              disabled={pending}
              id={`${id}-search`}
              maxLength={255}
              onChange={(event) => setSearchInput(event.target.value)}
              value={searchInput}
            />
          </div>
          <Button disabled={pending} type="submit" variant="outline">
            {t('compilation.searchAction')}
          </Button>
        </form>
        <div aria-busy={catalogue.isFetching}>
          {catalogue.isPending || catalogue.isPlaceholderData ? (
            <PageSkeleton label={t('compilation.loading')} variant="table" />
          ) : catalogue.isError ? (
            <div className="space-y-3">
              <p role="alert">{tMessage(catalogue.error.message)}</p>
              <Button
                onClick={() => void catalogue.refetch()}
                variant="outline"
              >
                {t('common.tryAgain')}
              </Button>
            </div>
          ) : catalogue.data.data.length === 0 ? (
            <p className="text-sm text-text-secondary">
              {t(search ? 'compilation.noResults' : 'compilation.empty')}
            </p>
          ) : (
            <ul className="max-h-[45vh] divide-y divide-border overflow-y-auto rounded-lg border border-border px-3">
              {catalogue.data.data.map((track) => {
                const checked = selected.includes(track.id)
                return (
                  <li key={track.id}>
                    <label className="flex cursor-pointer items-center gap-3 py-3">
                      <input
                        checked={checked}
                        className="size-4 shrink-0 accent-primary"
                        disabled={
                          pending || (!checked && selected.length >= remaining)
                        }
                        onChange={() => {
                          add.reset()
                          setSelected((current) =>
                            checked
                              ? current.filter((value) => value !== track.id)
                              : [...current, track.id],
                          )
                        }}
                        type="checkbox"
                      />
                      <span className="min-w-0">
                        <span className="block break-words text-sm">
                          {track.title}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {track.duration === null
                            ? '—'
                            : formatDuration(track.duration)}
                          {track.isrc ? ` · ${track.isrc}` : ''}
                        </span>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        {pages > 1 && (
          <Pagination
            disabled={catalogue.isFetching || pending}
            label={t('compilation.pages')}
            onPage={setPage}
            page={catalogue.data?.page ?? page}
            pages={pages}
          />
        )}
        <p aria-live="polite" className="text-xs text-text-secondary">
          {t('compilation.selected', {
            count: selected.length,
            limit: remaining,
          })}
        </p>
        {add.error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(add.error.message)}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <Button disabled={pending} onClick={onClose} variant="outline">
            {t('common.cancel')}
          </Button>
          <Button
            aria-busy={pending}
            disabled={
              pending || selected.length === 0 || selected.length > remaining
            }
            onClick={() =>
              add.mutate(
                {
                  id: release.id,
                  trackIds: selected,
                  expectedUpdatedAt: release.updatedAt,
                },
                { onSuccess: onSaved },
              )
            }
            variant="primary"
          >
            {t(pending ? 'compilation.adding' : 'compilation.add', {
              count: selected.length,
            })}
          </Button>
        </div>
      </div>
    </WorkspaceModal>
  )
}
