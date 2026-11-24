import { shouldRetryApiQuery } from '@shared/api/errors'
import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'

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

/**
 * The app-wide query client: API failures and declared successes surface as toasts unless a
 * query or mutation opts out through its `meta`. Shared by web-player and the desktop app.
 */
export const createQueryClient = () =>
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
