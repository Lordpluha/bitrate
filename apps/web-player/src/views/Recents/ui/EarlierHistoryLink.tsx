import { ROUTES } from '@shared/routes'
import { getPlaylistCoverUrl } from '@shared/utils/mediaUrl'
import { MoreHorizontal } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useI18n } from '@/shared/i18n'

export const EarlierHistoryLink = () => {
  const { t } = useI18n()

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-semibold text-foreground">
        {t('recents.earlier')}
      </h2>
      <Link
        className="grid min-h-16 grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface"
        href={ROUTES.likedSongs}
      >
        <Image
          alt=""
          className="size-11.5 rounded-md object-cover"
          height={46}
          src={getPlaylistCoverUrl(null)}
          unoptimized
          width={46}
        />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-foreground">
            {t('library.likedSongs')}
          </span>
          <span className="truncate text-[13px] text-muted-foreground">
            {t('common.playlist')}
          </span>
        </span>
        <MoreHorizontal
          aria-hidden="true"
          className="text-muted-foreground"
          size={20}
        />
      </Link>
    </section>
  )
}
