import { Button, Input } from '@bitrate/ui-react'
import {
  type CatalogueSearch,
  trackStatuses,
  trackStatusLabels,
  trackVersionLabels,
  trackVersions,
} from '@entities/music'
import {
  releaseStatusLabels,
  releaseTypeLabels,
  releaseTypes,
} from '@entities/release'
import { useI18n } from '@shared/i18n'
import { NativeSelect } from '@shared/ui'
import { ArrowDownUp, Disc3, ListFilter, RotateCcw, Search } from 'lucide-react'
import { catalogueSortLabels } from '../model/sort'

interface CatalogueFiltersProps {
  tab: 'tracks' | 'releases'
  search: CatalogueSearch
  onChange: (next: CatalogueSearch) => void
}

export function CatalogueFilters({
  tab,
  search,
  onChange,
}: CatalogueFiltersProps) {
  const { t } = useI18n()
  const statuses =
    tab === 'tracks'
      ? trackStatuses.map((value) => ({
          value,
          label: t(trackStatusLabels[value]),
        }))
      : Object.entries(releaseStatusLabels).map(([value, label]) => ({
          value,
          label: t(label),
        }))
  const types =
    tab === 'tracks'
      ? trackVersions.map((value) => ({
          value,
          label: t(trackVersionLabels[value]),
        }))
      : releaseTypes.map((value) => ({
          value,
          label: t(releaseTypeLabels[value]),
        }))
  const searchLabel = t(
    tab === 'tracks'
      ? 'music.filter.searchTracks'
      : 'music.filter.searchReleases',
  )
  return (
    <div className="artist-music-filters">
      <div className="artist-music-search relative block min-w-0">
        <Search
          aria-hidden="true"
          className="absolute left-3.5 top-3.5 size-4 text-text-secondary"
        />
        <Input
          aria-label={searchLabel}
          className="artist-music-control h-11 pl-11 text-[0.8125rem]"
          maxLength={100}
          onChange={(event) =>
            onChange({ ...search, q: event.target.value || undefined, page: 1 })
          }
          placeholder={searchLabel}
          value={search.q ?? ''}
        />
      </div>
      <div className="artist-music-filter relative">
        <ListFilter
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-3.5 z-10 size-4 text-text-secondary"
        />
        <NativeSelect
          aria-label={t('music.filter.status')}
          className="artist-music-control h-11 pl-9 text-xs"
          onChange={(event) =>
            onChange({
              ...search,
              status: event.target.value || undefined,
              page: 1,
            })
          }
          value={search.status ?? ''}
        >
          <option value="">{t('music.filter.statusAll')}</option>
          {statuses.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="artist-music-filter relative">
        <Disc3
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-3.5 z-10 size-4 text-text-secondary"
        />
        <NativeSelect
          aria-label={t('music.filter.type')}
          className="artist-music-control h-11 pl-9 text-xs"
          onChange={(event) =>
            onChange({
              ...search,
              type: event.target.value || undefined,
              page: 1,
            })
          }
          value={search.type ?? ''}
        >
          <option value="">{t('music.filter.typeAll')}</option>
          {types.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="artist-music-sort relative">
        <ArrowDownUp
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-3.5 z-10 size-4 text-text-secondary"
        />
        <NativeSelect
          aria-label={t('music.filter.sort')}
          className="artist-music-control h-11 pl-9 text-xs"
          onChange={(event) =>
            onChange({
              ...search,
              sort:
                event.target.value === 'title'
                  ? 'title'
                  : event.target.value === 'oldest'
                    ? 'oldest'
                    : 'updated',
              page: 1,
            })
          }
          value={search.sort ?? 'updated'}
        >
          {Object.entries(catalogueSortLabels).map(([value, { label }]) => (
            <option key={value} value={value}>
              {t(label)}
            </option>
          ))}
        </NativeSelect>
      </div>
      <Button
        className="artist-music-reset text-xs text-text-secondary"
        onClick={() => onChange({ tab, page: 1 })}
        variant="ghost"
      >
        <RotateCcw aria-hidden="true" className="size-4 shrink-0" />
        {t('music.filter.reset')}
      </Button>
    </div>
  )
}
