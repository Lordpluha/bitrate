import { notFound } from 'next/navigation'

/** Any path under /main that no page claims renders main/not-found.tsx inside the shell. */
export default function UnknownMainRoute() {
  notFound()
}
