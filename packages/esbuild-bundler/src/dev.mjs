import { context } from "esbuild"
import { glob } from "glob"
import { exec } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { aliasResolver } from "./alias-resolver.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function runDev(options = {}) {
  const {
    cwd = process.cwd(),
    entry = 'src/**/*.{ts,tsx}',
    ignore = ['**/*.test.*', '**/*.stories.*', '**/__tests__/**'],
    outdir = 'dist',
    cssInput = './src/styles/index.css',
    cssOutput = './dist/globals.css',
  } = options;

  // Находим все .ts и .tsx файлы, кроме тестов и stories
  const entryPoints = await glob(entry, {
    cwd,
    ignore,
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

async function watchBuild(cwd, outdir, cssInput, cssOutput) {
  try {
    // Generate initial type definitions
    console.log("Generating type definitions...")
    const tscWatcher = exec(
      `pnpm tsc -p tsconfig.build.json --emitDeclarationOnly --declaration --declarationDir ${path.join(outdir, 'types')} --watch`,
      { cwd },
    )

    tscWatcher.stdout?.on("data", (data) => console.log(`[TypeScript] ${data.trim()}`))
    tscWatcher.stderr?.on("data", (data) => console.error(`[TypeScript] ${data.trim()}`))

    // Create watch contexts for both ESM and CJS
    const esmContext = await context({
      ...sharedConfig,
      format: "esm",
      outdir: path.join(outdir, "esm"),
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
                await aliasResolver(path.join(cwd, outdir, "esm"))
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
      outdir: path.join(outdir, "cjs"),
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
                await aliasResolver(path.join(cwd, outdir, "cjs"))
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
    const cssWatcher = exec(
      `pnpm dlx @tailwindcss/cli -i ${cssInput} -o ${cssOutput} --watch`,
      { cwd },
    )

    cssWatcher.stdout?.on("data", (data) => console.log(`[Tailwind CSS] ${data.trim()}`))
    cssWatcher.stderr?.on("data", (data) => console.error(`[Tailwind CSS] ${data.trim()}`))

    console.log("Press Ctrl+C to stop")

    // Keep the process running
    process.on("SIGINT", async () => {
      console.log("\n⏹️  Stopping watch mode...")
      tscWatcher.kill()
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

  try {
    await watchBuild(cwd, outdir, cssInput, cssOutput);
  } catch (error) {
    console.error("Watch failed:", error);
    process.exit(1);
  }
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDev();
}
