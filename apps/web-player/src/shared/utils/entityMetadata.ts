import type { Metadata } from 'next'

type EntityMetadataInput = {
  description: string
  image?: string
  path: string
  title: string
}

export const buildEntityMetadata = ({
  description,
  image,
  path,
  title,
}: EntityMetadataInput): Metadata => ({
  title,
  description,
  alternates: {
    canonical: path,
  },
  openGraph: {
    type: 'website',
    title,
    description,
    url: path,
    images: image ? [{ url: image, alt: title }] : undefined,
  },
  twitter: {
    card: image ? 'summary_large_image' : 'summary',
    title,
    description,
    images: image ? [image] : undefined,
  },
})
