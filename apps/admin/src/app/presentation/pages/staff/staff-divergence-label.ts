import { permissionDivergence, type StaffMember } from '@domain/staff'

/**
 * A short label for the list's divergence badge, e.g. `"+2 / −1 vs MODERATOR"`. `null` when
 * there is nothing to show — the operator's permissions match the template, or they hold the
 * built-in ADMIN role (see `permissionDivergence`).
 */
export function staffDivergenceLabel(member: StaffMember): string | null {
  const diff = permissionDivergence(member)
  if (diff === null) return null
  if (diff.missing.length === 0 && diff.extra.length === 0) return null

  const parts: string[] = []
  if (diff.extra.length > 0) parts.push(`+${diff.extra.length}`)
  if (diff.missing.length > 0) parts.push(`−${diff.missing.length}`)

  return `${parts.join(' / ')} vs ${member.role.name}`
}
