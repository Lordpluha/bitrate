import { build } from "esbuild"
import { glob } from "glob"
import { exec } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"
import { aliasResolver } from "./alias-resolver.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const execAsync = promisify(exec)

export async function runBuild(options = {}) {
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

const sharedConfig = {
  entryPoints,
  outbase: "src",
  sourcemap: true,
  platform: "browser",
  target: ["es2020", "chrome90", "firefox88", "safari14", "edge90"],
  jsx: "automatic",
  packages: "external",
  loader: {
    ".css": "css",
  },
  logLevel: "info",
}

async function buildPackage(cwd, outdir, cssInput, cssOutput) {
  try {
    // Build ESM and CJS in parallel
    await Promise.all([
      build({
        ...sharedConfig,
        format: "esm",
        outdir: path.join(outdir, "esm"),
      }),
      build({
        ...sharedConfig,
        format: "cjs",
        outdir: path.join(outdir, "cjs"),
      }),
    ])

    console.log("✓ ESM and CJS builds completed")

    // Replace @/ aliases with relative paths
    console.log("Resolving path aliases...")
    await Promise.all([
      aliasResolver(path.join(cwd, outdir, "esm")),
      aliasResolver(path.join(cwd, outdir, "cjs")),
    ])
    console.log("✓ Path aliases resolved")

    // Compile CSS files with Tailwind CLI
    console.log("Compiling CSS files...")
    await Promise.all([
      execAsync(
        `pnpm dlx @tailwindcss/cli -i ${cssInput} -o ${cssOutput} --minify`,
        { cwd },
      ),
    ])
    console.log("✓ CSS files compiled")

    // Generate types
    console.log("Generating type definitions...")
    await execAsync(
      `pnpm tsc -p tsconfig.build.json --emitDeclarationOnly --declaration --declarationDir ${path.join(outdir, 'types')}`,
      { cwd }
    )
    console.log("✓ Type definitions generated")

    console.log("✅ Build completed successfully")
  } catch (error) {
    console.error("Build failed:", error)
    process.exit(1)
  }
}

  try {
    await buildPackage(cwd, outdir, cssInput, cssOutput);
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBuild();
}
