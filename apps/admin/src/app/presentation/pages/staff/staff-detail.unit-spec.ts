import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router'
import { RoleRepository, type Role } from '@domain/role'
import { StaffRepository, type StaffMember } from '@domain/staff'
import { beforeEach, describe, expect, it } from 'vitest'
import { StaffDetailPage } from './staff-detail'

function role(overrides: Partial<Role> = {}): Role {
  return {
    id: 'role-moderator',
    name: 'MODERATOR',
    description: null,
    builtIn: true,
    permissions: ['reports:read'],
    holders: 3,
    divergentHolders: 0,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

function member(overrides: Partial<StaffMember> = {}): StaffMember {
  return {
    id: 'member-1',
    email: 'ops@bitrate.me',
    username: 'ops',
    role: { id: 'role-moderator', name: 'MODERATOR', permissions: ['reports:read'] },
    permissions: ['reports:read'],
    deactivatedAt: null,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    ...overrides,
  }
}

function configure(input: { member: StaffMember; roles: Role[] }): void {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ id: input.member.id }) } },
      },
      { provide: RoleRepository, useValue: { list: () => Promise.resolve(input.roles) } },
      { provide: StaffRepository, useValue: { get: () => Promise.resolve(input.member) } },
    ],
  })
}

describe('StaffDetailPage', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
  })

  it('shows no permission editor for a built-in ADMIN holder', async () => {
    configure({
      member: member({
        role: { id: 'admin-role', name: 'ADMIN', permissions: [] },
        permissions: [],
      }),
      roles: [role({ id: 'admin-role', name: 'ADMIN', permissions: [] })],
    })

    const fixture = TestBed.createComponent(StaffDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    expect(host.querySelector('app-permission-grid')).toBeNull()
    expect(host.textContent).toContain('built-in administrator')
  })

  it('shows an editable permission grid for a non-built-in holder', async () => {
    configure({ member: member(), roles: [role()] })

    const fixture = TestBed.createComponent(StaffDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    expect(host.querySelector('app-permission-grid')).not.toBeNull()
  })

  it('shows the overwrite warning next to role reassignment', async () => {
    configure({
      member: member(),
      roles: [
        role(),
        role({
          id: 'role-custom',
          name: 'Catalog reviewer',
          builtIn: false,
          permissions: ['tracks:read'],
        }),
      ],
    })

    const fixture = TestBed.createComponent(StaffDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    expect(host.textContent).toContain(
      "replaces this operator's current permissions with the new role's template",
    )
  })
})
