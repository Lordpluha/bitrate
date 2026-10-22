import { DialogRef } from '@angular/cdk/dialog'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { SessionStore } from '@application/session'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppCommandPalette } from './command-palette'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, LOCALES } from './locale-store'
import { ThemeStore } from './theme-store'

const en = {
  nav: { overview: 'Overview', moderation: 'Moderation', users: 'Listeners' },
  shell: {
    palette: {
      label: 'Command palette',
      placeholder: 'Type',
      results: 'Results',
      empty: 'Nothing matches',
      group: { navigation: 'Navigation', actions: 'Actions' },
      switchTheme: 'Switch theme',
      switchLanguage: 'Switch language',
      toggleSidebar: 'Fold the sidebar',
    },
  },
}
const uk = {
  ...en,
  nav: { overview: 'Огляд', moderation: 'Модерація', users: 'Слухачі' },
}

describe('AppCommandPalette', () => {
  const close = vi.fn()

  beforeEach(() => {
    localStorage.clear()
    close.mockReset()
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en, uk },
          preloadLangs: true,
          translocoConfig: { availableLangs: [...LOCALES], defaultLang: DEFAULT_LOCALE },
        }),
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: DialogRef, useValue: { close } },
      ],
    })
    TestBed.inject(SessionStore).set({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      email: 'leo@bitrate.me',
      username: 'leo.mod',
      roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
      roleName: 'Moderator',
      permissions: ['overview:read', 'reports:read', 'users:read'],
    })
  })

  async function render() {
    const fixture = TestBed.createComponent(AppCommandPalette)
    await fixture.whenStable()
    const host = fixture.nativeElement as HTMLElement
    const input = host.querySelector('input') as HTMLInputElement
    const type = async (value: string) => {
      input.value = value
      input.dispatchEvent(new Event('input'))
      await fixture.whenStable()
    }
    const key = async (name: string) => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: name }))
      await fixture.whenStable()
    }
    const options = () =>
      Array.from(host.querySelectorAll('[role="option"]')).map((o) => o.textContent?.trim())
    return { host, input, type, key, options }
  }

  it('lists the sections the operator may open, then the actions', async () => {
    const { options } = await render()

    expect(options()).toEqual([
      'Overview',
      'Moderation',
      'Listeners',
      'Switch theme',
      'Switch language',
      'Fold the sidebar',
    ])
  })

  it('narrows the list as the operator types', async () => {
    const { type, options } = await render()
    await type('list')

    expect(options()).toEqual(['Listeners'])
  })

  /** Filtering matches what is on screen, so a Ukrainian operator types Ukrainian. */
  it('matches the translated label', async () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'uk')
    const { type, options } = await render()
    await type('модер')

    expect(options()).toEqual(['Модерація'])
  })

  it('says so when nothing matches', async () => {
    const { host, type } = await render()
    await type('zzz')

    expect(host.querySelector('[role="status"]')?.textContent).toContain('Nothing matches')
  })

  it('moves the active row with the arrows and runs it with Enter', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true)
    const { input, key } = await render()

    await key('ArrowDown')
    expect(input.getAttribute('aria-activedescendant')).toBe('palette-nav:/moderation')

    await key('Enter')
    expect(close).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith('/moderation')
  })

  it('wraps from the first row to the last', async () => {
    const { input, key } = await render()
    await key('ArrowUp')

    expect(input.getAttribute('aria-activedescendant')).toBe('palette-sidebar')
  })

  it('runs an action on click', async () => {
    const theme = TestBed.inject(ThemeStore)
    const { host } = await render()
    const row = Array.from(host.querySelectorAll<HTMLElement>('[role="option"]')).find((o) =>
      o.textContent?.includes('Switch theme'),
    )
    row?.click()

    expect(theme.theme()).toBe('light')
    expect(close).toHaveBeenCalled()
  })
})
