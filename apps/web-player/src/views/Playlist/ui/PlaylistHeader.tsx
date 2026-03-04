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
    <div className="relative h-85 bg-linear-to-b from-purple-800 to-gray-900 p-6">
      <BackButton className="absolute top-6 left-6 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-colors">
        <ArrowLeft className="text-white" size={20} />
      </BackButton>

      <div className="flex items-end gap-6 h-full">
        <Image
          alt={title}
          className="shadow-2xl rounded"
          height={232}
          src={imageUrl}
          width={232}
        />
        <div className="flex flex-col gap-2 pb-4">
          <span className="text-sm font-bold uppercase">{type}</span>
          <h1 className="text-6xl font-bold">{title}</h1>
          <div className="flex items-center gap-2 text-sm mt-2">
            <span className="font-semibold">{author}</span>
            <span>•</span>
            <span>{tracksCount} songs</span>
            <span>•</span>
            <span>{TimeUtils.formatDuration(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
