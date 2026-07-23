import { cn } from '@spotify/ui-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

type ProfileSectionProps = {
  children: ReactNode
  className?: string
  showAllHref?: string
  subtitle?: string
  title: string
}

export const ProfileSection = ({
  children,
  className,
  showAllHref,
  subtitle,
  title,
}: ProfileSectionProps) => (
  <section className={cn(className)}>
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-text">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-text-subdued">{subtitle}</p>
        )}
      </div>
      {showAllHref && (
        <Link
          className="text-sm font-bold text-text-subdued hover:text-text"
          href={showAllHref}
        >
          Show all
        </Link>
      )}
    </div>
    {children}
  </section>
)
