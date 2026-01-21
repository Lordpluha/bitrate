import type { ApiPaths } from '@spotify/contracts'
import createFetchClient from 'openapi-fetch'

/**
 * Fetch client for the API.
 */
export const fetchClient = createFetchClient<ApiPaths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
})

// Helper function to refresh token
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    return response.ok
  } catch (error) {
    console.error('Token refresh failed:', error)
    return false
  }
}