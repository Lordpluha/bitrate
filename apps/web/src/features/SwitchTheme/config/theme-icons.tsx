import { theme } from '@shared/constants'
import { Sun, Moon } from 'lucide-react'
import { ReactNode } from 'react'

export const THEME_ICONS: Record<theme, ReactNode> = {
  light: <Sun size={16} />,
  dark: <Moon size={16} />
}
