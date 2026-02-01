import { PrismaService } from '@infra/prisma/prisma.service'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { stat } from 'fs/promises'
import { join, parse } from 'path'

interface ConvertAudioJob {
  trackId: string
  artistId: string
  inputPath: string
  outputDir: string
  format: string
  bitrates: string[]
}

@Processor('audio-processing')
export class AudioProcessingConsumer extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async process(job: Job<ConvertAudioJob>) {
    if (job.name !== 'convert-audio') {
      return
    }

    const { trackId, inputPath, outputDir, format, bitrates } = job.data
    const { name: baseName } = parse(inputPath)

    await this.ensureOutputDir(outputDir)

    for (const bitrate of bitrates) {
      const bitrateValue = Number(bitrate.replace('k', '')) || 0
      const outputFilename = `${baseName}_${bitrate}.${format}`
      const outputPath = join(outputDir, outputFilename)

      const { convertAudio } = await import('@spotify/converter')
      await convertAudio({
        input: inputPath,
        output: outputPath,
        bitrate,
        vbr: false,
        quality: 10,
        application: 'audio',
      })

      const stats = await stat(outputPath)

      await this.prisma.trackFile.create({
        data: {
          trackId,
          format,
          bitrate: bitrateValue,
          codec: format === 'opus' ? 'opus' : null,
          url: outputFilename,
          size: stats.size,
        },
      })
    }
  }

  private async ensureOutputDir(outputDir: string) {
    const { mkdir } = await import('fs/promises')
    await mkdir(outputDir, { recursive: true })
  }
}
