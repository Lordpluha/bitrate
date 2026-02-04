'use client'

import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@shared/store'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
