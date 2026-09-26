import { provideZonelessChangeDetection } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE, LOCALES } from './locale-store'
import { THEMES, ThemeStore } from './theme-store'
import { AppThemeToggle } from './theme-toggle'

const themeEn = {
  theme: {
    dark: 'Dark theme',
    light: 'Light theme',
    dim: 'Dim theme',
    ariaLabel: '{{label}}. Activate to switch theme.',
  },
}

async function render(collapsed = false): Promise<ComponentFixture<AppThemeToggle>> {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    imports: [
      TranslocoTestingModule.forRoot({
        langs: { en: themeEn, uk: themeEn },
        translocoConfig: { availableLangs: [...LOCALES], defaultLang: DEFAULT_LOCALE },
      }),
    ],
    providers: [provideZonelessChangeDetection()],
  })

  const fixture = TestBed.createComponent(AppThemeToggle)
  fixture.componentRef.setInput('collapsed', collapsed)
  await fixture.whenStable()

  return fixture
}

function html(fixture: ComponentFixture<AppThemeToggle>): HTMLElement {
  return fixture.nativeElement as HTMLElement
}

describe('AppThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove(...THEMES)
  })

  it('shows the current theme label and an accessible name', async () => {
    const fixture = await render()
    const button = html(fixture).querySelector('button')

    expect(button?.textContent).toContain('Dark theme')
    expect(button?.getAttribute('aria-label')).toContain('Dark theme')
  })

  it('keeps the label available to screen readers when collapsed', async () => {
    const el = html(await render(true))

    expect(el.querySelector('.sr-only')?.textContent).toContain('Dark theme')
    expect(el.querySelector('button')?.getAttribute('title')).toBe('Dark theme')
  })

  it('cycles the theme through the shared store on click', async () => {
    const fixture = await render()
    const store = TestBed.inject(ThemeStore)

    html(fixture).querySelector('button')?.click()
    await fixture.whenStable()

    expect(store.theme()).toBe('light')
    expect(html(fixture).querySelector('button')?.textContent).toContain('Light theme')
  })
})
