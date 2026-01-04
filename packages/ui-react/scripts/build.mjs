import { build } from "esbuild";
import { glob } from "glob";
import { exec } from "node:child_process";
import { copyFile, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

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

// Function to replace @/ aliases with relative paths
async function replaceAliasesInDir(dir) {
  const files = await readdir(dir, { withFileTypes: true, recursive: true });

  for (const file of files) {
    const filePath = path.join(file.parentPath || file.path, file.name);

    if (file.isDirectory()) {
      continue;
    }

    if (file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.mjs'))) {
      const content = await readFile(filePath, 'utf8');

      // Replace @/ imports with relative paths (handles both ESM and CommonJS)
      const replaced = content.replace(
        /(from\s+["']|require\(["'])@\/(.+?)(["'])/g,
        (match, prefix, importPath, suffix) => {
          const fileDir = path.dirname(filePath);
          // The importPath might not have extension, add .js
          const targetPath = path.join(dir, importPath + (importPath.endsWith('.js') ? '' : '.js'));
          let relativePath = path.relative(fileDir, targetPath);

          // Remove .js extension from import since esbuild doesn't add them
          relativePath = relativePath.replace(/\.js$/, '');

          // Ensure path starts with ./ or ../
          if (!relativePath.startsWith('.')) {
            relativePath = './' + relativePath;
          }

          // Normalize path separators for cross-platform
          relativePath = relativePath.replace(/\\/g, '/');

          return `${prefix}${relativePath}${suffix}`;
        }
      );

      if (replaced !== content) {
        await writeFile(filePath, replaced, 'utf8');
      }
    }
  }
}

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

    // Replace @/ aliases with relative paths
    console.log("Resolving path aliases...");
    await Promise.all([
      replaceAliasesInDir(path.resolve(__dirname, "..", "dist/esm")),
      replaceAliasesInDir(path.resolve(__dirname, "..", "dist/cjs")),
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
