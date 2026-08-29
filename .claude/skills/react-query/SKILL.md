---
name: react-query
description: Data-layer conventions for web-player and web-artists — the openapi-fetch client, the openapi-react-query wrapper, wrapping generated hooks in project hooks, query keys, invalidation after mutations, and server-vs-client fetching. Use when adding or changing any API call, query hook, mutation, or cache invalidation in a Next.js app.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# React Query + openapi-fetch — the data layer

Server state lives in TanStack Query, typed end-to-end from the API's OpenAPI document.
Nothing in this stack is hand-typed and nothing calls `fetch()` directly.

## The three files that matter

```
apps/web-player/src/shared/api/
  client/fetchClient.ts       # openapi-fetch client + JWT refresh middleware
  client/reactQueryClient.ts  # openapi-react-query wrapper → useQuery/useMutation
  queryKeys.ts                # shared key factory
  errors.ts                   # error normalisation at the boundary
  server/                     # the server-side counterpart for Server Components
```

Types come from `@spotify/contracts`, generated from the API's Swagger document
(`pnpm --filter @spotify/contracts gen:api`, with the API running on :3000). **If a path or
response type does not exist in the generated types, regenerate before working around it** —
a hand-written type here is a lie that compiles.

## Never call the library hook directly

Generated hooks are wrapped in a project hook that lives in the owning slice's `api/`
segment. Call sites import the project hook.

```ts
/** ✗ Don't — the library hook in a component */
const { data } = $api.useQuery('get', '/tracks')

/** ✓ Do — entities/Track/api/useTrackList.ts */
type UseTrackListInput = { page?: number; limit?: number }

export function useTrackList({ page = 1, limit = 20 }: UseTrackListInput = {}) {
  return useQuery('get', '/tracks', { params: { query: { page, limit } } })
}
```

This is what makes a parameter change, a default, or a `select` transform a one-file edit
instead of a grep across the app. It is also the FSD public-API rule applied to data: the
slice owns its access to its own endpoints.

## Query keys

`openapi-react-query` derives keys from the method and path, so most invalidation works
without a manual key. When you need one explicitly — invalidating a family, or a key not
tied to one endpoint — use the factory in `shared/api/queryKeys.ts` rather than an inline
array literal. Two inline literals that differ by a whitespace are two different caches.

## Mutations and invalidation

```ts
const { mutateAsync } = useMutation('post', '/playlists')

await mutateAsync({ body: { name } })
await queryClient.invalidateQueries({ queryKey: ['get', '/playlists'] })
```

**Invalidate the queries whose data the mutation changed** — the list the item was added to,
the detail it belongs to. Not invalidating is the usual cause of "I created it but it does
not appear"; invalidating everything is the usual cause of a screen that refetches ten
queries after one edit.

Optimistic updates (`onMutate` + rollback in `onError`) are worth it for a fast, frequent,
low-risk action — a like, a reorder. They are not worth it for anything where showing a
wrong state briefly would mislead the user.

## Server vs client

Default to a **Server Component** and fetch there through `shared/api/server/`. Pass the
result down as props to a small `'use client'` component that owns the interaction. React
Query belongs in Client Components.

**Never fetch in `useEffect`.** It re-runs, races, and has no cache, no dedupe, no retry, no
loading state. If it looks like `useEffect` is the only option, the component is probably in
the wrong layer.

## Errors

Request errors are normalised at the shared API boundary (`shared/api/errors.ts`) before they
reach a feature. A raw fetch/Response object must never surface to a feature or entity
consumer, and a user-facing error message never exposes transport detail. Map server field
errors onto form fields with `setError(field, { type: 'server' })` — see
`.claude/rules/forms.md`.

## Gotchas

- **`enabled` for dependent queries.** A query needing an id from another query must not run
  with `undefined`: `enabled: !!trackId`.
- **`staleTime` is the knob that stops refetch storms.** Default `0` means every mount
  refetches. Data that changes rarely (a catalogue, a profile) should say so.
- **`select` transforms without extra renders** — shape the data in the hook, not in the
  component body.
- **Suspense** (`useSuspenseQuery`) pairs with a `loading.tsx` / `<Suspense>` boundary at the
  right ownership level; do not scatter per-component spinners when one boundary reads
  better.
- **The JWT refresh middleware lives in `fetchClient.ts`.** Do not add a second refresh path
  in a hook; a concurrent-refresh bug is very hard to reproduce.

## When this skill does not cover it

Do not guess an API from memory. In order:

1. **Read the installed version.** `node_modules/@tanstack/react-query` is what this repo actually runs; the
   docs site describes the latest release, which may not be it.
   ```bash
   node -p "require('@tanstack/react-query/package.json').version"
   ```
2. **Then the official docs:** https://tanstack.com/query/latest — match them to the version you just read.
3. **If both are silent, say so in your report** rather than inventing an API. Here that
   matters because v4 and v5 differ on object-vs-positional signatures and on `isLoading`/`isPending`.

## Related

- `.claude/rules/web-player-rules.md` — the API client and state split.
- `.claude/rules/react.md` — the hooks-wrapping convention, useEffect budget.
- `zustand` skill — the client-state half; server state never goes there.
- `zod` skill — runtime validation of responses.
