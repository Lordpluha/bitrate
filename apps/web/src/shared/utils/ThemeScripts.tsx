'use client';

export const ThemeScript = () => {
  const codeToRunOnClient = `
    try {
      const themes = ['light', 'dark'];
      const stored = localStorage.getItem('theme');
      const theme = themes.includes(stored) ? stored : 'dark';
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(theme);
    } catch(e) {}
  `;

  return <script dangerouslySetInnerHTML={{ __html: codeToRunOnClient }} />;
};
