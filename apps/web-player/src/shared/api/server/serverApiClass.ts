import 'server-only'

import type { ApiPaths } from '@bitrate/contracts'
import { cookies } from 'next/headers'
import createClient from 'openapi-fetch'

export const serverFetchClient = createClient<ApiPaths>({
  baseUrl: process.env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
})

serverFetchClient.use({
  async onRequest({ request }) {
    const cookieHeader = (await cookies()).toString()

    if (cookieHeader) {
      request.headers.set('Cookie', cookieHeader)
    }

    return request
  },
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
