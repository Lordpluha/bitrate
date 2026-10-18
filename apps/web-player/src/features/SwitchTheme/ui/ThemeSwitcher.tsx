'use client'

import { cn } from '@bitrate/ui-react'
import { Themes } from '@shared/constants'
import { useTheme } from '@shared/contexts'
import { useEffect, useState } from 'react'
import { THEME_ICONS } from '../config/theme-icons'

export const ThemeSwitcher = () => {
  const themeContext = useTheme()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
      {Themes.map((th) => (
        <button
          aria-label={`${th} theme`}
          aria-pressed={themeContext?.theme === th}
          className={cn(
            'flex size-8 items-center justify-center rounded-full transition-colors duration-300',
            themeContext?.theme === th
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-surface hover:text-foreground',
          )}
          key={th}
          onClick={() => themeContext?.setTheme(th)}
          title={`${th} theme`}
          type="button"
        >
          {THEME_ICONS[th]}
        </button>
      ))}
    </div>
  )
}
