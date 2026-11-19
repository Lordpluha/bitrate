import { Button, Input } from '@bitrate/ui-react'
import {
  type GenreOption,
  MAX_RECORDING_GENRES,
  type ReleaseWorkspace,
  useGenres,
  useSaveTrackGenres,
} from '@entities/release'
import { useI18n } from '@shared/i18n'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { X } from 'lucide-react'
import { useId, useState } from 'react'

interface TrackGenresDialogProps {
  artistId: string
  release: ReleaseWorkspace
  trackId: string
  onClose: () => void
  onSaved: () => void
}

/** Picks the catalogue genres of one recording on a draft release. */
export function TrackGenresDialog({
  artistId,
  release,
  trackId,
  onClose,
  onSaved,
}: TrackGenresDialogProps) {
  const { t, tMessage } = useI18n()
  const id = useId()
  const catalogue = useGenres()
  const save = useSaveTrackGenres(artistId)
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const initial =
    release.trackDrafts.find((item) => item.id === trackId)?.genres ?? []
  const [chosen, setChosen] = useState<GenreOption[]>(initial)
  const [query, setQuery] = useState('')
  const chosenIds = new Set(chosen.map((genre) => genre.id))
  const unchanged =
    chosen.length === initial.length &&
    initial.every((genre) => chosenIds.has(genre.id))
  const full = chosen.length >= MAX_RECORDING_GENRES
  const needle = query.trim().toLocaleLowerCase()
  const matches = (catalogue.data ?? []).filter((genre) =>
    genre.name.toLocaleLowerCase().includes(needle),
  )

  const toggle = (genre: GenreOption) => {
    save.reset()
    setChosen((current) =>
      current.some((item) => item.id === genre.id)
        ? current.filter((item) => item.id !== genre.id)
        : [...current, genre],
    )
  }

  const submit = async () => {
    try {
      await save.mutateAsync({
        id: release.id,
        trackId,
        genreIds: chosen.map((genre) => genre.id),
        expectedUpdatedAt,
      })
      onSaved()
    } catch {
      // Keep the choice when the write is rejected or unconfirmed.
    }
  }

  return (
    <WorkspaceModal
      canClose={!save.isPending}
      className="artist-release-credit-modal"
      onClose={onClose}
      title={t('media.genres.title')}
    >
      <form
        aria-busy={save.isPending}
        className="space-y-5"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <p className="text-sm text-text-secondary">
          {t('media.genres.intro', { max: MAX_RECORDING_GENRES })}
        </p>
        <section aria-labelledby={`${id}-chosen`} className="space-y-2">
          <h3 className="text-sm font-medium" id={`${id}-chosen`}>
            {t('media.genres.chosen')} ({chosen.length}/{MAX_RECORDING_GENRES})
          </h3>
          {chosen.length === 0 ? (
            <p className="text-sm text-text-secondary">
              {t('media.genres.none')}
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {chosen.map((genre) => (
                <li
                  className="inline-flex items-center gap-1 rounded-full border border-border py-0.5 pr-1 pl-3 text-sm"
                  key={genre.id}
                >
                  {genre.name}
                  <Button
                    aria-label={t('media.genres.remove', { genre: genre.name })}
                    className="size-6"
                    disabled={save.isPending}
                    onClick={() => toggle(genre)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <X aria-hidden="true" className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor={`${id}-search`}>
            {t('media.genres.search')}
          </label>
          <Input
            autoComplete="off"
            data-initial-focus
            id={`${id}-search`}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            value={query}
          />
        </div>
        {catalogue.isError ? (
          <p className="text-sm text-destructive" role="alert">
            {t('media.genres.loadFailed')}
          </p>
        ) : catalogue.isPending ? (
          <p className="text-sm text-text-secondary" role="status">
            {t('media.genres.loading')}
          </p>
        ) : matches.length === 0 ? (
          <p className="text-sm text-text-secondary">
            {t('media.genres.noMatch', { query: query.trim() })}
          </p>
        ) : (
          <ul className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {matches.map((genre) => {
              const checked = chosenIds.has(genre.id)
              return (
                <li key={genre.id}>
                  <label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm has-disabled:opacity-60">
                    <input
                      checked={checked}
                      disabled={save.isPending || (!checked && full)}
                      onChange={() => toggle(genre)}
                      type="checkbox"
                    />
                    {genre.name}
                  </label>
                </li>
              )
            })}
          </ul>
        )}
        {save.error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(save.error.message)}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            disabled={save.isPending}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            {t('common.cancel')}
          </Button>
          <Button
            className="artist-workspace-primary"
            disabled={save.isPending || chosen.length === 0 || unchanged}
            type="submit"
            variant="primary"
          >
            {save.isPending ? t('common.saving') : t('media.genres.save')}
          </Button>
        </div>
      </form>
    </WorkspaceModal>
  )
}
