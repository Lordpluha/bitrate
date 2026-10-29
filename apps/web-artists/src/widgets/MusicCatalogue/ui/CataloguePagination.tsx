import { Button } from '@bitrate/ui-react'
import type { CatalogueSearch } from '@entities/music'
import { useI18n } from '@shared/i18n'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { catalogueSortLabels } from '../model/sort'

interface CataloguePaginationProps {
  tab: 'tracks' | 'releases'
  page: number
  pages: number
  total: number
  limit: number
  /** Rows on this page; zero when the page is past the end. */
  shown: number
  demo: boolean
  sort: CatalogueSearch['sort']
  onPage: (page: number) => void
}

export function CataloguePagination({
  tab,
  page,
  pages,
  total,
  limit,
  shown,
  demo,
  sort,
  onPage,
}: CataloguePaginationProps) {
  const { t } = useI18n()
  return (
    <footer className="artist-music-footer" data-single-page={pages === 1}>
      <p>
        {t('music.pagination.range', {
          from: shown ? (page - 1) * limit + 1 : 0,
          to: Math.min(page * limit, total),
          total,
        })}
        {demo ? ` · ${t('music.pagination.demo')}` : ''}
      </p>
      <nav
        aria-label={t(
          tab === 'tracks'
            ? 'music.pagination.trackPages'
            : 'music.pagination.releasePages',
        )}
        className="flex items-center justify-center gap-2"
      >
        <Button
          aria-label={t('music.pagination.previous')}
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          size="icon"
          variant="outline"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </Button>
        <span className="artist-workspace-nav-selected rounded-lg border px-3 py-2 text-artist-caption">
          {t('common.pageOf', { page, total: pages })}
        </span>
        <Button
          aria-label={t('music.pagination.next')}
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          size="icon"
          variant="outline"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      </nav>
      <p className="artist-music-sort-note">
        {t(catalogueSortLabels[sort ?? 'updated'].note)}
      </p>
    </footer>
  )
}
