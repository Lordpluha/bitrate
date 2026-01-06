'use client'

import { useRef } from 'react'
import { Provider } from 'react-redux'
import { createStore, AppStore } from '@shared/store'

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | undefined>()
  if (!storeRef.current) {
    storeRef.current = createStore()
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
