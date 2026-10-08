import { ROUTES } from '@shared/routes/routes'

export const workspaceThemes = ['light', 'dark', 'dim'] as const
export type WorkspaceTheme = (typeof workspaceThemes)[number]
export const defaultWorkspaceTheme: WorkspaceTheme = 'dim'
export const workspaceThemeStorageKey = 'bitrate.artist-theme.v1'
export const workspaceThemePath = ROUTES.dashboard.home

export function parseWorkspaceTheme(value: string | null): WorkspaceTheme {
  return (
    workspaceThemes.find((theme) => theme === value) ?? defaultWorkspaceTheme
  )
}

export function readWorkspaceTheme(): WorkspaceTheme {
  try {
    return parseWorkspaceTheme(localStorage.getItem(workspaceThemeStorageKey))
  } catch {
    return defaultWorkspaceTheme
  }
}

// Runs before the stylesheet and hydration; interpolate only application constants.
export const workspaceThemeScript = `(() => {
  const themes = ${JSON.stringify(workspaceThemes)};
  const workspacePath = ${JSON.stringify(workspaceThemePath)};
  const path = location.pathname;
  let theme = 'dark';
  if (path === workspacePath || path.startsWith(workspacePath + '/')) {
    theme = ${JSON.stringify(defaultWorkspaceTheme)};
    try {
      const stored = localStorage.getItem(${JSON.stringify(workspaceThemeStorageKey)});
      if (themes.includes(stored)) theme = stored;
    } catch {}
  }
  document.documentElement.classList.remove(...themes);
  document.documentElement.classList.add(theme);
})();`
