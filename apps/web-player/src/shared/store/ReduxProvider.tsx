'use client'

import type { AppStore } from '@shared/store'
import { createStore } from '@shared/store'
import type { PropsWithChildren } from 'react'
import { useRef } from 'react'
import { Provider } from 'react-redux'

export function ReduxProvider({ children }: PropsWithChildren) {
  const storeRef = useRef<AppStore | undefined>(undefined)
  if (!storeRef.current) {
    storeRef.current = createStore()
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
