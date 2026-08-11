import { CheckCircle2, Heart } from 'lucide-react'
import Image from 'next/image'
import type { NowPlayingTrackProps } from './nowPlaying.types'

export const NowPlayingHero = ({
  artist,
  coverUrl,
  isLiked = false,
  onLikeToggle,
  title,
}: NowPlayingTrackProps) => (
  <section className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-5 px-4 pb-28 pt-3 sm:px-6 sm:pb-30 sm:pt-5 [@media(orientation:landscape)_and_(max-height:600px)]:grid [@media(orientation:landscape)_and_(max-height:600px)]:grid-cols-2 [@media(orientation:landscape)_and_(max-height:600px)]:gap-6 [@media(orientation:landscape)_and_(max-height:600px)]:pb-24 [@media(orientation:landscape)_and_(max-height:600px)]:pt-1 xl:pb-32">
      <Image
        alt={`Cover for ${title}`}
        className="aspect-square w-full max-w-[min(30.5rem,calc(100dvh-16rem))] rounded-md object-cover shadow-2xl sm:rounded-xl [@media(orientation:landscape)_and_(max-height:600px)]:w-[min(42vw,calc(100dvh-9rem))] [@media(orientation:landscape)_and_(max-height:600px)]:justify-self-end"
        height={488}
        src={coverUrl}
        unoptimized
        width={488}
      />

      <div className="w-full max-w-122 [@media(orientation:landscape)_and_(max-height:600px)]:max-w-sm [@media(orientation:landscape)_and_(max-height:600px)]:justify-self-start">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold text-white sm:text-2xl">
              {title}
            </h2>
            <p className="mt-1 text-sm text-white/60">{artist}</p>
          </div>
          <button
            aria-label={isLiked ? `Unlike ${title}` : `Like ${title}`}
            aria-pressed={isLiked}
            className="ml-4 shrink-0 rounded-full p-2 text-white/50 transition-colors hover:text-white"
            onClick={onLikeToggle}
            type="button"
          >
            {isLiked ? (
              <CheckCircle2
                aria-hidden="true"
                className="fill-green-500 text-green-500"
                size={22}
              />
            ) : (
              <Heart aria-hidden="true" size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  </section>
)
