import Image from 'next/image'
import Link from 'next/link'
import type { SearchResultRow } from '@/features/Search/model/types'

type SearchResultListProps = {
  items: SearchResultRow[]
}

export const SearchResultList = ({ items }: SearchResultListProps) => (
  <section>
    <div className="space-y-1">
      {items.map((item) => {
        const content = (
          <>
            <Image
              alt={item.title}
              className="size-16 rounded object-cover"
              height={64}
              src={item.image}
              unoptimized
              width={64}
            />
            <span className="min-w-0">
              <span className="block truncate text-base font-medium text-text">
                {item.title}
              </span>
              <span className="block truncate text-sm text-text-subdued">
                {item.subtitle}
              </span>
            </span>
            <span className="justify-self-end rounded bg-white/10 px-2 py-1 text-xs font-bold text-text-subdued">
              {item.kind}
            </span>
          </>
        )

        if (item.href) {
          return (
            <Link
              className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 rounded-md p-2 transition-colors hover:bg-surface"
              href={item.href}
              key={`${item.kind}-${item.title}`}
            >
              {content}
            </Link>
          )
        }

        return (
          <div
            className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 rounded-md p-2 transition-colors hover:bg-surface"
            key={`${item.kind}-${item.title}`}
          >
            {content}
          </div>
        )
      })}
    </div>
  </section>
)
