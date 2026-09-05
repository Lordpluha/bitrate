'use client'

import { Themes } from '@shared/constants'

export const ThemeScript = () => {
  const codeToRunOnClient = `
    try {
      const themes = ${JSON.stringify(Themes)};
      const stored = localStorage.getItem('theme');
      const theme = themes.includes(stored) ? stored : 'dark';
      document.documentElement.classList.remove(...themes);
      document.documentElement.classList.add(theme);
    } catch(e) {}
  `

  // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for theme initialization script
  return <script dangerouslySetInnerHTML={{ __html: codeToRunOnClient }} />
}
