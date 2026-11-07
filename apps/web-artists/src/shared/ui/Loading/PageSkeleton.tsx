import { cn } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { Skeleton } from './Skeleton'

const rows = ['first', 'second', 'third', 'fourth', 'fifth'] as const

function CardSkeleton() {
  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-5">
      <Skeleton className="h-4 w-32 max-w-full" />
      <Skeleton className="h-8 w-2/3" />
      <div className="space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  )
}

export function PageSkeleton({
  label,
  variant = 'cards',
  heading = false,
  className,
}: {
  label: string
  variant?: 'cards' | 'table' | 'release'
  heading?: boolean
  className?: string
}) {
  return (
    <div
      aria-busy="true"
      className={cn('min-w-0 space-y-5', className)}
      data-skeleton="page"
      role="status"
    >
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="space-y-5">
        {heading && (
          <div className="space-y-3">
            <Skeleton className="h-8 w-48 max-w-full" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
        )}
        {variant === 'table' ? (
          <div className="space-y-4 rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-4 w-2/5" />
            {rows.map((row) => (
              <div
                className="flex items-center gap-4 border-t border-border pt-4"
                key={row}
              >
                <Skeleton className="size-10 shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-5 w-12 shrink-0" />
              </div>
            ))}
          </div>
        ) : variant === 'release' ? (
          <>
            <div className="flex items-center gap-5 rounded-xl border border-border bg-card p-5">
              <Skeleton className="size-20 shrink-0" />
              <div className="min-w-0 flex-1 space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-24 max-w-full" />
              </div>
            </div>
            <Skeleton className="h-14 w-full rounded-xl" />
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}
      </div>
    </div>
  )
}

export function PagePending() {
  const { t } = useI18n()
  return (
    <PageSkeleton className="p-6" heading label={t('common.loadingPage')} />
  )
}
