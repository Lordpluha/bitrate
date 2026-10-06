import { findLegalDocument, LEGAL_SLUGS } from '@shared/legal'
import { LegalDocumentView } from '@views/Legal'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type LegalPageProps = {
  params: Promise<{ slug: string }>
}

export const generateStaticParams = () => LEGAL_SLUGS.map((slug) => ({ slug }))

/** The documents are drafts, so crawlers are told to skip them until they are reviewed. */
export const generateMetadata = async ({
  params,
}: LegalPageProps): Promise<Metadata> => {
  const { slug } = await params
  const document = findLegalDocument({ slug })

  return {
    robots: { follow: false, index: false },
    title: document ? `${document.title} (draft)` : 'Legal',
  }
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params
  const document = findLegalDocument({ slug })
  if (!document) notFound()

  return <LegalDocumentView document={document} />
}
