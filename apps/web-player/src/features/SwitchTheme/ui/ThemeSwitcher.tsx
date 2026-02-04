'use client'

import { Themes } from '@shared/constants'
import { useTheme } from '@shared/contexts'
import { cn } from '@spotify/ui-react'
import { useEffect, useState } from 'react'
import { THEME_ICONS } from '../config/theme-icons'

export const ThemeSwitcher = () => {
  const themeContext = useTheme()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="flex items-center gap-2 p-2 rounded-full bg-background shadow-inner shadow-text">
      {Themes.map((th) => (
        <button
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300',
            themeContext?.theme === th ? 'bg-green-500' : 'bg-background',
          )}
          key={th}
          onClick={() => themeContext?.setTheme(th)}
          type="button"
        >
          {THEME_ICONS[th]}
        </button>
      ))}
    </div>
  )
}
