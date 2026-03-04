'use client'

import type { RootState } from '@shared/store'
import { useSelector } from 'react-redux'

export const useAppSelector = useSelector.withTypes<RootState>()
