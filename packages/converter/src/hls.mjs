import fs from 'node:fs/promises'
import { join } from 'node:path'
import { execa } from 'execa'
import ffmpegPath from 'ffmpeg-static'

/**
 * Convert an audio file into an HLS VOD variant with fragmented MP4 segments.
 * @param {Object} options
 * @param {string} options.input
 * @param {string} options.outputDir
 * @param {string} options.bitrate
 * @param {number} [options.segmentDuration=10]
 * @param {number} [options.timeoutMs] - Optional FFmpeg timeout in milliseconds
 * @returns {Promise<{playlist: string, outputDir: string}>}
 */
export async function convertAudioToHls({
  input,
  outputDir,
  bitrate,
  segmentDuration = 10,
  timeoutMs,
}) {
  if (!ffmpegPath) {
    throw new Error('FFmpeg binary not found. Ensure ffmpeg-static is installed correctly.')
  }

  try {
    await fs.access(input)
  } catch {
    throw new Error(`Input file not found: ${input}`)
  }

  if (!/^\d+k$/.test(bitrate)) {
    throw new Error('Bitrate must use the "128k" format')
  }

  if (!Number.isFinite(segmentDuration) || segmentDuration < 1 || segmentDuration > 30) {
    throw new Error('Segment duration must be between 1 and 30 seconds')
  }

  if (timeoutMs !== undefined && (!Number.isFinite(timeoutMs) || timeoutMs <= 0)) {
    throw new Error('Timeout must be a positive number')
  }

  await fs.mkdir(outputDir, { recursive: true })
  const playlist = join(outputDir, 'index.m3u8')
  const segmentPattern = join(outputDir, 'segment_%05d.m4s')

  const args = [
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    input,
    '-map',
    '0:a:0',
    '-vn',
    '-c:a',
    'aac',
    '-b:a',
    bitrate,
    '-ac',
    '2',
    '-ar',
    '48000',
    '-f',
    'hls',
    '-hls_time',
    String(segmentDuration),
    '-hls_playlist_type',
    'vod',
    '-hls_segment_type',
    'fmp4',
    '-hls_fmp4_init_filename',
    'init.mp4',
    '-hls_segment_filename',
    segmentPattern,
    '-y',
    playlist,
  ]

  try {
    if (timeoutMs === undefined) {
      await execa(ffmpegPath, args)
    } else {
      await execa(ffmpegPath, args, { timeout: timeoutMs })
    }
    return { playlist, outputDir }
  } catch (error) {
    throw new Error(`FFmpeg HLS error: ${error instanceof Error ? error.message : error}`)
  }
}
