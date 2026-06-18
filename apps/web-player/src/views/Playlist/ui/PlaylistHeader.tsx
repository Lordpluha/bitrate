import { BackButton } from '@shared/ui/BackButton'
import { TimeUtils } from '@shared/utils/TimeUtils'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'

interface PlaylistHeaderProps {
  title: string
  type: string
  imageUrl: string
  author: string
  tracksCount: number
  duration: number
}

export const PlaylistHeader = ({
  title,
  type,
  imageUrl,
  author,
  tracksCount,
  duration,
}: PlaylistHeaderProps) => {
  return (
    <div className="relative text-white bg-linear-to-b from-purple-800 to-background h-85 p-6 max-[1024px]:h-auto max-[1024px]:px-4 max-[1024px]:py-5">
      <BackButton className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-colors absolute top-6 left-6 max-[1024px]:static">
        <ArrowLeft size={20} className="text-white" />
      </BackButton>

      <div className="h-full flex flex-row items-end gap-6 mt-0 max-[1024px]:mt-4 max-[1024px]:flex-col max-[1024px]:items-start max-[1024px]:gap-4">
        <Image
          alt={title}
          width={232}
          height={232}
          className="shadow-2xl rounded object-cover w-58 h-58 max-[1024px]:w-52 max-[1024px]:h-52"
        />
        <div className="flex flex-col gap-2 pb-4 max-[1024px]:pb-0">
          <span className="text-sm tracking-wide font-bold uppercase text-white/80 max-[1024px]:text-xs max-[1024px]:font-semibold">
            {type}
          </span>
          <h1 className="text-6xl leading-tight font-bold max-[1024px]:text-4xl">{title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm mt-1">
            <span className="font-semibold">{author}</span>
            <span className="text-white/50">•</span>
            <span>{tracksCount} songs</span>
            <span className="text-white/50">•</span>
            <span>{TimeUtils.formatDuration(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
