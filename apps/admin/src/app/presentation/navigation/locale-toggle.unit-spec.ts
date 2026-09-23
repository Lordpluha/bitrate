import { provideZonelessChangeDetection } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE, LOCALES, LocaleStore } from './locale-store'
import { AppLocaleToggle } from './locale-toggle'

async function render(collapsed = false): Promise<ComponentFixture<AppLocaleToggle>> {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    imports: [
      TranslocoTestingModule.forRoot({
        langs: { en: {}, uk: {} },
        translocoConfig: { availableLangs: [...LOCALES], defaultLang: DEFAULT_LOCALE },
      }),
    ],
    providers: [provideZonelessChangeDetection()],
  })

  const fixture = TestBed.createComponent(AppLocaleToggle)
  fixture.componentRef.setInput('collapsed', collapsed)
  await fixture.whenStable()

  return fixture
}

function html(fixture: ComponentFixture<AppLocaleToggle>): HTMLElement {
  return fixture.nativeElement as HTMLElement
}

describe('AppLocaleToggle', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the current language label and an accessible name', async () => {
    const fixture = await render()
    const button = html(fixture).querySelector('button')

    expect(button?.textContent).toContain('English')
    expect(button?.getAttribute('aria-label')).toContain('English')
  })

  it('keeps the label available to screen readers when collapsed', async () => {
    const el = html(await render(true))

    expect(el.querySelector('.sr-only')?.textContent).toContain('English')
    expect(el.querySelector('button')?.getAttribute('title')).toBe('English')
  })

  it('cycles the language through the shared store on click', async () => {
    const fixture = await render()
    const store = TestBed.inject(LocaleStore)

    html(fixture).querySelector('button')?.click()
    await fixture.whenStable()

    expect(store.locale()).toBe('uk')
    expect(html(fixture).querySelector('button')?.textContent).toContain('Українська')
  })
})
