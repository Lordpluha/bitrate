import { findLegalDocument } from '@shared/legal'
import { LegalDocumentView } from '@views/Legal'
import { createRoute, notFound } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'

/** Terms, privacy and the other legal pages registration and settings link to. */
export const legalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/legal/$slug',
  loader: ({ params }) => {
    const document = findLegalDocument({ slug: params.slug })
    if (!document) throw notFound()
    return document
  },
  component: function LegalRoute() {
    const document = legalRoute.useLoaderData()
    return <LegalDocumentView document={document} />
  },
})
