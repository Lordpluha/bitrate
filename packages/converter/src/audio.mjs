import { execa } from "execa"
import ffmpegPath from "ffmpeg-static"
import fs from "node:fs/promises"

/**
 * Convert audio file to OGG Opus format
 * @param {Object} options - Conversion options
 * @param {string} options.input - Input audio file path
 * @param {string} [options.output] - Output file path (default: input with .opus extension)
 * @param {string} [options.bitrate='128k'] - Audio bitrate (64k, 96k, 128k, 192k, 256k, 320k)
 * @param {number} [options.quality=10] - Compression level 0-10 (10 is highest quality)
 * @param {boolean} [options.vbr=false] - Enable Variable Bitrate (default: CBR)
 * @param {string} [options.application='audio'] - Application type: audio, voip, lowdelay
 * @returns {Promise<{input: string, output: string, inputSize: string, outputSize: string}>}
 */
export async function convertAudio({
	input,
	output,
	bitrate = "128k",
	quality = 10,
	vbr = false,
	application = "audio",
}) {
	if (!ffmpegPath) {
		throw new Error("FFmpeg binary not found. Ensure ffmpeg-static is installed correctly.")
	}

	// Validate input file exists
	try {
		await fs.access(input)
	} catch (error) {
		throw new Error(`Input file not found: ${input}`)
	}

	// Determine output path
	const outputPath = output || input.replace(/\.[^.]+$/, ".opus")

	// Validate bitrate
	const validBitrates = ["64k", "96k", "128k", "192k", "256k", "320k"]
	if (!validBitrates.includes(bitrate)) {
		console.warn(
			`⚠️  Warning: Unusual bitrate "${bitrate}". Common values: ${validBitrates.join(", ")}`,
		)
	}

	// Validate quality
	if (quality < 0 || quality > 10) {
		throw new Error("Quality must be between 0 and 10")
	}

	// Validate application
	const validApplications = ["audio", "voip", "lowdelay"]
	if (!validApplications.includes(application)) {
		throw new Error(`Invalid application type. Must be one of: ${validApplications.join(", ")}`)
	}

	console.log("🎵 Converting audio to OGG Opus...")
	console.log(`   Input:  ${input}`)
	console.log(`   Output: ${outputPath}`)
	console.log(`   Bitrate: ${bitrate} ${vbr ? "VBR" : "CBR"}`)
	console.log(`   Quality: ${quality}/10`)
	console.log(`   Application: ${application}`)

	// Build FFmpeg args
	const vbrFlag = vbr ? "on" : "off"
	const args = [
		"-hide_banner",
		"-loglevel",
		"error",
		"-i",
		input,
		"-c:a",
		"libopus",
		"-b:a",
		bitrate,
		"-vbr",
		vbrFlag,
		"-application",
		application,
		"-compression_level",
		String(quality),
		"-y",
		outputPath,
	]

	try {
		await execa(ffmpegPath, args)

		// Get file sizes
		const inputStats = await fs.stat(input)
		const outputStats = await fs.stat(outputPath)
		const inputSize = formatBytes(inputStats.size)
		const outputSize = formatBytes(outputStats.size)

		console.log("✅ Conversion complete!")
		console.log(`   Input size:  ${inputSize}`)
		console.log(`   Output size: ${outputSize}`)

		return {
			input,
			output: outputPath,
			inputSize,
			outputSize,
		}
	} catch (error) {
		throw new Error(`FFmpeg error: ${error.message}`)
	}
}

/**
 * Format bytes to human-readable format
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
	if (bytes === 0) return "0 B"
	const k = 1024
	const sizes = ["B", "KB", "MB", "GB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
