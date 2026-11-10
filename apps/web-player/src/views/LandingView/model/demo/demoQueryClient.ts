import {
  type DefaultError,
  type DefaultedQueryObserverOptions,
  type MutationKey,
  type MutationOptions,
  QueryClient,
  type QueryKey,
  type QueryObserverOptions,
} from '@tanstack/react-query'

/** A cache entry the demo starts with: the exact key a hook reads and the data it would get. */
export type DemoSeed = readonly [key: QueryKey, data: unknown]

/**
 * A local effect for one API mutation, keyed `METHOD path` as openapi-react-query keys it
 * (`post /api/v1/tracks/{id}/like`): it edits the demo cache the way the server's answer would.
 */
export type DemoMutationEffect = (input: {
  client: QueryClient
  variables: unknown
}) => void

/** Thrown instead of a request: a demo block never reaches the network. */
class DemoOfflineError extends Error {
  constructor(what: string) {
    super(`Landing demo: ${what} stays local`)
    this.name = 'DemoOfflineError'
  }
}

/** Answers a query whose key depends on what the visitor did (a list after a removal). */
export type DemoResolver = (key: QueryKey) => unknown

type DemoQueryClientInput = {
  seeds: readonly DemoSeed[]
  effects: Readonly<Record<string, DemoMutationEffect>>
  resolve: DemoResolver
}

const effectKey = (key: MutationKey | undefined) =>
  key ? key.filter((part) => typeof part === 'string').join(' ') : ''

/**
 * A QueryClient that cannot fetch. Every query answers from the seeded cache or the resolver
 * (whatever its hook's own `queryFn` is) and never goes stale; every mutation applies its local effect, if
 * any, and then rejects quietly, so its hook's success toast and invalidation never run.
 */
class DemoQueryClient extends QueryClient {
  readonly #effects: DemoQueryClientInput['effects']
  readonly #resolve: DemoResolver

  constructor({ effects, resolve }: Omit<DemoQueryClientInput, 'seeds'>) {
    super()
    this.#effects = effects
    this.#resolve = resolve
  }

  override defaultQueryOptions<
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = never,
  >(
    options:
      | QueryObserverOptions<
          TQueryFnData,
          TError,
          TData,
          TQueryData,
          TQueryKey,
          TPageParam
        >
      | DefaultedQueryObserverOptions<
          TQueryFnData,
          TError,
          TData,
          TQueryData,
          TQueryKey
        >,
  ): DefaultedQueryObserverOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey
  > {
    const defaulted = super.defaultQueryOptions(options)
    return {
      ...defaulted,
      gcTime: Number.POSITIVE_INFINITY,
      queryFn: ({ queryKey }) => {
        const data =
          this.getQueryData<TQueryFnData>(queryKey) ?? this.#resolve(queryKey)
        if (data === undefined) {
          if (process.env.NODE_ENV === 'development')
            console.warn('[landing demo] no seed for', queryKey)
          throw new DemoOfflineError(JSON.stringify(queryKey))
        }
        /** Seeds and resolvers are written for the hook reading this key. */
        return data as TQueryFnData
      },
      refetchInterval: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: Number.POSITIVE_INFINITY,
    }
  }

  override defaultMutationOptions<
    T extends MutationOptions<unknown, DefaultError, unknown, unknown>,
  >(options?: T): T {
    const defaulted = super.defaultMutationOptions(options)
    const key = effectKey(defaulted.mutationKey)
    return {
      ...defaulted,
      mutationFn: async (variables: unknown) => {
        this.#effects[key]?.({ client: this, variables })
        throw new DemoOfflineError(key || 'a mutation')
      },
      retry: false,
    }
  }
}

/** The landing demo's offline QueryClient, filled with its seeds. */
export const createDemoQueryClient = ({
  seeds,
  effects,
  resolve,
}: DemoQueryClientInput): QueryClient => {
  const client = new DemoQueryClient({ effects, resolve })
  for (const [key, data] of seeds) client.setQueryData(key, data)
  return client
}
