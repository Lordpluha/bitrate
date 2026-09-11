import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AdminModerationController } from './admin-moderation.controller'
import type { AdminModerationService } from './admin-moderation.service'
import { ReportNotFoundException } from './errors'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
  }) as unknown as jest.Mocked<AdminModerationService>

describe('AdminModerationController', () => {
  let controller: AdminModerationController
  let service: jest.Mocked<AdminModerationService>

  beforeEach(() => {
    service = makeServiceMock()
    controller = new AdminModerationController(service)
  })

  it('list delegates to the service with the parsed query', () => {
    controller.list({ page: 1, limit: 20, status: 'OPEN' })

    expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 20, status: 'OPEN' })
  })

  it('getById delegates to the service', () => {
    controller.getById('report-1')

    expect(service.findById).toHaveBeenCalledWith('report-1')
  })

  it('getById surfaces ReportNotFoundException from the service', async () => {
    service.findById.mockRejectedValue(new ReportNotFoundException('missing') as never)

    await expect(controller.getById('missing')).rejects.toThrow(ReportNotFoundException)
  })

  it('update delegates to the service', () => {
    controller.update('report-1', { status: 'RESOLVED' })

    expect(service.updateStatus).toHaveBeenCalledWith('report-1', { status: 'RESOLVED' })
  })
})
