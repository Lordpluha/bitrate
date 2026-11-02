import type { TranslationKey } from '@shared/i18n'
import { ChartLine, Disc3, type LucideIcon, Send } from 'lucide-react'

export interface LandingFeature {
  icon: LucideIcon
  title: TranslationKey
  description: TranslationKey
}

/**
 * What the workspace does today, in the order of a release. Each line describes a shipped
 * screen; the distribution line says plainly that store delivery is not connected yet.
 */
export const LANDING_FEATURES: readonly LandingFeature[] = [
  {
    icon: Disc3,
    title: 'landing.feature.workspace',
    description: 'landing.feature.workspaceDescription',
  },
  {
    icon: Send,
    title: 'landing.feature.distribution',
    description: 'landing.feature.distributionDescription',
  },
  {
    icon: ChartLine,
    title: 'landing.feature.analytics',
    description: 'landing.feature.analyticsDescription',
  },
]
