import type { Theme } from '@shared/constants';
import { Moon, Sun } from '@spotify/ui';
import type { ReactNode } from 'react';

export const THEME_ICONS: Record<Theme, ReactNode> = {
  light: <Sun size={16} />,
  dark: <Moon size={16} />,
};
