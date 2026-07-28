'use client'

import { clientFetchClient } from '@shared/api/client'
import { ROUTES } from '@shared/routes'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const useAuthenticatedRedirect = () => {
  const router = useRouter()

  useEffect(() => {
    let isActive = true

    const redirectAuthenticatedUser = async () => {
      try {
        const { data, response } =
          await clientFetchClient.GET('/api/v1/auth/me')

        if (isActive && response.ok && data) {
          router.replace(ROUTES.main)
        }
      } catch {
        // Staying on the auth page is the expected fallback for a missing session.
      }
    }

    void redirectAuthenticatedUser()

    return () => {
      isActive = false
    }
  }, [router])
}
