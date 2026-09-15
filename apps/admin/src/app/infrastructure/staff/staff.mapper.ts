import type { Staff, StaffRole } from '@domain/staff'
import type { StaffDto, WireStaffRole } from './staff.dto'

/** See `track.mapper.ts` — a role the API grows later is a compile error at this record. */
const TO_DOMAIN_ROLE = {
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
} as const satisfies Record<WireStaffRole, StaffRole>

export function toStaff(dto: StaffDto): Staff {
  return {
    id: dto.id,
    email: dto.email,
    username: dto.username,
    role: TO_DOMAIN_ROLE[dto.role],
  }
}
