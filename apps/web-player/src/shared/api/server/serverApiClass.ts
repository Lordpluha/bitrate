import 'server-only'

import type { ApiPaths } from '@spotify/contracts'
import createClient from 'openapi-fetch'

export const serverFetchClient = createClient<ApiPaths>({
  baseUrl: process.env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
})

export class ServerApi {
  get = serverFetchClient.GET
  post = serverFetchClient.POST
  put = serverFetchClient.PUT
  delete = serverFetchClient.DELETE
  patch = serverFetchClient.PATCH
  head = serverFetchClient.HEAD
  options = serverFetchClient.OPTIONS
  trace = serverFetchClient.TRACE
}
