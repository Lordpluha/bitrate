import fs from "node:fs"
import path from "node:path"
import { glob } from "glob"

/**
 * Разрешает путь к пакету или возвращает обычный путь
 * Поддерживает: @scope/package/path, относительные пути, абсолютные пути
 * @param {string} inputPath - Входной путь (может быть относительным, абсолютным или к пакету)
 * @param {string} basePath - Базовый путь для разрешения относительных путей
 * @returns {string} - Разрешенный абсолютный путь
 */
export async function resolvePath(inputPath, basePath) {
  // Если это абсолютный путь - возвращаем как есть
  if (path.isAbsolute(inputPath)) {
    return inputPath
  }

  // Если это путь к пакету (начинается с @)
  if (inputPath.startsWith("@")) {
    const parts = inputPath.split("/")
    const scope = parts[0]
    const packageName = parts[1]
    const subPath = parts.slice(2).join("/")
    const fullPackageName = `${scope}/${packageName}`

    try {
      // Ищем корень монорепы (где находится pnpm-workspace.yaml)
      let currentDir = basePath
      let workspaceRoot = null

      while (currentDir !== path.parse(currentDir).root) {
        const workspaceFile = path.join(currentDir, "pnpm-workspace.yaml")
        const packageJsonFile = path.join(currentDir, "package.json")

        if (
          fs.existsSync(workspaceFile) ||
          (fs.existsSync(packageJsonFile) &&
            JSON.parse(fs.readFileSync(packageJsonFile, "utf-8")).workspaces)
        ) {
          workspaceRoot = currentDir
          break
        }

        currentDir = path.dirname(currentDir)
      }

      if (!workspaceRoot) {
        throw new Error("Workspace root not found")
      }

      // Читаем pnpm-workspace.yaml для поиска пакетов
      const workspaceYaml = path.join(workspaceRoot, "pnpm-workspace.yaml")
      let workspacePatterns = ["packages/*"]

      if (fs.existsSync(workspaceYaml)) {
        const yamlContent = fs.readFileSync(workspaceYaml, "utf-8")
        const patternsMatch = yamlContent.match(/packages:\s*\n((?:\s+-\s+.+\n?)+)/)
        if (patternsMatch) {
          workspacePatterns = patternsMatch[1]
            .split("\n")
            .map((line) => line.trim().replace(/^-\s+/, "").replace(/['"`]/g, ""))
            .filter(Boolean)
        }
      }

      // Ищем пакет в workspace
      for (const pattern of workspacePatterns) {
        const searchPattern = pattern.replace("*", "**")
        const packageDirs = await glob(searchPattern, {
          cwd: workspaceRoot,
          absolute: true,
          onlyDirectories: true,
        })

        for (const dir of packageDirs) {
          const pkgJsonPath = path.join(dir, "package.json")
          if (fs.existsSync(pkgJsonPath)) {
            const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"))
            if (pkgJson.name === fullPackageName) {
              return subPath ? path.join(dir, subPath) : dir
            }
          }
        }
      }

      throw new Error(`Package ${fullPackageName} not found in workspace`)
    } catch (error) {
      console.error(`Failed to resolve package path: ${inputPath}`, error.message)
      throw error
    }
  }

  // Обычный относительный путь
  return path.resolve(basePath, inputPath)
}
