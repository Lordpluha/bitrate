import { Component, provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it } from 'vitest'
import { PasswordToggle } from './password-toggle'
import { provideTestTransloco } from '@testing/transloco'

@Component({
  imports: [PasswordToggle],
  template: `
    <input #secret type="password" />
    <app-password-toggle [target]="secret" />
  `,
})
class Host {}

async function create() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const host = fixture.nativeElement as HTMLElement
  return {
    fixture,
    field: host.querySelector('input') as HTMLInputElement,
    toggle: host.querySelector('button') as HTMLButtonElement,
  }
}

describe('PasswordToggle', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [...provideTestTransloco(), provideZonelessChangeDetection()],
    })
  })

  it('starts hidden, named by the action it performs', async () => {
    const { field, toggle } = await create()

    expect(field.type).toBe('password')
    expect(toggle.type).toBe('button')
    expect(toggle.getAttribute('aria-label')).toBe('Show password')
    expect(toggle.getAttribute('aria-pressed')).toBe('false')
  })

  it('reveals the password and hides it again', async () => {
    const { fixture, field, toggle } = await create()

    toggle.click()
    await fixture.whenStable()

    expect(field.type).toBe('text')
    expect(toggle.getAttribute('aria-label')).toBe('Hide password')
    expect(toggle.getAttribute('aria-pressed')).toBe('true')

    toggle.click()
    await fixture.whenStable()

    expect(field.type).toBe('password')
    expect(toggle.getAttribute('aria-label')).toBe('Show password')
  })
})
