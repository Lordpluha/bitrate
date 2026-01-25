#!/usr/bin/env node
import { parseArgs } from "node:util"
import { convertAudio } from "./audio.mjs"
import { convertVideo } from "./video.mjs"

const HELP_TEXT = `
media-converter - Convert media files using FFmpeg

USAGE:
  media-converter <command> [options]

COMMANDS:
  audio       Convert audio to OGG Opus format
  video       Convert video to AAC format
  help        Show this help message

AUDIO OPTIONS:
  -i, --input <file>       Input audio file (required)
  -o, --output <file>      Output file (default: input with .opus extension)
  -b, --bitrate <rate>     Audio bitrate (default: 128k)
                           Options: 64k, 96k, 128k, 192k, 256k, 320k
  -q, --quality <level>    Compression level 0-10 (default: 10)
  -v, --vbr                Enable Variable Bitrate (default: CBR)
  --application <type>     Application type: audio, voip, lowdelay (default: audio)

VIDEO OPTIONS:
  -i, --input <file>       Input video file (required)
  -o, --output <file>      Output file (default: input with .m4a extension)
  -b, --bitrate <rate>     Audio bitrate (default: 128k)
  -q, --quality <level>    AAC quality 0.1-2 (default: 1)
  --profile <profile>      AAC profile: aac_low, aac_he, aac_he_v2 (default: aac_low)

EXAMPLES:
  # Convert audio to Opus with default settings (128k CBR)
  media-converter audio -i song.mp3

  # Convert audio with custom bitrate and VBR
  media-converter audio -i song.mp3 -o output.opus -b 192k -v

  # Extract audio from video and convert to AAC
  media-converter video -i movie.mp4 -o audio.m4a -b 192k

  # Convert video audio with high quality AAC
  media-converter video -i movie.mp4 -b 256k -q 2
`

function parseOptions(args) {
	const { values } = parseArgs({
		args,
		options: {
			input: { type: "string", short: "i" },
			output: { type: "string", short: "o" },
			bitrate: { type: "string", short: "b" },
			quality: { type: "string", short: "q" },
			vbr: { type: "boolean", short: "v" },
			application: { type: "string" },
			profile: { type: "string" },
			help: { type: "boolean", short: "h" },
		},
		strict: false,
	})

	return values
}

async function main() {
	const args = process.argv.slice(2)

	if (args.length === 0 || args[0] === "help" || args.includes("--help") || args.includes("-h")) {
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
		console.error("❌ Error: --input is required\n")
		console.log(HELP_TEXT)
		process.exit(1)
	}

	try {
		switch (command) {
			case "audio":
				await convertAudio({
					input: options.input,
					output: options.output,
					bitrate: options.bitrate || "128k",
					quality: options.quality ? Number.parseInt(options.quality, 10) : 10,
					vbr: options.vbr || false,
					application: options.application || "audio",
				})
				break

			case "video":
				await convertVideo({
					input: options.input,
					output: options.output,
					bitrate: options.bitrate || "128k",
					quality: options.quality ? Number.parseFloat(options.quality) : 1,
					profile: options.profile || "aac_low",
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

main()
