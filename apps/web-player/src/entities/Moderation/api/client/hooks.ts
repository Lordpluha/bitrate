'use client'

import type { ApiSchemas } from '@bitrate/contracts'
import { useMutation } from '@/shared/api/client'

export type CreateReportPayload = ApiSchemas['CreateReportDto']

export const useCreateModerationReport = () =>
  useMutation('post', '/api/v1/moderation/reports')
