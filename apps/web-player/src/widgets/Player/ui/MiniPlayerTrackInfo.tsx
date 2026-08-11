import Image from 'next/image'

type MiniPlayerTrackInfoProps = {
  artist: string
  coverUrl: string
  onExpand: () => void
  title: string
}

export const MiniPlayerTrackInfo = ({
  artist,
  coverUrl,
  onExpand,
  title,
}: MiniPlayerTrackInfoProps) => (
  <>
    <button
      aria-label="Open now playing"
      className="shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      onClick={onExpand}
      type="button"
    >
      <Image
        alt=""
        className="size-11 rounded object-cover min-[520px]:size-12"
        height={48}
        src={coverUrl}
        unoptimized
        width={48}
      />
    </button>
    <button
      aria-label={`Open now playing: ${title} by ${artist}`}
      className="min-w-0 flex-1 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      onClick={onExpand}
      type="button"
    >
      <p className="truncate text-sm font-semibold leading-tight text-white">
        {title}
      </p>
      <p className="mt-0.5 truncate text-xs text-white/65">{artist}</p>
    </button>
  </>
)
