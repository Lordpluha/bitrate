'use client';

import { themes } from '@shared/constants';
import { useTheme } from '@shared/contexts';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { THEME_ICONS } from '../config/theme-icons';

export const ThemeSwitcher = () => {
  const themeContext = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2 p-2 rounded-full bg-bg shadow-inner shadow-text">
      {themes.map((th) => (
        <button
          className={clsx(
            'w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300',
            themeContext?.theme === th ? 'bg-green-500' : 'bg-bg',
          )}
          key={th}
          onClick={() => themeContext?.setTheme(th)}
          type="button"
        >
          {THEME_ICONS[th]}
        </button>
      ))}
    </div>
  );
};
