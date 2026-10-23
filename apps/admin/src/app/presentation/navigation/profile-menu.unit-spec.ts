import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { SessionStore, SignOutUseCase } from '@application/session'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_LOCALE, LOCALES } from './locale-store'
import { AppProfileMenu, initialsOf } from './profile-menu'
import { ThemeStore } from './theme-store'

const en = {
  shell: {
    profile: {
      open: 'Open profile menu',
      language: 'Language',
      theme: 'Theme',
      signOut: 'Sign out',
      themeName: { dark: 'Dark', light: 'Light', dim: 'Dim' },
    },
  },
}

describe('initialsOf', () => {
  it('takes the first two letters, upper-cased', () => {
    expect(initialsOf('mara.ops')).toBe('MA')
  })

  it('skips punctuation and keeps Cyrillic letters', () => {
    expect(initialsOf('.юля')).toBe('ЮЛ')
  })

  it('never renders an empty avatar', () => {
    expect(initialsOf('')).toBe('?')
  })
})

describe('AppProfileMenu', () => {
  const signOut = vi.fn<() => Promise<void>>()

  beforeEach(() => {
    localStorage.clear()
    signOut.mockReset().mockResolvedValue(undefined)
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en, uk: en },
          translocoConfig: { availableLangs: [...LOCALES], defaultLang: DEFAULT_LOCALE },
        }),
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: SignOutUseCase, useValue: { execute: signOut } },
      ],
    })
    TestBed.inject(SessionStore).set({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      email: 'mara.ops@bitrate.fm',
      username: 'mara.ops',
      roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
      roleName: 'Super admin',
      permissions: [],
    })
  })

  async function open() {
    const fixture = TestBed.createComponent(AppProfileMenu)
    await fixture.whenStable()
    const trigger = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLButtonElement
    trigger.click()
    await fixture.whenStable()
    const menu = document.querySelector('[role="menu"]') as HTMLElement
    const item = (text: string) =>
      Array.from(menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).find((b) =>
        b.textContent?.includes(text),
      )
    return { fixture, trigger, menu, item }
  }

  it('shows the avatar initials and a labelled trigger', async () => {
    const fixture = TestBed.createComponent(AppProfileMenu)
    await fixture.whenStable()
    const trigger = (fixture.nativeElement as HTMLElement).querySelector('button')

    expect(trigger?.textContent?.trim()).toBe('MA')
    expect(trigger?.getAttribute('aria-label')).toBe('Open profile menu')
  })

  it('names who is signed in, their role and email', async () => {
    const { menu } = await open()

    expect(menu.textContent).toContain('mara.ops')
    expect(menu.textContent).toContain('Super admin · mara.ops@bitrate.fm')
  })

  it('shows the current language by its own name and the current theme', async () => {
    const { item } = await open()

    expect(item('Language')?.textContent).toContain('English')
    expect(item('Theme')?.textContent).toContain('Dark')
  })

  it('switches the theme', async () => {
    const { item } = await open()
    item('Theme')?.click()

    expect(TestBed.inject(ThemeStore).theme()).toBe('light')
  })

  it('signs out and goes to the sign-in page', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true)
    const { fixture, item } = await open()
    item('Sign out')?.click()
    await fixture.whenStable()

    expect(signOut).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith(['/login'])
  })
})
