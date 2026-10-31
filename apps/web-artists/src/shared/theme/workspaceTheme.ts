import { ROUTES } from '@shared/routes/routes'

export const workspaceThemes = ['light', 'dark', 'dim'] as const
export type WorkspaceTheme = (typeof workspaceThemes)[number]
export const defaultWorkspaceTheme: WorkspaceTheme = 'dim'
export const workspaceThemeStorageKey = 'bitrate.artist-theme.v1'
export const workspaceThemePath = ROUTES.dashboard.home

/** Compact tightens workspace panels; it never changes text size. */
export const workspaceDensities = ['comfortable', 'compact'] as const
export type WorkspaceDensity = (typeof workspaceDensities)[number]
export const workspaceDensityStorageKey = 'bitrate.artist-density.v1'

/** `system` follows the OS setting, which the CSS already honours; `reduced` forces it. */
export const workspaceMotions = ['system', 'reduced'] as const
export type WorkspaceMotion = (typeof workspaceMotions)[number]
export const workspaceMotionStorageKey = 'bitrate.artist-motion.v1'

/** Quiet interface sounds on hover and press; on by default, off silences them. */
export const workspaceSounds = ['on', 'off'] as const
export type WorkspaceSound = (typeof workspaceSounds)[number]
export const workspaceSoundStorageKey = 'bitrate.artist-sound.v1'

export function parseStored<T extends string>(
  options: readonly T[],
  value: string | null,
): T {
  return options.find((option) => option === value) ?? options[0]
}

export function readStored<T extends string>(
  options: readonly T[],
  key: string,
): T {
  try {
    return parseStored(options, localStorage.getItem(key))
  } catch {
    return options[0]
  }
}

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
  const inWorkspace = path === workspacePath || path.startsWith(workspacePath + '/');
  const root = document.documentElement;
  let theme = 'dark';
  delete root.dataset.density;
  delete root.dataset.motion;
  if (inWorkspace) {
    theme = ${JSON.stringify(defaultWorkspaceTheme)};
    try {
      const stored = localStorage.getItem(${JSON.stringify(workspaceThemeStorageKey)});
      if (themes.includes(stored)) theme = stored;
      if (localStorage.getItem(${JSON.stringify(workspaceDensityStorageKey)}) === 'compact') root.dataset.density = 'compact';
      if (localStorage.getItem(${JSON.stringify(workspaceMotionStorageKey)}) === 'reduced') root.dataset.motion = 'reduced';
    } catch {}
  }
  root.classList.remove(...themes);
  root.classList.add(theme);
})();`
