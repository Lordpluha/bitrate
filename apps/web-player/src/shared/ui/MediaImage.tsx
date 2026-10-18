'use client'

import Image, { type ImageProps } from 'next/image'
import { type SyntheticEvent, useState } from 'react'
import {
  getMediaFallbackUrl,
  type MediaFallbackKind,
} from '@/shared/utils/mediaUrl'

type MediaImageProps = Omit<ImageProps, 'src'> & {
  /** Which placeholder replaces the image when it is missing or fails to load. */
  fallback: MediaFallbackKind
  src: string | null | undefined
}

/**
 * `next/image` for covers, avatars and artwork: an empty source or one that fails to load
 * shows the placeholder of its kind instead of a broken image. A new source is tried again.
 */
export const MediaImage = ({
  fallback,
  onError,
  src,
  ...props
}: MediaImageProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const source = src?.trim()
  const resolved =
    !source || source === failedSrc ? getMediaFallbackUrl(fallback) : source

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    if (source) setFailedSrc(source)
    onError?.(event)
  }

  return <Image {...props} onError={handleError} src={resolved} />
}
