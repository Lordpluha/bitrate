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
  const statuses =
    tab === 'tracks'
      ? trackStatuses.map((value) => ({
          value,
          label: trackStatusLabels[value],
        }))
      : Object.entries(releaseStatusLabels).map(([value, label]) => ({
          value,
          label,
        }))
  const types =
    tab === 'tracks'
      ? trackVersions.map((value) => ({
          value,
          label: trackVersionLabels[value],
        }))
      : releaseTypes.map((value) => ({
          value,
          label: releaseTypeLabels[value],
        }))
  return (
    <div className="artist-music-filters">
      <div className="artist-music-search relative block min-w-0">
        <Search
          aria-hidden="true"
          className="absolute left-3.5 top-3.5 size-4 text-text-secondary"
        />
        <Input
          aria-label={`Search ${tab}`}
          className="artist-music-control h-11 pl-11 text-[0.8125rem]"
          maxLength={100}
          onChange={(event) =>
            onChange({ ...search, q: event.target.value || undefined, page: 1 })
          }
          placeholder={`Search ${tab}`}
          value={search.q ?? ''}
        />
      </div>
      <div className="artist-music-filter relative">
        <ListFilter
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-3.5 z-10 size-4 text-text-secondary"
        />
        <NativeSelect
          aria-label="Status filter"
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
          <option value="">Status: All</option>
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
          aria-label="Type filter"
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
          <option value="">Type: All</option>
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
          aria-label="Sort catalogue"
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
              {label}
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
        Reset
      </Button>
    </div>
  )
}
