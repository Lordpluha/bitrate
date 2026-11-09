import { Button, cn } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactElement, ReactNode } from 'react'

type PaginationProps = {
  page: number
  pages: number
  label: string
  disabled?: boolean
} & (
  | { onPage: (page: number) => void; renderLink?: never }
  | {
      onPage?: never
      renderLink: (page: number, content: ReactNode) => ReactElement
    }
)

/** A bounded window, with distinct gap keys so first and last pages always remain reachable. */
function pageItems(
  page: number,
  pages: number,
): (number | 'start-gap' | 'end-gap')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1)
  if (page <= 4) return [1, 2, 3, 4, 5, 'end-gap', pages]
  if (page >= pages - 3)
    return [1, 'start-gap', pages - 4, pages - 3, pages - 2, pages - 1, pages]
  return [1, 'start-gap', page - 1, page, page + 1, 'end-gap', pages]
}

/** Shared numbered pagination; local data uses callbacks and routed pages keep their links. */
export function Pagination({
  page,
  pages,
  label,
  disabled = false,
  onPage,
  renderLink,
}: PaginationProps) {
  const { t } = useI18n()

  const control = (
    target: number,
    content: ReactNode,
    name: string,
    unavailable = false,
  ) => {
    const blocked = disabled || unavailable
    const linked = !!renderLink && !blocked
    return (
      <Button
        aria-current={target === page && !unavailable ? 'page' : undefined}
        aria-label={name}
        asChild={linked}
        className={cn(
          'h-8 w-auto min-w-8 px-2 text-xs tabular-nums',
          target === page && !unavailable && 'artist-workspace-nav-selected',
        )}
        disabled={blocked}
        onClick={
          !linked && !blocked && target !== page && onPage
            ? () => onPage(target)
            : undefined
        }
        size="sm"
        type={linked ? undefined : 'button'}
        variant="outline"
      >
        {linked && renderLink ? renderLink(target, content) : content}
      </Button>
    )
  }

  return (
    <nav aria-busy={disabled} aria-label={label} className="min-w-0 max-w-full">
      <span className="sr-only">
        {t('common.pageOf', { page, total: pages })}
      </span>
      <ol className="flex flex-wrap items-center justify-center gap-1">
        <li>
          {control(
            Math.max(1, Math.min(pages, page - 1)),
            <ChevronLeft aria-hidden="true" className="size-4" />,
            t('common.previousPage'),
            page <= 1,
          )}
        </li>
        {pageItems(page, pages).map((item) => (
          <li key={item}>
            {typeof item === 'number' ? (
              control(item, item, t('common.pageNumber', { page: item }))
            ) : (
              <span
                aria-hidden="true"
                className="flex h-8 w-4 items-center justify-center text-text-secondary"
              >
                …
              </span>
            )}
          </li>
        ))}
        <li>
          {control(
            Math.min(pages, page + 1),
            <ChevronRight aria-hidden="true" className="size-4" />,
            t('common.nextPage'),
            page >= pages,
          )}
        </li>
      </ol>
    </nav>
  )
}
