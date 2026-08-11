'use client'

import { useEffect } from 'react'

export const ServiceWorkerRegistration = () => {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' ||
      !('serviceWorker' in navigator)
    ) {
      return
    }

    const register = () => {
      void navigator.serviceWorker.register('/sw.js')
    }

    if (document.readyState === 'complete') {
      register()
      return
    }

    window.addEventListener('load', register, { once: true })

    return () => window.removeEventListener('load', register)
  }, [])

  return null
}
