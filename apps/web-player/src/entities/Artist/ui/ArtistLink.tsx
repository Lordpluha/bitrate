'use client'

import { useArtist } from '@entities/Artist/api/client'
import { ROUTES } from '@shared/routes'
import { cn } from '@spotify/ui-react'
import Link from 'next/link'

export type ArtistLinkProps = {
  artistId?: string | null
  className?: string
  fallback?: string
}

/** Renders an artist's display name as a link to their page, resolving the name by id. */
export const ArtistLink = ({
  artistId,
  className,
  fallback = 'Unknown Artist',
}: ArtistLinkProps) => {
  const { data: artist } = useArtist(artistId ?? undefined)
  const name = artist?.username ?? fallback

  if (!artistId) {
    return <span className={className}>{name}</span>
  }

  return (
    <Link
      className={cn('truncate hover:underline', className)}
      href={ROUTES.artist(artistId)}
      onClick={(event) => event.stopPropagation()}
    >
      {name}
    </Link>
  )
}
