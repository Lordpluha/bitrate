import { describe, expect, it } from 'vitest'
import { toStaffMember } from './staff-member.mapper'
import { staffMemberDto, staffMemberPageDto } from './staff-member.dto'

const ROLE = {
  id: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  name: 'MODERATOR',
  permissions: ['reports:read'],
}

describe('toStaffMember', () => {
  it('parses a realistic operator payload and converts its dates', () => {
    const dto = staffMemberDto.parse({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      email: 'ops@bitrate.me',
      username: 'ops',
      role: ROLE,
      permissions: ['reports:read'],
      deletedAt: null,
      createdAt: '2026-09-01T09:00:00.000Z',
    })

    expect(toStaffMember(dto)).toEqual({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      email: 'ops@bitrate.me',
      username: 'ops',
      role: { id: ROLE.id, name: 'MODERATOR', permissions: ['reports:read'] },
      permissions: ['reports:read'],
      deactivatedAt: null,
      createdAt: new Date('2026-09-01T09:00:00.000Z'),
    })
  })

  it('converts a soft-delete timestamp into deactivatedAt', () => {
    const dto = staffMemberDto.parse({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      email: 'ops@bitrate.me',
      username: 'ops',
      role: ROLE,
      permissions: [],
      deletedAt: '2026-09-10T00:00:00.000Z',
      createdAt: '2026-09-01T09:00:00.000Z',
    })

    expect(toStaffMember(dto).deactivatedAt).toEqual(new Date('2026-09-10T00:00:00.000Z'))
  })

  it('keeps an empty permissions array for a built-in ADMIN holder', () => {
    const dto = staffMemberDto.parse({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      email: 'root@bitrate.me',
      username: 'root',
      role: { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'ADMIN', permissions: [] },
      permissions: [],
      deletedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    })

    expect(toStaffMember(dto).permissions).toEqual([])
  })

  it('parses a page envelope', () => {
    const page = staffMemberPageDto.parse({
      data: [
        {
          id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
          email: 'ops@bitrate.me',
          username: 'ops',
          role: ROLE,
          permissions: ['reports:read'],
          deletedAt: null,
          createdAt: '2026-09-01T09:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    })

    expect(page.data.map(toStaffMember)).toHaveLength(1)
  })
})
