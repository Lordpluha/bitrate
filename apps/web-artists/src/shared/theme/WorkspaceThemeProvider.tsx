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
  parseWorkspaceTheme,
  readWorkspaceTheme,
  type WorkspaceTheme,
  workspaceThemePath,
  workspaceThemeStorageKey,
  workspaceThemes,
} from './workspaceTheme'

interface WorkspaceThemeContextValue {
  theme: WorkspaceTheme
  setTheme: (theme: WorkspaceTheme) => void
}

const WorkspaceThemeContext = createContext<WorkspaceThemeContextValue | null>(
  null,
)

export function WorkspaceThemeProvider({ children }: PropsWithChildren) {
  // Keep the first client render identical to SSR. Layout effects restore the preference before paint.
  const [theme, setThemeState] = useState(defaultWorkspaceTheme)
  const isWorkspace = useLocation({
    select: ({ pathname }) =>
      pathname === workspaceThemePath ||
      pathname.startsWith(`${workspaceThemePath}/`),
  })

  useLayoutEffect(() => {
    setThemeState(readWorkspaceTheme())
    const syncTheme = (event: StorageEvent) => {
      if (event.key === workspaceThemeStorageKey || event.key === null) {
        setThemeState(parseWorkspaceTheme(event.newValue))
      }
    }
    window.addEventListener('storage', syncTheme)
    return () => window.removeEventListener('storage', syncTheme)
  }, [])

  useLayoutEffect(() => {
    document.documentElement.classList.remove(...workspaceThemes)
    document.documentElement.classList.add(isWorkspace ? theme : 'dark')
  }, [isWorkspace, theme])

  const setTheme = (nextTheme: WorkspaceTheme) => {
    setThemeState(nextTheme)
    try {
      localStorage.setItem(workspaceThemeStorageKey, nextTheme)
    } catch {
      // The control still works for this session when browser storage is disabled or full.
    }
  }

  return (
    <WorkspaceThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </WorkspaceThemeContext.Provider>
  )
}

export function useWorkspaceTheme() {
  const context = useContext(WorkspaceThemeContext)
  if (!context) throw new Error('WorkspaceThemeProvider is required')
  return context
}
