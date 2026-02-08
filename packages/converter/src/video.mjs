import { execa } from "execa"
import ffmpegPath from "ffmpeg-static"
import fs from "node:fs/promises"

/**
 * Convert video audio to AAC format
 * @param {Object} options - Conversion options
 * @param {string} options.input - Input video file path
 * @param {string} [options.output] - Output file path (default: input with .m4a extension)
 * @param {string} [options.bitrate='128k'] - Audio bitrate (64k, 96k, 128k, 192k, 256k, 320k)
 * @param {number} [options.quality=1] - AAC quality 0.1-2 (higher is better, 1 is recommended)
 * @param {string} [options.profile='aac_low'] - AAC profile: aac_low, aac_he, aac_he_v2
 * @returns {Promise<{input: string, output: string, inputSize: string, outputSize: string}>}
 */
export async function convertVideo({
	input,
	output,
	bitrate = "128k",
	quality = 1,
	profile = "aac_low",
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
	const outputPath = output || input.replace(/\.[^.]+$/, ".m4a")

	// Validate bitrate
	const validBitrates = ["64k", "96k", "128k", "192k", "256k", "320k"]
	if (!validBitrates.includes(bitrate)) {
		console.warn(
			`⚠️  Warning: Unusual bitrate "${bitrate}". Common values: ${validBitrates.join(", ")}`,
		)
	}

	// Validate quality
	if (quality < 0.1 || quality > 2) {
		throw new Error("Quality must be between 0.1 and 2")
	}

	// Validate profile
	const validProfiles = ["aac_low", "aac_he", "aac_he_v2"]
	if (!validProfiles.includes(profile)) {
		throw new Error(`Invalid AAC profile. Must be one of: ${validProfiles.join(", ")}`)
	}

	console.log("🎬 Converting video audio to AAC...")
	console.log(`   Input:  ${input}`)
	console.log(`   Output: ${outputPath}`)
	console.log(`   Bitrate: ${bitrate}`)
	console.log(`   Quality: ${quality}`)
	console.log(`   Profile: ${profile}`)

	// Build FFmpeg args
	// -vn: no video output (audio only)
	// -c:a aac: use AAC codec
	// -b:a: audio bitrate
	// -q:a: quality setting
	// -profile:a: AAC profile
	const args = [
		"-hide_banner",
		"-loglevel",
		"error",
		"-i",
		input,
		"-vn",
		"-c:a",
		"aac",
		"-b:a",
		bitrate,
		"-q:a",
		String(quality),
		"-profile:a",
		profile,
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
