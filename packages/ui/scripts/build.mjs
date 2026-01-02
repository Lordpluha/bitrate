import { exec } from "node:child_process";
import { copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { build } from "esbuild";
import { glob } from "glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);

// Находим все .ts и .tsx файлы, кроме тестов и stories
const entryPoints = await glob("src/**/*.{ts,tsx}", {
  cwd: path.resolve(__dirname, ".."),
  ignore: ["**/*.test.*", "**/*.stories.*", "**/__tests__/**"],
});

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
};

async function buildPackage() {
  try {
    // Build ESM and CJS in parallel
    await Promise.all([
      build({
        ...sharedConfig,
        format: "esm",
        outdir: "dist/esm",
      }),
      build({
        ...sharedConfig,
        format: "cjs",
        outdir: "dist/cjs",
      }),
    ]);

    console.log("✓ ESM and CJS builds completed");

    // Резолвим алиасы в скомпилированных файлах
    console.log("Resolving path aliases...");
    await Promise.all([
      execAsync("tsc-alias -p tsconfig.json --outDir dist/esm"),
      execAsync("tsc-alias -p tsconfig.json --outDir dist/cjs"),
    ]);
    console.log("✓ Path aliases resolved");

    // Copy CSS files
    console.log("Copying CSS files...");
    const srcDir = path.resolve(__dirname, "..");
    await Promise.all([
      copyFile(path.join(srcDir, "src/globals.css"), path.join(srcDir, "dist/esm/globals.css")),
      copyFile(path.join(srcDir, "src/globals.css"), path.join(srcDir, "dist/cjs/globals.css")),
    ]);
    console.log("✓ CSS files copied");

    // Generate types
    console.log("Generating type definitions...");
    await execAsync(
      "tsc -p tsconfig.build.json --emitDeclarationOnly --declaration --declarationDir dist/types",
    );
    console.log("✓ Type definitions generated");

    console.log("✅ Build completed successfully");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

buildPackage();
