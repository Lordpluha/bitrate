'use client'

import { useSettingsPersistence, useSettingsStore } from '@entities/Settings'
import { shouldRetryApiQuery } from '@shared/api/errors'
import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { ThemeProvider } from '@shared/contexts'
import { I18nProvider } from '@shared/i18n'
import { ServiceWorkerRegistration } from '@shared/ui/ServiceWorkerRegistration'
import { Toaster } from '@spotify/ui-react'
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { PropsWithChildren } from 'react'
import { useState } from 'react'

interface ApiFeedbackMeta {
  errorMessage?: string
  successMessage?: string
  suppressErrorToast?: boolean
  suppressSuccessToast?: boolean
}

const getFeedbackMeta = (meta: unknown): ApiFeedbackMeta => {
  if (typeof meta !== 'object' || meta === null) return {}

  return meta as ApiFeedbackMeta
}

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetryApiQuery,
        refetchOnWindowFocus: false,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        const meta = getFeedbackMeta(query.meta)
        if (!meta.suppressErrorToast) {
          showApiErrorToast(error, meta.errorMessage)
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const meta = getFeedbackMeta(mutation.meta)
        if (!meta.suppressErrorToast) {
          showApiErrorToast(error, meta.errorMessage)
        }
      },
      onSuccess: (_data, _variables, _context, mutation) => {
        const meta = getFeedbackMeta(mutation.meta)
        if (meta.successMessage && !meta.suppressSuccessToast) {
          showApiSuccessToast(meta.successMessage)
        }
      },
    }),
  })

export const Provider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(createQueryClient)
  const locale = useSettingsStore((state) => state.language)
  useSettingsPersistence()

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider locale={locale}>
        <ThemeProvider>
          <Toaster />
          <ServiceWorkerRegistration />
          {children}
        </ThemeProvider>
      </I18nProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
