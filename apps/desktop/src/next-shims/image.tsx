import type { CSSProperties, ImgHTMLAttributes, Ref } from 'react'

/** A bundler-imported image as Next describes it. */
type StaticImageData = { src: string; width?: number; height?: number }

/** The `next/image` props the reused web-player code passes. */
export type ImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'alt' | 'width' | 'height' | 'loading'
> & {
  src: string | StaticImageData
  alt: string
  width?: number | `${number}`
  height?: number | `${number}`
  /** Fills the positioned parent, as Next's `fill` does. */
  fill?: boolean
  /** Loads eagerly with high fetch priority. */
  priority?: boolean
  loading?: 'eager' | 'lazy'
  /** Accepted for compatibility: desktop loads images as-is, with no optimizer. */
  quality?: number | `${number}`
  unoptimized?: boolean
  placeholder?: 'blur' | 'empty' | `data:image/${string}`
  blurDataURL?: string
  ref?: Ref<HTMLImageElement>
}

const fillStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
}

/** `next/image` for the desktop renderer: a plain `<img>` with Next's layout props applied. */
export default function Image({
  src,
  alt,
  fill,
  priority,
  loading,
  quality: _quality,
  unoptimized: _unoptimized,
  placeholder: _placeholder,
  blurDataURL: _blurDataURL,
  style,
  ...imageProps
}: ImageProps) {
  return (
    <img
      {...imageProps}
      alt={alt}
      decoding="async"
      fetchPriority={priority ? 'high' : imageProps.fetchPriority}
      loading={priority ? 'eager' : (loading ?? 'lazy')}
      src={typeof src === 'string' ? src : src.src}
      style={fill ? { ...fillStyle, ...style } : style}
    />
  )
}
