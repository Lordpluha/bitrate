import fs from "node:fs"
import path from "node:path"
import { promisify } from "node:util"
import { transform } from "@svgr/core"
import { createSvgrConfig } from "../config/svgr-config.mjs"
import { extractColorsWithMapping, isMonochrome } from "../utils/color-detection.mjs"
import { toPascalCase } from "../utils/naming.mjs"

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

/**
 * Конвертирует SVG в React компонент
 * @param {string} svgPath - путь к SVG файлу
 * @param {string} outputDir - директория для вывода
 * @param {string[]} colorVarNames - массив имён переменных для цветов
 */
export async function convertSvgToComponent(svgPath, outputDir, colorVarNames = []) {
  const svgContent = await readFile(svgPath, "utf-8")
  const filename = path.basename(svgPath)
  const componentName = toPascalCase(filename)

  // Определяем тип иконки и создаем соответствующую конфигурацию
  const monochromeIcon = isMonochrome(svgContent)

  // Извлекаем цвета и создаем mapping, если указаны имена переменных
  let colorMapping = null
  let originalColors = null

  if (colorVarNames.length > 0 && !monochromeIcon) {
    const { mapping, originals } = extractColorsWithMapping(svgContent, colorVarNames)
    colorMapping = mapping
    originalColors = originals
  }

  const svgrConfig = createSvgrConfig(monochromeIcon, colorMapping)

  try {
    let jsCode = await transform(
      svgContent,
      {
        ...svgrConfig,
        componentName,
      },
      { componentName, filePath: svgPath },
    )

    // Пост-процессинг: заменяем XML атрибуты на JSX-совместимые
    jsCode = jsCode
      .replace(/xmlns:xlink=/g, "xmlnsXlink=")
      .replace(/xlink:href=/g, "xlinkHref=")
      .replace(/xlink:type=/g, "xlinkType=")
      .replace(/xlink:role=/g, "xlinkRole=")
      .replace(/xlink:arcrole=/g, "xlinkArcrole=")
      .replace(/xlink:title=/g, "xlinkTitle=")
      .replace(/xlink:show=/g, "xlinkShow=")
      .replace(/xlink:actuate=/g, "xlinkActuate=")
      // Заменяем stroke-width на strokeWidth и другие атрибуты
      .replace(/stroke-width=/g, "strokeWidth=")
      .replace(/stroke-linecap=/g, "strokeLinecap=")
      .replace(/stroke-linejoin=/g, "strokeLinejoin=")
      .replace(/stroke-miterlimit=/g, "strokeMiterlimit=")
      .replace(/fill-rule=/g, "fillRule=")
      .replace(/clip-rule=/g, "clipRule=")
      .replace(/clip-path=/g, "clipPath=")

    // Если есть colorMapping, модифицируем сгенерированный код
    if (colorMapping && colorMapping.size > 0) {
      const varNames = Array.from(colorMapping.values())
      const colors = Array.from(colorMapping.keys())
      const propsInterface = varNames.map((name) => `  ${name}?: string`).join("\n")

      // Создаем параметры с дефолтными значениями: primaryColor = "#1ed760"
      const paramsWithDefaults = varNames
        .map((name, index) => {
          return `${name} = "${colors[index]}"`
        })
        .join(", ")
      const destructuredParams = `{ ${paramsWithDefaults}, ...props }`

      // Заменяем стандартную сигнатуру на кастомную с интерфейсом
      // Паттерн: export const ComponentName = (props: SVGProps<SVGSVGElement>)
      jsCode = jsCode.replace(
        /export const (\w+) = \(props: (?:SVGProps<SVGSVGElement>|React\.SVGProps<SVGSVGElement>)\)/,
        (_match, name) => {
          return `interface ${name}Props extends SVGProps<SVGSVGElement> {\n${propsInterface}\n}\n\nexport const ${name} = (${destructuredParams}: ${name}Props)`
        },
      )

      // Заменяем цвета на переменные в JSX (без fallback оператора)
      for (const [hexColor, varName] of colorMapping.entries()) {
        // Получаем оригинальное значение цвета (если есть)
        const originalColor = originalColors?.get(hexColor) || hexColor

        // Экранируем все спецсимволы regex для HEX
        const escapedHex = hexColor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        // Экранируем для оригинального значения
        const escapedOriginal = originalColor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

        // Заменяем fill="HEX" и fill="original" на fill={varName}
        jsCode = jsCode.replace(new RegExp(`fill="${escapedHex}"`, "gi"), `fill={${varName}}`)
        if (originalColor !== hexColor) {
          jsCode = jsCode.replace(
            new RegExp(`fill="${escapedOriginal}"`, "gi"),
            `fill={${varName}}`,
          )
        }

        // Заменяем stroke="HEX" и stroke="original" на stroke={varName}
        jsCode = jsCode.replace(new RegExp(`stroke="${escapedHex}"`, "gi"), `stroke={${varName}}`)
        if (originalColor !== hexColor) {
          jsCode = jsCode.replace(
            new RegExp(`stroke="${escapedOriginal}"`, "gi"),
            `stroke={${varName}}`,
          )
        }

        // Заменяем stopColor="HEX" и stopColor="original" на stopColor={varName}
        jsCode = jsCode.replace(
          new RegExp(`stopColor="${escapedHex}"`, "gi"),
          `stopColor={${varName}}`,
        )
        if (originalColor !== hexColor) {
          jsCode = jsCode.replace(
            new RegExp(`stopColor="${escapedOriginal}"`, "gi"),
            `stopColor={${varName}}`,
          )
        }
      }
    }

    const outputFilename = `${componentName}.tsx`
    const outputPath = path.join(outputDir, outputFilename)

    await mkdir(path.dirname(outputPath), { recursive: true })
    await writeFile(outputPath, jsCode, "utf-8")

    return { componentName, outputFilename, isMonochrome: monochromeIcon }
  } catch (error) {
    console.error(`❌ Error converting ${filename}:`, error.message)
    throw error
  }
}

/**
 * Генерирует index.ts файл с экспортами всех компонентов
 */
export async function generateIndexFile(components, outputDir) {
  const exports = components
    .map(({ outputFilename }) => {
      const modulePath = `./${outputFilename.replace(/\.tsx$/, "")}`
      return `export * from '${modulePath}'`
    })
    .join("\n")

  const indexPath = path.join(outputDir, "index.ts")
  await writeFile(indexPath, `${exports}\n`, "utf-8")
}
