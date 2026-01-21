 'use client'

import React, { useRef, PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import { createStore, AppStore } from '@shared/store'

export default function ReduxProvider({ children }: PropsWithChildren<{}>) {
  const storeRef = useRef<AppStore | undefined>(undefined)
  if (!storeRef.current) {
    storeRef.current = createStore()
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
