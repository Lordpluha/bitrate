'use client'

import type { PropsWithChildren } from 'react'
import { useState } from 'react'

import { ThemeProvider } from '@shared/contexts'
import { Toaster } from '@spotify/ui-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReduxProvider } from '@shared/store/ReduxProvider'

export const Provider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <ReduxProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Toaster />
          {children}
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ReduxProvider>
  )
}
