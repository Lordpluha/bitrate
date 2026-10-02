import { findLegalDocument } from '@shared/legal'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { LegalView } from '@views/LegalView'

export const Route = createFileRoute('/legal/$slug')({
  /** An unknown slug is a 404 rather than an empty page. */
  loader: ({ params }) => {
    const document = findLegalDocument({ slug: params.slug })
    if (!document) throw notFound()
    return document
  },
  /** The documents are drafts, so crawlers are told to skip them until they are reviewed. */
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? 'Legal'} (draft)` },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: LegalPage,
})

function LegalPage() {
  const document = Route.useLoaderData()
  return <LegalView document={document} />
}
