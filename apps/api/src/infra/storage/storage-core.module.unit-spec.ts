import { S3Service } from '@infra/s3/s3.service'
import { describe, expect, it } from '@jest/globals'
import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { LocalStorageService } from './local-storage.service'
import { STORAGE_SERVICE } from './storage.constants'
import { StorageModule } from './storage.module'
import { StorageCoreModule } from './storage-core.module'

const baseConfig: Record<string, unknown> = {
  JWT_SECRET: 'core-module-secret',
  API_BASE_URL: 'http://localhost:3000',
  storage: { getPrivateRoot: () => '/tmp/unused-storage-root' },
  s3: {
    endpoint: 'http://localhost:9',
    region: 'us-east-1',
    bucket: 'b',
    accessKey: 'a',
    secretKey: 's',
    forcePathStyle: true,
  },
}

async function resolveStorage(driver: 's3' | 'local') {
  const values = { ...baseConfig, STORAGE_DRIVER: driver }
  const config = { getOrThrow: (key: string) => values[key], get: (key: string) => values[key] }
  @Global()
  @Module({ providers: [{ provide: ConfigService, useValue: config }], exports: [ConfigService] })
  class FakeConfigModule {}
  const moduleRef = await Test.createTestingModule({
    imports: [FakeConfigModule, StorageCoreModule],
  }).compile()
  return moduleRef.get(STORAGE_SERVICE)
}

describe('StorageCoreModule', () => {
  it('has no auth imports', () => {
    expect(Reflect.getMetadata('imports', StorageCoreModule) ?? []).toEqual([])
  })

  it('exports STORAGE_SERVICE and LocalStorageService', () => {
    const exported = Reflect.getMetadata('exports', StorageCoreModule) as unknown[]
    expect(exported).toEqual(expect.arrayContaining([STORAGE_SERVICE, LocalStorageService]))
  })

  it('binds the driver selected by STORAGE_DRIVER', async () => {
    expect(await resolveStorage('local')).toBeInstanceOf(LocalStorageService)
    expect(await resolveStorage('s3')).toBeInstanceOf(S3Service)
  })

  it('is re-exported by StorageModule, which keeps the controller', () => {
    expect(Reflect.getMetadata('imports', StorageModule)).toEqual(
      expect.arrayContaining([StorageCoreModule]),
    )
    expect(Reflect.getMetadata('exports', StorageModule)).toEqual(
      expect.arrayContaining([StorageCoreModule]),
    )
    expect(Reflect.getMetadata('controllers', StorageModule)).toHaveLength(1)
  })
})
