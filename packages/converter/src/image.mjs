import fs from "node:fs/promises"
import sharp from "sharp"

/**
 * Convert image file to WebP format
 * @param {Object} options - Conversion options
 * @param {string} options.input - Input image file path
 * @param {string} [options.output] - Output file path (default: input with .webp extension)
 * @param {number} [options.quality=80] - WebP quality (1-100)
 * @param {boolean} [options.lossless=false] - Enable lossless WebP
 * @returns {Promise<{input: string, output: string, inputSize: string, outputSize: string}>}
 */
export async function convertImage({ input, output, quality = 80, lossless = false }) {
	// Validate input file exists
	try {
		await fs.access(input)
	} catch {
		throw new Error(`Input file not found: ${input}`)
	}

	if (quality < 1 || quality > 100) {
		throw new Error("Quality must be between 1 and 100")
	}

	const outputPath = output || input.replace(/\.[^.]+$/, ".webp")

	console.log("🖼️  Converting image to WebP...")
	console.log(`   Input:  ${input}`)
	console.log(`   Output: ${outputPath}`)
	console.log(`   Quality: ${quality}`)
	console.log(`   Lossless: ${lossless}`)

	await sharp(input)
		.webp({ quality, lossless })
		.toFile(outputPath)

	const inputStats = await fs.stat(input)
	const outputStats = await fs.stat(outputPath)

	return {
		input,
		output: outputPath,
		inputSize: formatBytes(inputStats.size),
		outputSize: formatBytes(outputStats.size),
	}
}

function formatBytes(bytes) {
	if (bytes === 0) return "0 B"
	const k = 1024
	const sizes = ["B", "KB", "MB", "GB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
