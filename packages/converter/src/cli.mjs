#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { convertImage } from './image.mjs'
import { convertVideo } from './video.mjs'

const HELP_TEXT = `
media-converter - Convert media files using FFmpeg

USAGE:
  media-converter <command> [options]

COMMANDS:
  video       Convert video to AAC format
	image       Convert images to WebP format
  help        Show this help message

VIDEO OPTIONS:
  -i, --input <file>       Input video file (required)
  -o, --output <file>      Output file (default: input with .m4a extension)
  -b, --bitrate <rate>     Audio bitrate (default: 128k)
  -q, --quality <level>    AAC quality 0.1-2 (default: 1)
  --profile <profile>      AAC profile: aac_low, aac_he, aac_he_v2 (default: aac_low)

IMAGE OPTIONS:
	-i, --input <file>       Input image file (required)
	-o, --output <file>      Output file (default: input with .webp extension)
	-q, --quality <level>    WebP quality 1-100 (default: 80)
	--lossless               Enable lossless WebP (default: false)

EXAMPLES:
  # Extract audio from video and convert to AAC
  media-converter video -i movie.mp4 -o audio.m4a -b 192k

  # Convert video audio with high quality AAC
  media-converter video -i movie.mp4 -b 256k -q 2

	# Convert image to WebP
	media-converter image -i cover.png -q 85
`

function parseOptions(args) {
  const { values } = parseArgs({
    args,
    options: {
      input: { type: 'string', short: 'i' },
      output: { type: 'string', short: 'o' },
      bitrate: { type: 'string', short: 'b' },
      quality: { type: 'string', short: 'q' },
      lossless: { type: 'boolean' },
      profile: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
    strict: false,
  })

  return values
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === 'help' || args.includes('--help') || args.includes('-h')) {
    console.log(HELP_TEXT)
    process.exit(0)
  }

  const command = args[0]
  const options = parseOptions(args.slice(1))

  if (options.help) {
    console.log(HELP_TEXT)
    process.exit(0)
  }

  if (!options.input) {
    console.error('❌ Error: --input is required\n')
    console.log(HELP_TEXT)
    process.exit(1)
  }

  try {
    switch (command) {
      case 'video':
        await convertVideo({
          input: options.input,
          output: options.output,
          bitrate: options.bitrate || '128k',
          quality: options.quality ? Number.parseFloat(options.quality) : 1,
          profile: options.profile || 'aac_low',
        })
        break

      case 'image':
        await convertImage({
          input: options.input,
          output: options.output,
          quality: options.quality ? Number.parseInt(options.quality, 10) : 80,
          lossless: options.lossless || false,
        })
        break

      default:
        console.error(`❌ Unknown command: ${command}\n`)
        console.log(HELP_TEXT)
        process.exit(1)
    }
  } catch (error) {
    console.error(`❌ Conversion failed: ${error.message}`)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
