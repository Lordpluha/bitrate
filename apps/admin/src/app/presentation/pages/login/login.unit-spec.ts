import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { SignInUseCase } from '@application/session'
import type { Staff } from '@domain/staff'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from './login'

const STAFF: Staff = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'ADMIN',
  permissions: [],
}

const execute = vi.fn<() => Promise<Staff>>()
const navigate = vi.fn<() => Promise<boolean>>()

function create() {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      { provide: SignInUseCase, useValue: { execute } },
      { provide: Router, useValue: { navigate } },
    ],
  })

  const fixture = TestBed.createComponent(LoginPage)
  return { fixture, host: fixture.nativeElement as HTMLElement }
}

function fillAndSubmit(host: HTMLElement, email: string, password: string): void {
  const emailInput = host.querySelector<HTMLInputElement>('#email')
  const passwordInput = host.querySelector<HTMLInputElement>('#password')
  emailInput!.value = email
  emailInput!.dispatchEvent(new Event('input'))
  passwordInput!.value = password
  passwordInput!.dispatchEvent(new Event('input'))
  host.querySelector('form')?.dispatchEvent(new Event('submit'))
}

describe('LoginPage', () => {
  beforeEach(() => {
    execute.mockReset()
    navigate.mockReset()
    navigate.mockResolvedValue(true)
  })

  it('navigates to the guarded root on a successful sign-in, not a fixed screen', async () => {
    execute.mockResolvedValue(STAFF)
    const { fixture, host } = create()
    await fixture.whenStable()

    fillAndSubmit(host, 'ops@bitrate.me', 'correct-horse-battery-staple')
    await fixture.whenStable()

    /**
     * `/` — the overview dashboard, gated on `overview:read` — not `/moderation`. An operator who
     * lacks `overview:read` is redirected on by `requirePermission` to their first reachable route.
     */
    expect(navigate).toHaveBeenCalledWith(['/'])
  })

  it('shows a failure message and does not navigate when sign-in rejects', async () => {
    execute.mockRejectedValue(new Error('invalid credentials'))
    const { fixture, host } = create()
    await fixture.whenStable()

    fillAndSubmit(host, 'ops@bitrate.me', 'wrong-password')
    await fixture.whenStable()

    expect(navigate).not.toHaveBeenCalled()
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      'Sign-in failed. Check the address and password, then try again.',
    )
  })
})
