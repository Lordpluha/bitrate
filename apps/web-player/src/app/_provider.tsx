'use client'

import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { ThemeProvider } from '@shared/contexts'
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

const getErrorStatus = (error: unknown) => {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return undefined
  }

  const { status } = error as { status?: unknown }

  return typeof status === 'number' ? status : undefined
}

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          const status = getErrorStatus(error)

          if (status === 401 || status === 403 || status === 429) {
            return false
          }

          return failureCount < 2
        },
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

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Toaster />
        {children}
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
