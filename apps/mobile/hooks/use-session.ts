import { useQuery } from '@tanstack/react-query'

import { meQuery, type SelfUser } from '@/lib/auth/me-query'

export type Session =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'signed-out' }
  | { status: 'signed-in'; user: SelfUser }

/** Who is listening: drives the auth guard and every "signed-in only" surface. */
export function useSession(): Session {
  const me = useQuery(meQuery)

  if (me.isPending) return { status: 'loading' }
  if (me.isError) return { status: 'error', retry: () => void me.refetch() }
  if (me.data === null) return { status: 'signed-out' }
  return { status: 'signed-in', user: me.data }
}
