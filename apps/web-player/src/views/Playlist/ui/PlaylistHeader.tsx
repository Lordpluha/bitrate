'use client'

import React from 'react'
import { ArrowLeft, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PlaylistHeaderProps {
  title: string
  type: string
  imageUrl: string
  author: string
  songsCount: number
  tracksCount: number
  duration: string
}

export const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({
  title,
  type,
  imageUrl,
  author,
  tracksCount,
  duration,
}) => {
  const router = useRouter()
  return (
    <div className="relative h-[340px] bg-gradient-to-b from-purple-800 to-gray-900 p-6">
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-colors"
      >
        <ArrowLeft size={20} className="text-white" />
      </button>

      <div className="flex items-end gap-6 h-full">
        <img
          src={imageUrl}
          alt={title}
          className="w-[232px] h-[232px] shadow-2xl rounded"
        />
        <div className="flex flex-col gap-2 pb-4">
          <span className="text-sm font-bold uppercase">{type}</span>
          <h1 className="text-6xl font-bold">{title}</h1>
          <div className="flex items-center gap-2 text-sm mt-2">
            <span className="font-semibold">{author}</span>
            <span>•</span>
            <span>{tracksCount} songs</span>
            <span>•</span>
            <span>{duration}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
