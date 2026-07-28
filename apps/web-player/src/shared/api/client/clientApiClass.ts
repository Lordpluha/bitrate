'use client'

import { clientFetchClient } from './fetchClient'

/**
 * Base class for entity/feature client-side API wrappers used inside Client
 * Components and hooks. Mirrors the shape of `ServerApi` in
 * `@shared/api/server` so client and server API classes stay symmetric.
 */
export class ClientApi {
  get = clientFetchClient.GET
  post = clientFetchClient.POST
  put = clientFetchClient.PUT
  delete = clientFetchClient.DELETE
  patch = clientFetchClient.PATCH
  head = clientFetchClient.HEAD
  options = clientFetchClient.OPTIONS
  trace = clientFetchClient.TRACE
}
