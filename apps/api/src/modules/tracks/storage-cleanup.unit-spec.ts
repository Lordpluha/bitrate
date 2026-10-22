import type { StorageService } from '@infra/storage/storage.types'
import { describe, expect, it, jest } from '@jest/globals'
import type { Logger } from '@nestjs/common'
import { mockDeep } from 'jest-mock-extended'
import { deleteObjectQuietly } from './storage-cleanup'

describe('deleteObjectQuietly', () => {
  it('deletes the object', async () => {
    const storage = mockDeep<StorageService>()
    const logger = { warn: jest.fn() } as unknown as Logger

    await deleteObjectQuietly(storage, 'masters/a.mp3', logger)

    expect(storage.deleteObject).toHaveBeenCalledWith('masters/a.mp3')
    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('logs a storage failure instead of throwing', async () => {
    const storage = mockDeep<StorageService>()
    storage.deleteObject.mockRejectedValue(new Error('storage down'))
    const logger = { warn: jest.fn() } as unknown as Logger

    await expect(deleteObjectQuietly(storage, 'masters/a.mp3', logger)).resolves.toBeUndefined()

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('storage down'))
  })
})
