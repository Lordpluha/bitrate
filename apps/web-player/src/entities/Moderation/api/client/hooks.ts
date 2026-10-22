'use client'

import { useMutation } from '@/shared/api/client'

export const useCreateModerationReport = () =>
  useMutation('post', '/api/v1/moderation/reports', {
    meta: { errorMessage: 'Could not submit report' },
  })
