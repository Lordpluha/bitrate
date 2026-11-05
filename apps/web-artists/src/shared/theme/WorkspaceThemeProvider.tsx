import { useLocation } from '@tanstack/react-router'
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useLayoutEffect,
  useState,
} from 'react'
import {
  defaultWorkspaceTheme,
  parseStored,
  parseWorkspaceTheme,
  readStored,
  readWorkspaceTheme,
  type WorkspaceDensity,
  type WorkspaceMotion,
  type WorkspaceTheme,
  workspaceDensities,
  workspaceDensityStorageKey,
  workspaceMotionStorageKey,
  workspaceMotions,
  workspaceThemePath,
  workspaceThemeStorageKey,
  workspaceThemes,
} from './workspaceTheme'

interface WorkspaceThemeContextValue {
  theme: WorkspaceTheme
  setTheme: (theme: WorkspaceTheme) => void
  density: WorkspaceDensity
  setDensity: (density: WorkspaceDensity) => void
  motion: WorkspaceMotion
  setMotion: (motion: WorkspaceMotion) => void
}

const WorkspaceThemeContext = createContext<WorkspaceThemeContextValue | null>(
  null,
)

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // The control still works for this session when browser storage is disabled or full.
  }
}

export function WorkspaceThemeProvider({ children }: PropsWithChildren) {
  // Keep the first client render identical to SSR. Layout effects restore the preference before paint.
  const [theme, setThemeState] = useState(defaultWorkspaceTheme)
  const [density, setDensityState] = useState<WorkspaceDensity>(
    workspaceDensities[0],
  )
  const [motion, setMotionState] = useState<WorkspaceMotion>(
    workspaceMotions[0],
  )
  const isWorkspace = useLocation({
    select: ({ pathname }) =>
      pathname === workspaceThemePath ||
      pathname.startsWith(`${workspaceThemePath}/`),
  })

  useLayoutEffect(() => {
    setThemeState(readWorkspaceTheme())
    setDensityState(readStored(workspaceDensities, workspaceDensityStorageKey))
    setMotionState(readStored(workspaceMotions, workspaceMotionStorageKey))
    const sync = (event: StorageEvent) => {
      const all = event.key === null
      if (all || event.key === workspaceThemeStorageKey)
        setThemeState(parseWorkspaceTheme(event.newValue))
      if (all || event.key === workspaceDensityStorageKey)
        setDensityState(parseStored(workspaceDensities, event.newValue))
      if (all || event.key === workspaceMotionStorageKey)
        setMotionState(parseStored(workspaceMotions, event.newValue))
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.remove(...workspaceThemes)
    root.classList.add(isWorkspace ? theme : 'dark')
    // Marketing and auth pages keep their own layout and motion.
    if (isWorkspace && density === 'compact') root.dataset.density = density
    else delete root.dataset.density
    if (isWorkspace && motion === 'reduced') root.dataset.motion = motion
    else delete root.dataset.motion
  }, [isWorkspace, theme, density, motion])

  const value: WorkspaceThemeContextValue = {
    theme,
    setTheme: (next) => {
      setThemeState(next)
      store(workspaceThemeStorageKey, next)
    },
    density,
    setDensity: (next) => {
      setDensityState(next)
      store(workspaceDensityStorageKey, next)
    },
    motion,
    setMotion: (next) => {
      setMotionState(next)
      store(workspaceMotionStorageKey, next)
    },
  }

  return (
    <WorkspaceThemeContext.Provider value={value}>
      {children}
    </WorkspaceThemeContext.Provider>
  )
}

export function useWorkspaceTheme() {
  const context = useContext(WorkspaceThemeContext)
  if (!context) throw new Error('WorkspaceThemeProvider is required')
  return context
}
