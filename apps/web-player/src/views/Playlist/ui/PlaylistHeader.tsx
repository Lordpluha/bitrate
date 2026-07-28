'use client'

import { useImageColor } from '@shared/hooks/useImageColor'
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
  const [r, g, b] = useImageColor(imageUrl)
  const brighten = (value: number, amount: number, cap = 255) =>
    Math.min(Math.round(value * amount), cap)
  const dim = (value: number, amount: number) => Math.round(value * amount)

  const topColor = `rgb(${brighten(r, 2.1)}, ${brighten(g, 2.1)}, ${brighten(b, 2.1)})`
  const midColor = `rgb(${brighten(r, 1.25, 210)}, ${brighten(g, 1.25, 210)}, ${brighten(b, 1.25, 210)})`
  const deepColor = `rgb(${dim(r, 0.45)}, ${dim(g, 0.45)}, ${dim(b, 0.45)})`

  return (
    <div
      className="relative text-white h-85 p-6 max-[1024px]:h-auto max-[1024px]:px-4 max-[1024px]:py-5"
      style={{
        background: `linear-gradient(180deg, ${topColor} 0%, ${midColor} 42%, ${deepColor} 100%)`,
      }}
    >
      <BackButton className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-colors absolute top-6 left-6 max-[1024px]:static">
        <ArrowLeft className="text-white" size={20} />
      </BackButton>

      <div className="h-full flex flex-row items-end gap-6 mt-0 max-[1024px]:mt-4 max-[1024px]:flex-col max-[1024px]:items-start max-[1024px]:gap-4">
        <Image
          alt={title}
          className="shadow-2xl rounded object-cover w-58 h-58 max-[1024px]:w-52 max-[1024px]:h-52"
          height={232}
          src={imageUrl}
          unoptimized
          width={232}
        />
        <div className="flex flex-col gap-2 pb-4 max-[1024px]:pb-0">
          <span className="text-sm tracking-wide font-bold uppercase text-white/80 max-[1024px]:text-xs max-[1024px]:font-semibold">
            {type}
          </span>
          <h1 className="text-6xl leading-tight font-bold max-[1024px]:text-4xl">
            {title}
          </h1>
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
