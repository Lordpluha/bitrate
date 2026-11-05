import type { Prisma } from '@prisma/client'

export const TASK_SELECT = {
  id: true,
  releaseId: true,
  title: true,
  notes: true,
  status: true,
  dueAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  assignee: { select: { id: true, displayName: true } },
} as const satisfies Prisma.ReleaseTaskSelect
