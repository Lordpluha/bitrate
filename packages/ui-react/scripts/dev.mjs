import { context } from "esbuild"
import { glob } from "glob"
import { exec } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { aliasResolver } from "./alias-resolver.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Находим все .ts и .tsx файлы, кроме тестов и stories
const entryPoints = await glob("src/**/*.{ts,tsx}", {
  cwd: path.resolve(__dirname, ".."),
  ignore: ["**/*.test.*", "**/*.stories.*", "**/__tests__/**"],
})

/** @type {import("esbuild").BuildOptions} */
const sharedConfig = {
  entryPoints,
  outbase: "src",
  sourcemap: true,
  platform: "browser",
  target: ["es2020"],
  jsx: "automatic",
  packages: "external",
  loader: {
    ".css": "css",
  },
}

async function watchBuild() {
  try {
    // Generate initial type definitions
    console.log("Generating type definitions...")
    exec(
      "pnpm tsc -p tsconfig.build.json --emitDeclarationOnly --declaration --declarationDir dist/types --watch",
      (error, stdout, stderr) => {
        if (stdout) console.log(`[TypeScript] ${stdout.trim()}`)
        if (stderr) console.error(`[TypeScript] ${stderr.trim()}`)
      },
    )

    // Create watch contexts for both ESM and CJS
    const esmContext = await context({
      ...sharedConfig,
      format: "esm",
      outdir: "dist/esm",
      plugins: [
        {
          name: "rebuild-notify",
          setup(build) {
            build.onStart(() => {
              console.log("🔨 [ESM] Rebuilding...")
            })
            build.onEnd(async (result) => {
              if (result.errors.length > 0) {
                console.log("❌ [ESM] Build failed")
              } else {
                // Resolve aliases after successful build
                await aliasResolver(path.resolve(__dirname, "..", "dist/esm"))
                console.log("✓ [ESM] Build succeeded")
              }
            })
          },
        },
      ],
    })

    const cjsContext = await context({
      ...sharedConfig,
      format: "cjs",
      outdir: "dist/cjs",
      plugins: [
        {
          name: "rebuild-notify",
          setup(build) {
            build.onStart(() => {
              console.log("🔨 [CJS] Rebuilding...")
            })
            build.onEnd(async (result) => {
              if (result.errors.length > 0) {
                console.log("❌ [CJS] Build failed")
              } else {
                // Resolve aliases after successful build
                await aliasResolver(path.resolve(__dirname, "..", "dist/cjs"))
                console.log("✓ [CJS] Build succeeded")
              }
            })
          },
        },
      ],
    })

    // Start watching
    await Promise.all([esmContext.watch(), cjsContext.watch()])

    console.log("👀 Watching for changes...")

    // Start CSS watchers in background
    const srcDir = path.resolve(__dirname, "..")
    const cssWatcher = exec(
      `pnpm dlx @tailwindcss/cli -i ./src/styles/index.css -o ./dist/globals.css --watch`,
      { cwd: srcDir },
    )

    cssWatcher.stdout?.on("data", (data) => console.log(`[Tailwind CSS] ${data.trim()}`))
    cssWatcher.stderr?.on("data", (data) => console.error(`[Tailwind CSS] ${data.trim()}`))

    console.log("Press Ctrl+C to stop")

    // Keep the process running
    process.on("SIGINT", async () => {
      console.log("\n⏹️  Stopping watch mode...")
      cssWatcher.kill()
      await esmContext.dispose()
      await cjsContext.dispose()
      process.exit(0)
    })
  } catch (error) {
    console.error("Watch failed:", error)
    process.exit(1)
  }
}

watchBuild()
