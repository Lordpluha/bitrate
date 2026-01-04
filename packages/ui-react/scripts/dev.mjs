import path from "node:path";
import { fileURLToPath } from "node:url";
import { context } from "esbuild";
import { glob } from "glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  target: ["es2020"],
  jsx: "automatic",
  packages: "external",
  loader: {
    ".css": "css",
  },
};

async function watchBuild() {
  try {
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
              console.log("🔨 [ESM] Rebuilding...");
            });
            build.onEnd((result) => {
              if (result.errors.length > 0) {
                console.log("❌ [ESM] Build failed");
              } else {
                console.log("✓ [ESM] Build succeeded");
              }
            });
          },
        },
      ],
    });

    const cjsContext = await context({
      ...sharedConfig,
      format: "cjs",
      outdir: "dist/cjs",
      plugins: [
        {
          name: "rebuild-notify",
          setup(build) {
            build.onStart(() => {
              console.log("🔨 [CJS] Rebuilding...");
            });
            build.onEnd((result) => {
              if (result.errors.length > 0) {
                console.log("❌ [CJS] Build failed");
              } else {
                console.log("✓ [CJS] Build succeeded");
              }
            });
          },
        },
      ],
    });

    // Start watching
    await Promise.all([esmContext.watch(), cjsContext.watch()]);

    console.log("👀 Watching for changes...");
    console.log("Press Ctrl+C to stop");

    // Keep the process running
    process.on("SIGINT", async () => {
      console.log("\n⏹️  Stopping watch mode...");
      await esmContext.dispose();
      await cjsContext.dispose();
      process.exit(0);
    });
  } catch (error) {
    console.error("Watch failed:", error);
    process.exit(1);
  }
}

watchBuild();
