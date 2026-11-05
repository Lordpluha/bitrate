import { createReadStream } from 'node:fs'
import type { StorageService } from '@infra/storage/storage.types'
import { Logger } from '@nestjs/common'
import type { PreparedCmafPackage } from './audio-artifact.types'

const logger = new Logger('AudioArtifactStorage', { timestamp: true })

/** Everything one finished conversion needs to publish to storage. */
export type UploadArtifactsInput = {
  storage: StorageService
  generationRoot: string
  cmafPackage: PreparedCmafPackage
}

/**
 * Uploads the CMAF renditions of one generation, one file per bitrate (ADR-0065):
 *   tracks/{trackId}/generations/{generation}/cmaf/{bitrate}.m4a
 *
 * Nothing serves a generation until the publish transaction points the track at it, so the
 * files need no upload order.
 */
export async function uploadArtifacts({
  storage,
  generationRoot,
  cmafPackage,
}: UploadArtifactsInput): Promise<void> {
  await Promise.all(
    cmafPackage.renditions.map(async (rendition) => {
      await storage.upload(
        rendition.audioKey,
        createReadStream(rendition.temporaryPath),
        'audio/mp4',
      )
    }),
  )
  logger.log(`Uploaded all audio assets under ${generationRoot}`)
}
