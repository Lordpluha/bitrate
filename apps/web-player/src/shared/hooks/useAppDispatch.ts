'use client'

import type { AppDispatch } from '@shared/store'
import { useDispatch } from 'react-redux'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
