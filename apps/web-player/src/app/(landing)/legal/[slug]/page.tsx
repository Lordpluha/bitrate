import { findLegalDocument, LEGAL_SLUGS } from '@shared/legal'
import { LegalDocumentView } from '@views/Legal'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type LegalPageProps = {
  params: Promise<{ slug: string }>
}

export const generateStaticParams = () => LEGAL_SLUGS.map((slug) => ({ slug }))

/** Draft documents are marked as such and kept out of search until they are reviewed. */
export const generateMetadata = async ({
  params,
}: LegalPageProps): Promise<Metadata> => {
  const { slug } = await params
  const document = findLegalDocument({ slug })
  if (!document) return { title: 'Legal' }
  if (!document.draft) return { title: document.title }

  return {
    robots: { follow: false, index: false },
    title: `${document.title} (draft)`,
  }
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params
  const document = findLegalDocument({ slug })
  if (!document) notFound()

  return <LegalDocumentView document={document} />
}
