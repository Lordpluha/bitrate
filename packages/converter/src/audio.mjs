import fs from 'node:fs/promises'
import ffmpegPath from 'ffmpeg-static'
import { runFfmpeg } from './ffmpeg-process.mjs'

/**
 * Convert audio file to OGG Opus format
 * @param {Object} options - Conversion options
 * @param {string} options.input - Input audio file path
 * @param {string} [options.output] - Output file path (default: input with .opus extension)
 * @param {string} [options.bitrate='128k'] - Audio bitrate (64k, 96k, 128k, 192k, 256k, 320k)
 * @param {number} [options.quality=10] - Compression level 0-10 (10 is highest quality)
 * @param {boolean} [options.vbr=false] - Enable Variable Bitrate (default: CBR)
 * @param {string} [options.application='audio'] - Application type: audio, voip, lowdelay
 * @param {number} [options.timeoutMs] - Optional FFmpeg timeout in milliseconds
 * @param {(message: string) => void} [options.onLog] - Optional log sink (default: no-op)
 * @returns {Promise<{input: string, output: string, inputSize: string, outputSize: string}>}
 */
export async function convertAudio({
  input,
  output,
  bitrate = '128k',
  quality = 10,
  vbr = false,
  application = 'audio',
  timeoutMs,
  onLog = () => {},
}) {
  if (!ffmpegPath) {
    throw new Error('FFmpeg binary not found. Ensure ffmpeg-static is installed correctly.')
  }

  // Validate input file exists
  try {
    await fs.access(input)
  } catch {
    throw new Error(`Input file not found: ${input}`)
  }

  // Determine output path
  const outputPath = output || input.replace(/\.[^.]+$/, '.opus')

  // Validate bitrate
  const validBitrates = ['64k', '96k', '128k', '192k', '256k', '320k']
  if (!validBitrates.includes(bitrate)) {
    onLog(`⚠️  Warning: Unusual bitrate "${bitrate}". Common values: ${validBitrates.join(', ')}`)
  }

  // Validate quality
  if (quality < 0 || quality > 10) {
    throw new Error('Quality must be between 0 and 10')
  }

  if (timeoutMs !== undefined && (!Number.isFinite(timeoutMs) || timeoutMs <= 0)) {
    throw new Error('Timeout must be a positive number')
  }

  // Validate application
  const validApplications = ['audio', 'voip', 'lowdelay']
  if (!validApplications.includes(application)) {
    throw new Error(`Invalid application type. Must be one of: ${validApplications.join(', ')}`)
  }

  onLog('🎵 Converting audio to OGG Opus...')
  onLog(`   Input:  ${input}`)
  onLog(`   Output: ${outputPath}`)
  onLog(`   Bitrate: ${bitrate} ${vbr ? 'VBR' : 'CBR'}`)
  onLog(`   Quality: ${quality}/10`)
  onLog(`   Application: ${application}`)

  // Build FFmpeg args
  const vbrFlag = vbr ? 'on' : 'off'
  const args = [
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    input,
    '-c:a',
    'libopus',
    '-b:a',
    bitrate,
    '-vbr',
    vbrFlag,
    '-application',
    application,
    '-compression_level',
    String(quality),
    '-y',
    outputPath,
  ]

  await runFfmpeg(args, { ffmpegPath, timeoutMs, onLog })

  // Get file sizes
  const inputStats = await fs.stat(input)
  const outputStats = await fs.stat(outputPath)
  const inputSize = formatBytes(inputStats.size)
  const outputSize = formatBytes(outputStats.size)

  onLog('✅ Conversion complete!')
  onLog(`   Input size:  ${inputSize}`)
  onLog(`   Output size: ${outputSize}`)

  return {
    input,
    output: outputPath,
    inputSize,
    outputSize,
  }
}

/**
 * Format bytes to human-readable format
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
