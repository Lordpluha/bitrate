import Feather from '@expo/vector-icons/Feather'
import type { ComponentProps } from 'react'

import type { ColorName } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

export type IconName = ComponentProps<typeof Feather>['name']

type IconProps = {
  name: IconName
  size?: number
  tone?: ColorName
}

/**
 * Feather glyphs — Lucide, the web player's icon set, is a Feather fork, so the shapes match
 * without bundling an SVG renderer. Decorative by default; label the control that holds it.
 */
export function Icon({ name, size = 20, tone = 'text' }: IconProps) {
  const { colors } = useTheme()
  return <Feather accessible={false} color={colors[tone]} name={name} size={size} />
}
