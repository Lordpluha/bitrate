'use client'

import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import { themes } from '@shared/constants'
import { useTheme } from '@shared/contexts'
import { THEME_ICONS } from '../config/theme-icons'

export const ThemeSwitcher = () => {
  const themeContext = useTheme()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className='flex items-center gap-2 p-2 rounded-full bg-bg shadow-inner shadow-text'>
      {themes.map(th => (
        <button
          key={th}
          onClick={() => themeContext?.setTheme(th)}
          className={clsx(
            'w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300',
            themeContext?.theme === th ? 'bg-green-500' : 'bg-bg'
          )}
        >
          {THEME_ICONS[th]}
        </button>
      ))}
    </div>
  )
}
