'use client'

import { musicPlayerReducer } from '@entities/Player'
import { configureStore } from '@reduxjs/toolkit'

export const createStore = () =>
  configureStore({
    reducer: {
      musicPlayer: musicPlayerReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })

export type AppStore = ReturnType<typeof createStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
