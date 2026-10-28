import { cn } from '@bitrate/ui-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useI18n } from '@/shared/i18n'

type ProfileSectionProps = {
  children: ReactNode
  className?: string
  showAllHref?: string
  subtitle?: string
  title: string
}

/** One profile tile (the design's bento Panel): an H4 title, an optional subtitle and Show all. */
export const ProfileSection = ({
  children,
  className,
  showAllHref,
  subtitle,
  title,
}: ProfileSectionProps) => {
  const { t } = useI18n()

  return (
    <section
      className={cn(
        'flex min-w-0 flex-col gap-3.5 rounded-[14px] border border-border bg-card p-5 md:p-6',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {subtitle ? (
            <p className="text-[13px] text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {showAllHref ? (
          <Link
            className="shrink-0 text-[13px] font-semibold text-accent hover:underline"
            href={showAllHref}
          >
            {t('common.showAll')}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  )
}
