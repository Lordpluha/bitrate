import { describe, expect, it } from 'vitest'
import type { StaffDto } from './staff.dto'
import { toStaff } from './staff.mapper'

const dto: StaffDto = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  role: 'MODERATOR',
  permissions: ['reports:read', 'reports:advance', 'artists:read'],
}

describe('toStaff', () => {
  it('parses a realistic StaffEntity payload into the domain shape', () => {
    expect(toStaff(dto)).toEqual({
      id: dto.id,
      email: dto.email,
      username: dto.username,
      roleId: dto.roleId,
      roleName: 'MODERATOR',
      permissions: ['reports:read', 'reports:advance', 'artists:read'],
    })
  })

  it('maps a custom role name through unchanged', () => {
    const custom = toStaff({ ...dto, role: 'Content Reviewer' })

    expect(custom.roleName).toBe('Content Reviewer')
  })

  it('maps an empty permission set to an empty domain list', () => {
    expect(toStaff({ ...dto, permissions: [] }).permissions).toEqual([])
  })
})
