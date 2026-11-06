import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import type { StorageService } from '@infra/storage/storage.types'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { downloadObjectToFile, storeMaster } from './audio-master'
import { getMasterKey } from './audio-storage-keys'

function exists(path: string): Promise<boolean> {
  return access(path).then(
    () => true,
    () => false,
  )
}

/** In-memory storage that, like S3Service, needs a Buffer or file stream with a known length. */
function memoryStorage() {
  const objects = new Map<string, Buffer>()
  const storage = {
    upload: jest.fn(async (key: string, body: Buffer | Readable) => {
      const chunks: Buffer[] = []
      for await (const chunk of body as AsyncIterable<Buffer>) chunks.push(Buffer.from(chunk))
      objects.set(key, Buffer.concat(chunks))
      return key
    }),
    getObjectStream: jest.fn(async (key: string) => ({
      stream: Readable.from([objects.get(key) as Buffer]),
    })),
  }
  return { objects, storage: storage as unknown as jest.Mocked<StorageService> }
}

describe('getMasterKey', () => {
  it('names the master by its source file, never by a path', () => {
    expect(getMasterKey('abc.mp3')).toBe('masters/abc.mp3')
  })
})

describe('master transfer', () => {
  let dir: string
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'master-spec-'))
  })
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('uploads the master under its key and removes the temporary file', async () => {
    const { storage, objects } = memoryStorage()
    const file = join(dir, 'upload.mp3')
    await writeFile(file, 'audio-bytes')

    await storeMaster({
      storage,
      key: 'masters/upload.mp3',
      filePath: file,
      contentType: 'audio/mpeg',
    })

    expect(objects.get('masters/upload.mp3')?.toString()).toBe('audio-bytes')
    expect(storage.upload).toHaveBeenCalledWith(
      'masters/upload.mp3',
      expect.anything(),
      'audio/mpeg',
    )
    expect(await exists(file)).toBe(false)
  })

  it('keeps the temporary file when the upload fails', async () => {
    const { storage } = memoryStorage()
    storage.upload.mockRejectedValueOnce(new Error('store down') as never)
    const file = join(dir, 'upload.mp3')
    await writeFile(file, 'x')

    await expect(
      storeMaster({
        storage,
        key: 'masters/upload.mp3',
        filePath: file,
        contentType: 'audio/mpeg',
      }),
    ).rejects.toThrow('store down')
    expect(await exists(file)).toBe(true)
  })

  it('downloads an object into a local file', async () => {
    const { storage, objects } = memoryStorage()
    objects.set('masters/a.mp3', Buffer.from('payload'))
    const target = join(dir, 'a.mp3')

    await downloadObjectToFile(storage, 'masters/a.mp3', target)

    expect((await readFile(target)).toString()).toBe('payload')
  })
})
