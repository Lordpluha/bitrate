'use client'

import { useI18n } from '@shared/i18n'
import { useMemo } from 'react'
import { type LandingCopy, pickLandingCopy } from './copy'

/** The landing copy for the current app locale. */
export const useLandingCopy = (): LandingCopy => {
  const { locale } = useI18n()
  return useMemo(() => pickLandingCopy(locale), [locale])
}
