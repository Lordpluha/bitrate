import fs from 'node:fs/promises'
import { join } from 'node:path'
import { execa } from 'execa'
import ffmpegPath from 'ffmpeg-static'

/**
 * Convert an audio file into a multi-bitrate HLS VOD stream with fragmented MP4 segments.
 * @param {Object} options
 * @param {string} options.input
 * @param {string} options.outputDir
 * @param {string[]} options.bitrates
 * @param {number} [options.segmentDuration=4]
 * @param {number} [options.timeoutMs] - Optional FFmpeg timeout in milliseconds
 * @returns {Promise<{masterPlaylist: string, outputDir: string}>}
 */
export async function convertAudioToHls({
  input,
  outputDir,
  bitrates,
  segmentDuration = 4,
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

  if (!Array.isArray(bitrates) || bitrates.length === 0) {
    throw new Error('At least one bitrate must be specified')
  }

  for (const bitrate of bitrates) {
    if (!/^\d+k$/.test(bitrate)) {
      throw new Error(`Invalid bitrate format: "${bitrate}". Use e.g. "128k"`)
    }
  }

  if (!Number.isFinite(segmentDuration) || segmentDuration < 1 || segmentDuration > 30) {
    throw new Error('Segment duration must be between 1 and 30 seconds')
  }

  if (timeoutMs !== undefined && (!Number.isFinite(timeoutMs) || timeoutMs <= 0)) {
    throw new Error('Timeout must be a positive number')
  }

  await fs.mkdir(outputDir, { recursive: true })
  await Promise.all(
    bitrates.map((bitrate) =>
      fs.mkdir(join(outputDir, bitrate.replace(/k$/, '')), { recursive: true }),
    ),
  )

  const masterPlaylist = join(outputDir, 'master.m3u8')
  const streamArgs = []
  const variantMap = []

  for (const [index, bitrate] of bitrates.entries()) {
    streamArgs.push(
      '-map',
      '0:a:0',
      `-c:a:${index}`,
      'aac',
      `-b:a:${index}`,
      bitrate,
      `-ac:a:${index}`,
      '2',
      `-ar:a:${index}`,
      '48000',
    )
    variantMap.push(`a:${index},name:${bitrate.replace(/k$/, '')}`)
  }

  const args = [
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    input,
    '-vn',
    ...streamArgs,
    '-f',
    'hls',
    '-hls_time',
    String(segmentDuration),
    '-hls_playlist_type',
    'vod',
    '-hls_flags',
    'independent_segments',
    '-hls_segment_type',
    'fmp4',
    '-hls_fmp4_init_filename',
    'init.mp4',
    '-hls_segment_filename',
    join(outputDir, '%v', 'segment_%05d.m4s'),
    '-var_stream_map',
    variantMap.join(' '),
    '-master_pl_name',
    'master.m3u8',
    '-y',
    join(outputDir, '%v', 'index.m3u8'),
  ]

  try {
    if (timeoutMs === undefined) {
      await execa(ffmpegPath, args)
    } else {
      await execa(ffmpegPath, args, { timeout: timeoutMs })
    }
    return { masterPlaylist, outputDir }
  } catch (error) {
    throw new Error(`FFmpeg HLS error: ${error instanceof Error ? error.message : error}`)
  }
}
