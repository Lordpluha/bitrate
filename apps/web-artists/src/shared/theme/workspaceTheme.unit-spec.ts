import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'
import { workspaceThemeScript } from './workspaceTheme'

function bootstrap(pathname: string, storedTheme: string | null) {
  const root = document.createElement('html')
  root.className = 'dark'
  runInNewContext(workspaceThemeScript, {
    location: { pathname },
    document: { documentElement: root },
    localStorage: {
      getItem: (key: string) =>
        key.includes('density')
          ? 'compact'
          : key.includes('motion')
            ? 'reduced'
            : storedTheme,
    },
  })
  return root
}

describe('artist theme bootstrap', () => {
  it.each([
    ['/', 'light', false],
    ['/dashboard/music', 'light', true],
    ['/login', 'dark', false],
  ] as const)(
    'restores appearance on %s without leaking workspace preferences',
    (path, theme, workspace) => {
      const root = bootstrap(path, 'light')
      expect(root.className).toBe(theme)
      expect(root.dataset.density).toBe(workspace ? 'compact' : undefined)
      expect(root.dataset.motion).toBe(workspace ? 'reduced' : undefined)
    },
  )
  it('keeps the established defaults when a theme is missing or invalid', () => {
    expect(bootstrap('/', null).className).toBe('dark')
    expect(bootstrap('/dashboard', 'invalid').className).toBe('dim')
  })
})
