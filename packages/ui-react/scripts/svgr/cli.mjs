import path from "node:path"
import { fileURLToPath } from "node:url"
import { build } from "./modes/build.mjs"
import { dev } from "./modes/dev.mjs"
import { resolvePath } from "./utils/resolve-path.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Парсит аргументы командной строки
 */
function parseArgs(argv) {
  const args = {
    mode: null,
    input: null,
    output: null,
    variables: null,
  }

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]

    if (arg === "-i" || arg === "--input") {
      args.input = argv[++i]
    } else if (arg === "-o" || arg === "--output") {
      args.output = argv[++i]
    } else if (arg === "--variables" || arg === "--vars") {
      args.variables = argv[++i]
    } else if (!args.mode && (arg === "build" || arg === "dev" || arg === "watch")) {
      args.mode = arg
    }
  }

  return args
}

/**
 * Запускает CLI интерфейс
 */
export async function runCli() {
  const args = parseArgs(process.argv)

  if (!args.mode || !args.input || !args.output) {
    console.error("Usage: node svgr [build|dev] -i <inputDir> -o <outputDir> [--variables <vars>]")
    console.error("\nOptions:")
    console.error("  -i, --input      Input directory with SVG files")
    console.error("  -o, --output     Output directory for React components")
    console.error("  --variables      Comma-separated color variable names (optional)")
    console.error("\nExamples:")
    console.error("  node svgr build -i @spotify/tokens/icons -o src/icons/svgr")
    console.error("  node svgr build -i ../tokens/icons -o src/icons/svgr")
    console.error(
      '  node svgr build -i ../icons -o ./output --variables "primaryColor,secondaryColor"',
    )
    console.error("  node svgr dev --input @spotify/tokens/icons --output src/icons/svgr")
    process.exit(1)
  }

  try {
    // Разрешаем пути (поддержка как @scope/package/path, так и обычных путей)
    const basePath = path.resolve(__dirname, "../..")
    const inputDir = await resolvePath(args.input, basePath)
    const outputDir = args.output.startsWith("@")
      ? await resolvePath(args.output, basePath)
      : path.resolve(basePath, args.output)

    // Парсим имена переменных для цветов
    const colorVarNames = args.variables
      ? args.variables
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : []

    console.log(`📂 Input:  ${inputDir}`)
    console.log(`📂 Output: ${outputDir}`)
    if (colorVarNames.length > 0) {
      console.log(`🎨 Color variables: ${colorVarNames.join(", ")}`)
    }
    console.log()

    if (args.mode === "dev" || args.mode === "watch") {
      await dev(inputDir, outputDir, { colorVarNames })
    } else if (args.mode === "build") {
      await build(inputDir, outputDir, { colorVarNames })
    }
  } catch (error) {
    console.error("❌ Failed to resolve paths:", error.message)
    process.exit(1)
  }
}
