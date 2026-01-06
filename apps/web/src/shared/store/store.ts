'use client'

import { createSlice, configureStore, combineSlices, combineReducers } from '@reduxjs/toolkit'
import { musicPlayerSlice } from '@entities/Player'

export const createStore = () => configureStore({
  reducer: {
    musicPlayer: musicPlayerSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
})

export type AppStore = ReturnType<typeof createStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
