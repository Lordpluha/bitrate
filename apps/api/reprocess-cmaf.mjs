/**
 * Re-enqueues the audio-processing job for one existing track so it gets
 * CMAF renditions. Mirrors exactly what TracksService does on upload.
 */
import { Queue } from 'bullmq'

const [trackId, sourceFileName] = process.argv.slice(2)

if (!(trackId && sourceFileName)) {
  console.error('usage: node reprocess.mjs <trackId> <sourceFileName>')
  process.exit(1)
}

const tracksDir = '/home/spiderman/Рабочий стол/spotify-clone/apps/api/storage/private/tracks'

const queue = new Queue('audio-processing', {
  connection: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
  },
})

const job = await queue.add(
  'convert-audio',
  {
    trackId,
    artistId: 'reprocess',
    sourceFileName,
    inputPath: `${tracksDir}/${sourceFileName}`,
    outputDir: tracksDir,
    format: 'opus',
    bitrates: ['128k', '192k', '320k'],
  },
  {
    attempts: 5,
    backoff: { type: 'exponential', delay: 5_000 },
    removeOnComplete: { age: 3_600, count: 1_000 },
    removeOnFail: { age: 604_800, count: 5_000 },
    jobId: `convert-audio-${trackId}-${sourceFileName}-cmaf-${Date.now()}`,
  },
)

console.log(`задача поставлена: ${job.id}`)
await queue.close()
