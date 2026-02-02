'use client'

import { AppStore, createStore } from '@shared/store'
import { PropsWithChildren, useRef } from 'react'
import { Provider } from 'react-redux'

export default function ReduxProvider({ children }: PropsWithChildren<{}>) {
  const storeRef = useRef<AppStore | undefined>(undefined)
  if (!storeRef.current) {
    storeRef.current = createStore()
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
