import {
  ChartLine,
  Disc3,
  ListChecks,
  type LucideIcon,
  Send,
} from 'lucide-react'

export interface LandingFeature {
  icon: LucideIcon
  title: string
  description: string
}

/**
 * What the workspace does today, in the order of a release. Each line describes a shipped
 * screen; the distribution line says plainly that store delivery is not connected yet.
 */
export const LANDING_FEATURES: readonly LandingFeature[] = [
  {
    icon: Disc3,
    title: 'Release workspace',
    description:
      'Draft a release, credit everyone who worked on it, confirm rights and splits, and submit it for review.',
  },
  {
    icon: ListChecks,
    title: 'Release tasks',
    description:
      'Keep the work each release needs in one list, with due dates and status.',
  },
  {
    icon: Send,
    title: 'Distribution plan',
    description:
      'Choose the stores a release is planned for. Delivery to external stores is not connected yet.',
  },
  {
    icon: ChartLine,
    title: 'Analytics',
    description:
      'Plays and listeners on Bitrate over 7, 28 or 90 days, track by track.',
  },
]
