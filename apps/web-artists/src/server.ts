// Sentry first, before anything else is imported, so it is initialised before the app runs.
import './instrument.server'

import { wrapFetchWithSentry } from '@sentry/tanstackstart-react'
import handler, {
  createServerEntry,
  type ServerEntry,
} from '@tanstack/react-start/server-entry'

/**
 * Start's default server entry, wrapped so Sentry traces every request and captures errors the
 * handler throws. `opts` is passed through so the request context Start provides is kept.
 */
const requestHandler: ServerEntry = wrapFetchWithSentry({
  fetch(request, opts) {
    return handler.fetch(request, opts)
  },
})

export default createServerEntry(requestHandler)
