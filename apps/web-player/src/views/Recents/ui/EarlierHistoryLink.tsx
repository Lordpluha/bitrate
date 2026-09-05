import { ROUTES } from '@shared/routes'
import { getPlaylistCoverUrl } from '@shared/utils/mediaUrl'
import { MoreHorizontal } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useI18n } from '@/shared/i18n'

export const EarlierHistoryLink = () => {
  const { t } = useI18n()

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold text-text">
        {t('recents.earlier')}
      </h2>
      <Link
        className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-1 py-1 transition-colors hover:bg-white/10 sm:grid-cols-[64px_minmax(0,1fr)_auto]"
        href={ROUTES.likedSongs}
      >
        <Image
          alt=""
          className="h-13 w-13 rounded object-cover sm:h-16 sm:w-16"
          height={64}
          src={getPlaylistCoverUrl(null)}
          unoptimized
          width={64}
        />
        <span className="min-w-0">
          <span className="block truncate text-base text-text">
            {t('library.likedSongs')}
          </span>
          <span className="block truncate text-sm text-text-subdued">
            {t('common.playlist')}
          </span>
        </span>
        <MoreHorizontal
          aria-hidden="true"
          className="text-text-subdued"
          size={20}
        />
      </Link>
    </section>
  )
}
