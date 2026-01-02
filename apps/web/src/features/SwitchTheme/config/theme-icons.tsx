import type { theme } from '@shared/constants';
import { Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';

export const THEME_ICONS: Record<theme, ReactNode> = {
  light: <Sun size={16} />,
  dark: <Moon size={16} />,
};
