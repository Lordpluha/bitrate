import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

// Function to replace @/ aliases with relative paths
export async function aliasResolver(dir) {
  const files = await readdir(dir, { withFileTypes: true, recursive: true })

  for (const file of files) {
    const filePath = path.join(file.parentPath || file.path, file.name)

    if (file.isDirectory()) {
      continue
    }

    if (file.isFile() && (file.name.endsWith(".js") || file.name.endsWith(".mjs"))) {
      const content = await readFile(filePath, "utf8")

      // Replace @/ imports with relative paths (handles both ESM and CommonJS)
      const replaced = content.replace(
        /(from\s+["']|require\(["'])@\/(.+?)(["'])/g,
        (_match, prefix, importPath, suffix) => {
          const fileDir = path.dirname(filePath)

          // Target path is within the same dist directory structure
          const targetPath = path.join(dir, importPath)
          let relativePath = path.relative(fileDir, targetPath)

          // Ensure path starts with ./ or ../
          if (!relativePath.startsWith(".")) {
            relativePath = `./${relativePath}`
          }

          // Normalize path separators for cross-platform
          relativePath = relativePath.replace(/\\/g, "/")

          return `${prefix}${relativePath}${suffix}`
        },
      )

      if (replaced !== content) {
        await writeFile(filePath, replaced, "utf8")
      }
    }
  }
}
