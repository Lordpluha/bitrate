'use client'

import { useEffect } from 'react'

type ServiceWorkerRegistrar = Pick<ServiceWorkerContainer, 'register'>

export const registerServiceWorker = async (
  serviceWorker: ServiceWorkerRegistrar,
  reportError: (message: string, error: unknown) => void = console.warn,
) => {
  try {
    return await serviceWorker.register('/sw.js')
  } catch (error) {
    reportError('Service worker registration failed.', error)
    return null
  }
}

export const ServiceWorkerRegistration = () => {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' ||
      !('serviceWorker' in navigator)
    ) {
      return
    }

    const register = () => {
      void registerServiceWorker(navigator.serviceWorker)
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
