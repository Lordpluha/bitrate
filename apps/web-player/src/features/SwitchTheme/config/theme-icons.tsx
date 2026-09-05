import { Contrast, Moon, Sun } from '@bitrate/ui-react'
import type { Theme } from '@shared/constants'
import type { ReactNode } from 'react'

export const THEME_ICONS: Record<Theme, ReactNode> = {
  light: <Sun size={16} />,
  dark: <Moon size={16} />,
  dim: <Contrast size={16} />,
}
