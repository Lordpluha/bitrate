import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { RoleRepository, type Role } from '@domain/role'
import { type CreateStaffInput, StaffRepository, type StaffMember } from '@domain/staff'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StaffCreatePage } from './staff-create'

function role(overrides: Partial<Role> = {}): Role {
  return {
    id: 'role-moderator',
    name: 'MODERATOR',
    description: null,
    builtIn: true,
    permissions: ['reports:read', 'artists:read'],
    holders: 3,
    divergentHolders: 0,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

const MODERATOR_ROLE = role()
const CUSTOM_ROLE = role({
  id: 'role-custom',
  name: 'Catalog reviewer',
  builtIn: false,
  permissions: ['tracks:read'],
})

function createdMember(): StaffMember {
  return {
    id: 'new-id',
    email: 'new@bitrate.me',
    username: 'newops',
    role: {
      id: MODERATOR_ROLE.id,
      name: MODERATOR_ROLE.name,
      permissions: MODERATOR_ROLE.permissions,
    },
    permissions: MODERATOR_ROLE.permissions,
    deactivatedAt: null,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
  }
}

function setInputValue(el: HTMLInputElement, value: string): void {
  el.value = value
  el.dispatchEvent(new Event('input'))
}

describe('StaffCreatePage', () => {
  let create: ReturnType<typeof vi.fn>

  beforeEach(() => {
    create = vi.fn().mockResolvedValue(createdMember())

    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        {
          provide: RoleRepository,
          useValue: { list: () => Promise.resolve([MODERATOR_ROLE, CUSTOM_ROLE]) },
        },
        { provide: StaffRepository, useValue: { create } },
      ],
    })
  })

  it('repopulates the permission preview when the selected role changes', async () => {
    const fixture = TestBed.createComponent(StaffCreatePage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    const select = host.querySelector<HTMLSelectElement>('#staff-role')!
    select.value = CUSTOM_ROLE.id
    select.dispatchEvent(new Event('change'))
    await fixture.whenStable()

    expect(host.querySelector<HTMLInputElement>('#tracks\\:read')?.checked).toBe(true)
    expect(host.querySelector<HTMLInputElement>('#artists\\:read')?.checked).toBe(false)
  })

  it('sends the adjusted permission set as an override once the grid is touched', async () => {
    const fixture = TestBed.createComponent(StaffCreatePage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    setInputValue(host.querySelector('#staff-email')!, 'ops@bitrate.me')
    setInputValue(host.querySelector('#staff-username')!, 'ops')
    setInputValue(host.querySelector('#staff-password')!, 'correct-horse-battery')

    const select = host.querySelector<HTMLSelectElement>('#staff-role')!
    select.value = MODERATOR_ROLE.id
    select.dispatchEvent(new Event('change'))
    await fixture.whenStable()

    const checkbox = host.querySelector<HTMLInputElement>('#artists\\:read')!
    checkbox.checked = false
    checkbox.dispatchEvent(new Event('change'))
    await fixture.whenStable()

    host.querySelector('form')!.dispatchEvent(new Event('submit'))
    await fixture.whenStable()

    expect(create).toHaveBeenCalledTimes(1)
    const input = create.mock.calls[0]?.[0] as CreateStaffInput
    expect(input.permissions).toEqual(['reports:read'])
  })

  it('does not send an override when the preview was never touched', async () => {
    const fixture = TestBed.createComponent(StaffCreatePage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    setInputValue(host.querySelector('#staff-email')!, 'ops@bitrate.me')
    setInputValue(host.querySelector('#staff-username')!, 'ops')
    setInputValue(host.querySelector('#staff-password')!, 'correct-horse-battery')

    const select = host.querySelector<HTMLSelectElement>('#staff-role')!
    select.value = MODERATOR_ROLE.id
    select.dispatchEvent(new Event('change'))
    await fixture.whenStable()

    host.querySelector('form')!.dispatchEvent(new Event('submit'))
    await fixture.whenStable()

    expect(create).toHaveBeenCalledTimes(1)
    const input = create.mock.calls[0]?.[0] as CreateStaffInput
    expect(input.permissions).toBeUndefined()
  })

  it('rejects a password under 12 characters before submitting', async () => {
    const fixture = TestBed.createComponent(StaffCreatePage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    setInputValue(host.querySelector('#staff-email')!, 'ops@bitrate.me')
    setInputValue(host.querySelector('#staff-username')!, 'ops')
    setInputValue(host.querySelector('#staff-password')!, 'short')

    const select = host.querySelector<HTMLSelectElement>('#staff-role')!
    select.value = MODERATOR_ROLE.id
    select.dispatchEvent(new Event('change'))
    await fixture.whenStable()

    host.querySelector('form')!.dispatchEvent(new Event('submit'))
    await fixture.whenStable()

    expect(create).not.toHaveBeenCalled()
    expect(host.textContent).toContain('at least 12 characters')
  })
})
