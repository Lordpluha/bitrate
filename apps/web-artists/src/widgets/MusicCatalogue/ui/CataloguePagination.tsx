import type { CatalogueSearch } from '@entities/music'
import { useI18n } from '@shared/i18n'
import { Pagination } from '@shared/ui'
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
      <Pagination
        label={t(
          tab === 'tracks'
            ? 'music.pagination.trackPages'
            : 'music.pagination.releasePages',
        )}
        onPage={onPage}
        page={page}
        pages={pages}
      />
      <p className="artist-music-sort-note">
        {t(catalogueSortLabels[sort ?? 'updated'].note)}
      </p>
    </footer>
  )
}
