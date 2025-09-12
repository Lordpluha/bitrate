import { ReactNode } from 'react'

import { theme } from '@shared/constants'
import { Moon, Sun } from 'lucide-react'

export const THEME_ICONS: Record<theme, ReactNode> = {
  light: <Sun size={16} />,
  dark: <Moon size={16} />
}
