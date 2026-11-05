import { describe, expect, it, jest } from '@jest/globals'
import { buildUser } from '@modules/users/__tests__/fixtures/users.fixtures'
import { ModerationController } from './moderation.controller'
import type { CreateReportDto } from './moderation.dto'
import type { ModerationService } from './moderation.service'

describe('ModerationController', () => {
  it('delegates report policy to ModerationService', async () => {
    const createReport = jest.fn<(reporterId: string, dto: CreateReportDto) => Promise<unknown>>()
    createReport.mockResolvedValue({ id: 'report-1' })
    const controller = new ModerationController({ createReport } as unknown as ModerationService)
    const dto: CreateReportDto = {
      entityType: 'track',
      entityId: '018f47a2-7b5d-7cc3-8d25-8aa38e5f4ea2',
      reason: 'Harmful content',
    }

    await expect(controller.create(buildUser({ id: 'user-1' }), dto)).resolves.toEqual({
      id: 'report-1',
    })
    expect(createReport).toHaveBeenCalledWith('user-1', dto)
  })
})
